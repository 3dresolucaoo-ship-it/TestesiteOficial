'use client'

/**
 * Página de Inventário — orquestrador.
 *
 * Refatorado em 2026-05-19 (Felipe): 1001 linhas → ~250 linhas.
 * Sub-componentes em app/inventory/_components/:
 *   types.ts                  — ItemFormData, MovementFormData
 *   helpers.ts                — fmt, fmtShort, itemProfit, parseDate, CAT_COLORS
 *   CatBadge.tsx              — badge de categoria
 *   ImageUploader.tsx         — upload de imagem
 *   ItemCard.tsx              — card grid de item
 *   ItemRow.tsx               — linha de lista de item
 *   ItemForm.tsx              — form criação/edição de item
 *   MovementForm.tsx          — form entrada/saída de estoque
 *   InventoryKpiRow.tsx       — 4 cards KPI
 *   InventoryCatBreakdown.tsx — gráfico barras por categoria
 *   InventoryTopProfit.tsx    — top 5 itens por lucro potencial
 *   InventoryLowStockBanner.tsx — banner de alerta de estoque baixo
 *   InventoryFilters.tsx      — filtros, toggle de visualização, busca
 *   InventoryEmptyState.tsx   — estados vazios (vazio vs. sem resultados)
 *   InventoryMovementLog.tsx  — histórico collapsível de movimentações
 */

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import type { InventoryItem, InventoryCategory, StockMovement } from '@/lib/types'
import { INVENTORY_CATEGORY_LABELS } from '@/lib/types'
import { Plus, ArrowDownLeft, ArrowUpRight, Package } from 'lucide-react'
import { Modal } from '@/components/Modal'

import type { ItemFormData, MovementFormData } from './_components/types'
import { itemProfit } from './_components/helpers'
import { ItemForm }               from './_components/ItemForm'
import { MovementForm }           from './_components/MovementForm'
import { ItemCard }               from './_components/ItemCard'
import { ItemRow }                from './_components/ItemRow'
import { InventoryKpiRow }        from './_components/InventoryKpiRow'
import { InventoryCatBreakdown }  from './_components/InventoryCatBreakdown'
import { InventoryTopProfit }     from './_components/InventoryTopProfit'
import { InventoryLowStockBanner } from './_components/InventoryLowStockBanner'
import { InventoryFilters }       from './_components/InventoryFilters'
import { InventoryEmptyState }    from './_components/InventoryEmptyState'
import { InventoryMovementLog }   from './_components/InventoryMovementLog'

export default function InventoryPage() {
  const { state, dispatch, loading } = useStore()

  // ── Estado local de modais ────────────────────────────────────────────────
  const [creating, setCreating]       = useState(false)
  const [editing, setEditing]         = useState<InventoryItem | null>(null)
  const [movementCtx, setMovementCtx] = useState<{ item?: InventoryItem; type: 'in' | 'out' } | null>(null)

  // ── Estado local de filtros ───────────────────────────────────────────────
  const [filterProject, setFilterProject] = useState('all')
  const [filterCat,     setFilterCat]     = useState<InventoryCategory | 'all'>('all')
  const [search,        setSearch]        = useState('')
  const [sortBy,        setSortBy]        = useState<'name' | 'profit' | 'stock' | 'value'>('name')
  const [viewMode,      setViewMode]      = useState<'grid' | 'list'>('grid')

  const { inventory: allItems, movements: allMovements, projects } = state

  // ── Lista filtrada + ordenada ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allItems
    if (filterProject !== 'all') list = list.filter(i => i.projectId === filterProject)
    if (filterCat     !== 'all') list = list.filter(i => i.category  === filterCat)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'profit') return itemProfit(b) - itemProfit(a)
      if (sortBy === 'stock')  return b.quantity    - a.quantity
      if (sortBy === 'value')  return (b.costPrice * b.quantity) - (a.costPrice * a.quantity)
      return a.name.localeCompare(b.name, 'pt-BR')
    })
  }, [allItems, filterProject, filterCat, search, sortBy])

  // ── KPIs (escopo do filtro de projeto) ────────────────────────────────────
  const scopedItems          = filterProject === 'all' ? allItems : allItems.filter(i => i.projectId === filterProject)
  const lowStockList         = scopedItems.filter(i => i.quantity <= (i.minStock ?? 2))
  const stockValue           = scopedItems.reduce((s, i) => s + i.costPrice * i.quantity, 0)
  const profitPotentialTotal = scopedItems
    .filter(i => i.salePrice > 0 && i.costPrice > 0)
    .reduce((s, i) => s + itemProfit(i), 0)

  // Top 5 itens por lucro potencial
  const topProfitItems = [...scopedItems]
    .filter(i => i.salePrice > 0 && i.costPrice > 0 && i.quantity > 0)
    .sort((a, b) => itemProfit(b) - itemProfit(a))
    .slice(0, 5)

  // Breakdown por categoria para o gráfico
  const catValues = (Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[])
    .map(cat => ({
      cat,
      value: scopedItems.filter(i => i.category === cat).reduce((s, i) => s + i.costPrice * i.quantity, 0),
      count: scopedItems.filter(i => i.category === cat).length,
    }))
    .filter(c => c.count > 0)

  // Movimentações filtradas por projeto, mais recentes primeiro
  const movements = useMemo(() => {
    let list = allMovements
    if (filterProject !== 'all') list = list.filter(m => m.projectId === filterProject)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [allMovements, filterProject])

  // ── Helpers de lookup ─────────────────────────────────────────────────────
  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? '—'
  const itemName    = (id: string) => allItems.find(i => i.id === id)?.name ?? id

  // ── Handlers de escrita ───────────────────────────────────────────────────
  function handleCreate(data: ItemFormData) {
    dispatch({
      type: 'ADD_INVENTORY',
      payload: {
        id:          uid(),
        projectId:   data.projectId,
        category:    data.category,
        name:        data.name.trim(),
        sku:         data.sku.trim(),
        quantity:    parseFloat(data.quantity)  || 0,
        unit:        data.unit,
        costPrice:   parseFloat(data.costPrice) || 0,
        salePrice:   parseFloat(data.salePrice) || 0,
        notes:       data.notes.trim(),
        minStock:    parseInt(data.minStock)    || 2,
        imageUrl:    data.imageUrl.trim() || undefined,
        filamentUso: data.category === 'filament' && data.filamentUso ? data.filamentUso : undefined,
      },
    })
  }

  function handleEdit(data: ItemFormData) {
    if (!editing) return
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        ...editing,
        projectId:   data.projectId,
        category:    data.category,
        name:        data.name.trim(),
        sku:         data.sku.trim(),
        quantity:    parseFloat(data.quantity)  || 0,
        unit:        data.unit,
        costPrice:   parseFloat(data.costPrice) || 0,
        salePrice:   parseFloat(data.salePrice) || 0,
        notes:       data.notes.trim(),
        minStock:    parseInt(data.minStock)    || 2,
        imageUrl:    data.imageUrl.trim() || undefined,
        filamentUso: data.category === 'filament' && data.filamentUso ? data.filamentUso : undefined,
      },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_INVENTORY', payload: id })
  }

  function handleMovement(data: MovementFormData) {
    const qty    = parseFloat(data.quantity) || 0
    const delta  = data.type === 'in' ? qty : -qty
    const target = allItems.find(i => i.id === data.itemId)
    if (!target) return
    const movement: StockMovement = {
      id:        uid(),
      projectId: target.projectId,
      itemId:    data.itemId,
      type:      data.type,
      quantity:  qty,
      reason:    data.reason,
      date:      data.date,
      notes:     data.notes,
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: data.itemId, delta } })
  }

  function quickAdjust(item: InventoryItem, delta: number) {
    const movement: StockMovement = {
      id:        uid(),
      projectId: item.projectId,
      itemId:    item.id,
      type:      delta > 0 ? 'in' : 'out',
      quantity:  Math.abs(delta),
      reason:    delta > 0 ? 'purchase' : 'adjustment',
      date:      new Date().toISOString().slice(0, 10),
      notes:     '',
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: item.id, delta } })
  }

  // ── Guard: loading / sem projetos ─────────────────────────────────────────
  if (loading) return null

  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="text-[#2a2a2a] mb-4" />
          <p className="text-[#555555] text-sm">
            Nenhum projeto encontrado. Crie um projeto primeiro para gerenciar o estoque.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Estoque Global</h2>
          <p className="text-[#555555] text-sm">
            {allItems.length} {allItems.length === 1 ? 'item' : 'itens'} em{' '}
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMovementCtx({ type: 'in' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowDownLeft size={14} /> Entrada
          </button>
          <button
            onClick={() => setMovementCtx({ type: 'out' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowUpRight size={14} /> Saída
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Novo Item
          </button>
        </div>
      </div>

      {/* KPIs */}
      <InventoryKpiRow
        totalItems={scopedItems.length}
        stockValue={stockValue}
        profitPotential={profitPotentialTotal}
        lowStockCount={lowStockList.length}
      />

      {/* Breakdown por categoria */}
      <InventoryCatBreakdown catValues={catValues} />

      {/* Top itens por lucro potencial */}
      <InventoryTopProfit items={topProfitItems} profitPotentialTotal={profitPotentialTotal} />

      {/* Banner de estoque baixo */}
      <InventoryLowStockBanner items={lowStockList} />

      {/* Barra de filtros */}
      <InventoryFilters
        projects={projects}
        scopedItems={scopedItems}
        filterProject={filterProject}
        filterCat={filterCat}
        search={search}
        sortBy={sortBy}
        viewMode={viewMode}
        onFilterProject={setFilterProject}
        onFilterCat={setFilterCat}
        onSearch={setSearch}
        onSortBy={setSortBy}
        onViewMode={setViewMode}
      />

      {/* Lista de itens */}
      {filtered.length === 0 ? (
        <InventoryEmptyState
          mode={allItems.length === 0 ? 'empty' : 'no-results'}
          onCreateClick={() => setCreating(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              projectName={projectName(item.projectId)}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onMovement={type => setMovementCtx({ item, type })}
              onQuickAdjust={delta => quickAdjust(item, delta)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              projectName={projectName(item.projectId)}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onMovement={type => setMovementCtx({ item, type })}
              onQuickAdjust={delta => quickAdjust(item, delta)}
            />
          ))}
        </div>
      )}

      {/* Histórico de movimentações */}
      <InventoryMovementLog
        movements={movements}
        itemName={itemName}
        projectName={projectName}
      />

      {/* Modais */}
      {creating && (
        <Modal title="Novo Item de Estoque" onClose={() => setCreating(false)}>
          <ItemForm
            projects={projects}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Item" onClose={() => setEditing(null)}>
          <ItemForm
            projects={projects}
            initial={{
              projectId:   editing.projectId,
              category:    editing.category,
              name:        editing.name,
              sku:         editing.sku,
              quantity:    String(editing.quantity),
              unit:        editing.unit,
              costPrice:   String(editing.costPrice),
              salePrice:   String(editing.salePrice),
              notes:       editing.notes,
              minStock:    String(editing.minStock ?? 2),
              imageUrl:    editing.imageUrl ?? '',
              filamentUso: editing.filamentUso ?? '',
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {movementCtx !== null && (
        <Modal
          title={movementCtx.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
          onClose={() => setMovementCtx(null)}
        >
          <MovementForm
            items={filterProject === 'all' ? allItems : allItems.filter(i => i.projectId === filterProject)}
            defaultItemId={movementCtx.item?.id}
            defaultType={movementCtx.type}
            onSave={handleMovement}
            onClose={() => setMovementCtx(null)}
          />
        </Modal>
      )}
    </div>
  )
}
