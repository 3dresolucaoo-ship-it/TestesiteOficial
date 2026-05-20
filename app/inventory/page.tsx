'use client'

/**
 * app/inventory/page.tsx — Modulo de Inventario V4.8
 *
 * Migrado para ModuleShell em 2026-05-20 (onda 3c.2).
 * Funcionalidade 100% preservada: filtros, modais, grid/lista, movimentacoes.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow V4 + FilterBar por categoria)
 *     children:
 *       - InventoryCatBreakdown
 *       - InventoryTopProfit
 *       - InventoryLowStockBanner
 *       - InventoryFilters (filtro projeto + sortBy + viewMode + search)
 *       - Grid/Lista de itens
 *       - InventoryMovementLog
 *   Modais: Novo Item / Editar Item / Movimentacao
 *
 * KPIs V4:
 *   Hero  — valor total em estoque (R$)
 *   Sat 1 — total de itens
 *   Sat 2 — alertas de estoque baixo (tone ember/red se >0)
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { InventoryItem, InventoryCategory, StockMovement } from '@/lib/types'
import { INVENTORY_CATEGORY_LABELS } from '@/lib/types'
import { Plus, ArrowDownLeft, ArrowUpRight, Package } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { ModuleShell, V4ThemeProvider } from '@/components/dashboard/v4'

// CSS V4 do ModuleShell (mesmo pattern de /orders e /dashboard).
// Sem isso, page-header / kpi-card / filter-bar viram texto plano.
import '../globals-v4.css'

import type { ItemFormData, MovementFormData } from './_components/types'
import { itemProfit, fmtShort } from './_components/helpers'
import { ItemForm }                from './_components/ItemForm'
import { MovementForm }            from './_components/MovementForm'
import { ItemCard }                from './_components/ItemCard'
import { ItemRow }                 from './_components/ItemRow'
import { InventoryCatBreakdown }   from './_components/InventoryCatBreakdown'
import { InventoryTopProfit }      from './_components/InventoryTopProfit'
import { InventoryLowStockBanner } from './_components/InventoryLowStockBanner'
import { InventoryFilters }        from './_components/InventoryFilters'
import { InventoryEmptyState }     from './_components/InventoryEmptyState'
import { InventoryMovementLog }    from './_components/InventoryMovementLog'

// ---------------------------------------------------------------------------
// Tipos de tab (categorias + "todos")
// ---------------------------------------------------------------------------

type InvTabId = 'all' | InventoryCategory

const CATEGORY_TABS: Array<{ id: InvTabId; label: string }> = [
  { id: 'all',       label: 'Todos' },
  { id: 'filament',  label: 'Filamentos' },
  { id: 'product',   label: 'Pecas' },
  { id: 'equipment', label: 'Equipamentos' },
  { id: 'other',     label: 'Outros' },
]

// ---------------------------------------------------------------------------
// Formatadores
// ---------------------------------------------------------------------------

function fmtBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function InventoryPage() {
  const { state, dispatch, loading } = useStore()

  // Estado local de modais
  const [creating,     setCreating]     = useState(false)
  const [editing,      setEditing]      = useState<InventoryItem | null>(null)
  const [movementCtx,  setMovementCtx]  = useState<{ item?: InventoryItem; type: 'in' | 'out' } | null>(null)

  // Estado local de filtros internos (filterCat gerenciado pelo ModuleShell via tab)
  const [filterProject, setFilterProject] = useState('all')
  const [filterCat,     setFilterCat]     = useState<InvTabId>('all')
  const [search,        setSearch]        = useState('')
  const [sortBy,        setSortBy]        = useState<'name' | 'profit' | 'stock' | 'value'>('name')
  const [viewMode,      setViewMode]      = useState<'grid' | 'list'>('grid')

  const { inventory: allItems, movements: allMovements, projects } = state

  // ── KPIs (escopo do filtro de projeto) ────────────────────────────────────
  const scopedItems = useMemo(
    () => filterProject === 'all' ? allItems : allItems.filter(i => i.projectId === filterProject),
    [allItems, filterProject],
  )

  const lowStockList = useMemo(
    () => scopedItems.filter(i => i.quantity <= (i.minStock ?? 2)),
    [scopedItems],
  )

  const stockValue = useMemo(
    () => scopedItems.reduce((s, i) => s + i.costPrice * i.quantity, 0),
    [scopedItems],
  )

  const profitPotentialTotal = useMemo(
    () =>
      scopedItems
        .filter(i => i.salePrice > 0 && i.costPrice > 0)
        .reduce((s, i) => s + itemProfit(i), 0),
    [scopedItems],
  )

  const topProfitItems = useMemo(
    () =>
      [...scopedItems]
        .filter(i => i.salePrice > 0 && i.costPrice > 0 && i.quantity > 0)
        .sort((a, b) => itemProfit(b) - itemProfit(a))
        .slice(0, 5),
    [scopedItems],
  )

  const catValues = useMemo(
    () =>
      (Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[])
        .map(cat => ({
          cat,
          value: scopedItems.filter(i => i.category === cat).reduce((s, i) => s + i.costPrice * i.quantity, 0),
          count: scopedItems.filter(i => i.category === cat).length,
        }))
        .filter(c => c.count > 0),
    [scopedItems],
  )

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

  // Movimentacoes filtradas por projeto
  const movements = useMemo(() => {
    let list = allMovements
    if (filterProject !== 'all') list = list.filter(m => m.projectId === filterProject)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [allMovements, filterProject])

  // ── Helpers de lookup ─────────────────────────────────────────────────────
  const projectName = useCallback(
    (id: string) => projects.find(p => p.id === id)?.name ?? 'Projeto',
    [projects],
  )

  const itemName = useCallback(
    (id: string) => allItems.find(i => i.id === id)?.name ?? id,
    [allItems],
  )

  // ── Tabs para ModuleShell (contagem por categoria, excluindo filterProject) ──
  const tabs = useMemo(
    () =>
      CATEGORY_TABS.map(t => ({
        id:     t.id,
        label:  t.label,
        count:  t.id === 'all'
          ? scopedItems.length
          : scopedItems.filter(i => i.category === t.id).length,
        active: t.id === filterCat,
      })),
    [scopedItems, filterCat],
  )

  // ── Frase viva do header ──────────────────────────────────────────────────
  const livePhrase = useMemo(() => {
    if (lowStockList.length > 0) {
      return (
        <>
          {lowStockList.length} {lowStockList.length === 1 ? 'item abaixo do estoque minimo.' : 'itens abaixo do estoque minimo.'}
        </>
      )
    }
    return (
      <>
        {scopedItems.length} {scopedItems.length === 1 ? 'item cadastrado.' : 'itens cadastrados.'}{' '}
        {profitPotentialTotal > 0 ? `Potencial ${fmtShort(profitPotentialTotal)}.` : ''}
      </>
    )
  }, [lowStockList.length, scopedItems.length, profitPotentialTotal])

  // ── Handlers de CRUD ──────────────────────────────────────────────────────
  const handleCreate = useCallback(
    (data: ItemFormData) => {
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
      setCreating(false)
    },
    [dispatch],
  )

  const handleEdit = useCallback(
    (data: ItemFormData) => {
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
    },
    [editing, dispatch],
  )

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_INVENTORY', payload: id })
    },
    [dispatch],
  )

  const handleMovement = useCallback(
    (data: MovementFormData) => {
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
      setMovementCtx(null)
    },
    [allItems, dispatch],
  )

  const quickAdjust = useCallback(
    (item: InventoryItem, delta: number) => {
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
    },
    [dispatch],
  )

  const handleTabChange = useCallback(
    (id: string) => { setFilterCat(id as InvTabId) },
    [],
  )

  const handleSearch = useCallback((q: string) => { setSearch(q) }, [])

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return null

  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="text-[#2a2a2a] mb-4" aria-hidden="true" />
          <p className="text-[#555555] text-sm">
            Nenhum projeto encontrado. Crie um projeto primeiro para gerenciar o estoque.
          </p>
        </div>
      </div>
    )
  }

  // Mes corrente para eyebrow
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · ${scopedItems.length} ITENS · ${lowStockList.length > 0 ? `${lowStockList.length} ALERTAS` : 'ESTOQUE OK'}`}
        title="Estoque"
        titleItalicSuffix="em tempo real"
        livePhrase={livePhrase}
        primaryAction={{
          label:   'Novo Item',
          onClick: () => setCreating(true),
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        secondaryAction={{
          label:   'Entrada / Saida',
          onClick: () => setMovementCtx({ type: 'in' }),
          icon:    <ArrowDownLeft size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'VALOR EM ESTOQUE (CUSTO)',
          value:       fmtBRL(stockValue),
          description: `${scopedItems.length} itens catalogados.`,
        }}
        satelliteKpis={[
          {
            label:       'FILAMENTOS EM KG',
            value:       (() => {
              const kgTotal = scopedItems
                .filter(i => i.category === 'filament')
                .reduce((s, i) => {
                  // unit pode ser 'kg' ou 'g' — normaliza pra kg
                  const kg = i.unit === 'g' ? i.quantity / 1000 : i.quantity
                  return s + kg
                }, 0)
              return kgTotal > 0 ? `${kgTotal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg` : 'sem dados'
            })(),
            description: `${scopedItems.filter(i => i.category === 'filament').length} rolos/bobinas.`,
            tone:        'neutral',
          },
          {
            label:     'ESTOQUE BAIXO',
            value:     String(lowStockList.length),
            alertText: lowStockList.length > 0 ? 'reposicao necessaria' : undefined,
            tone:      lowStockList.length > 0 ? 'ember' : 'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar item, SKU..."
        onSearch={handleSearch}
      >
        {/* Breakdown por categoria */}
        <InventoryCatBreakdown catValues={catValues} />

        {/* Top itens por lucro potencial */}
        <InventoryTopProfit items={topProfitItems} profitPotentialTotal={profitPotentialTotal} />

        {/* Banner de estoque baixo */}
        <InventoryLowStockBanner items={lowStockList} />

        {/* Filtros internos (projeto + sortBy + viewMode) — busca gerenciada pelo ModuleShell */}
        <InventoryFilters
          projects={projects}
          scopedItems={scopedItems}
          filterProject={filterProject}
          filterCat={filterCat === 'all' ? 'all' : filterCat}
          search={search}
          sortBy={sortBy}
          viewMode={viewMode}
          onFilterProject={setFilterProject}
          onFilterCat={(cat) => setFilterCat(cat as InvTabId)}
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

        {/* Historico de movimentacoes */}
        <InventoryMovementLog
          movements={movements}
          itemName={itemName}
          projectName={projectName}
        />
      </ModuleShell>

      {/* Modal: novo item */}
      {creating && (
        <Modal title="Novo Item de Estoque" onClose={() => setCreating(false)}>
          <ItemForm
            projects={projects}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {/* Modal: editar item */}
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

      {/* Modal: movimentacao */}
      {movementCtx !== null && (
        <Modal
          title={movementCtx.type === 'in' ? 'Registrar Entrada' : 'Registrar Saida'}
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

      {/* Botao flutuante de saida — atalho mobile */}
      <button
        type="button"
        onClick={() => setMovementCtx({ type: 'out' })}
        className="fixed bottom-20 right-4 sm:hidden flex items-center gap-1.5 text-[#888888] bg-[#141414] border border-[#2a2a2a] px-3 py-2 rounded-full text-xs shadow-lg z-20"
        aria-label="Registrar saida de estoque"
      >
        <ArrowUpRight size={13} aria-hidden="true" /> Saida
      </button>
    </>
  )
}
