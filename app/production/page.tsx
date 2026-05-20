'use client'

/**
 * app/production/page.tsx — Modulo Operacao V4
 *
 * Migrado para ModuleShell em 2026-05-20 (pattern de /orders e /crm).
 * Sub-componentes extraidos para app/production/_components/.
 *
 * Side effects intactos:
 *   - changeStatus('printing') consome filamento do inventario e cria transacao financeira.
 *   - Logica copiada identicamente do monolito original — nao simplificada.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - PrinterBoard  (board de impressoras sempre visivelh)
 *       - ProjectFilter (select de projeto)
 *       - ActiveQueue   (fila ativa — mobile cards + desktop rows)
 *       - DoneList      (finalizados — compacto)
 *       - ProductionEmptyState (quando nao ha nada)
 *   Modal Adicionar
 *   Modal Editar
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback } from 'react'
import { useStore, uid }                  from '@/lib/store'
import type { ProductionItem, StockMovement, Transaction } from '@/lib/types'
import { Plus, Trash2 }                   from 'lucide-react'
import { Modal }                          from '@/components/Modal'
import { ModuleShell }                    from '@/components/dashboard/v4'

import '../globals-v4.css'

import type { ProductionStatus, ProductionFormData }  from './_components/types'
import { PRINTER_CONFIG }                             from './_components/helpers'
import { PrinterBoard }                               from './_components/PrinterBoard'
import { ProductionForm }                             from './_components/ProductionForm'
import { ProductionEmptyState }                       from './_components/ProductionEmptyState'
import { StatusBadge }                                from './_components/StatusBadge'
import { ProductionCardMobile, ProductionCardDesktop } from './_components/ProductionCard'

// ---------------------------------------------------------------------------
// Tipo de tab
// ---------------------------------------------------------------------------

type ProductionTab = 'active' | 'done' | 'all'

// ---------------------------------------------------------------------------
// Sub-componente inline: filtro de projeto
// ---------------------------------------------------------------------------

interface ProjectFilterProps {
  projects: { id: string; name: string }[]
  value:    string
  onChange: (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="production-project-filter" className="sr-only">
        Filtrar por projeto
      </label>
      <select
        id="production-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar producao por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function ProductionPage() {
  const { state, dispatch, loading } = useStore()

  // Estado de UI
  const [creating,      setCreating]      = useState(false)
  const [editing,       setEditing]       = useState<ProductionItem | null>(null)
  const [menuOpen,      setMenuOpen]      = useState<string | null>(null)
  const [filterPrinter, setFilterPrinter] = useState<'bambu' | 'flashforge' | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [activeTab,     setActiveTab]     = useState<ProductionTab>('active')
  const [searchQuery,   setSearchQuery]   = useState<string>('')

  // ---------------------------------------------------------------------------
  // Helpers de lookup
  // ---------------------------------------------------------------------------

  const orderProjectId = useCallback(
    (orderId: string) => state.orders.find((o) => o.id === orderId)?.projectId ?? '',
    [state.orders],
  )

  const projectName = useCallback(
    (id: string) => state.projects.find((p) => p.id === id)?.name ?? '',
    [state.projects],
  )

  // ---------------------------------------------------------------------------
  // Derivacoes de estado
  // ---------------------------------------------------------------------------

  /** Items filtrados por projeto. */
  const byProject = useMemo(() => {
    if (filterProject === 'all') return state.production
    return state.production.filter(
      (p) => orderProjectId(p.orderId) === filterProject,
    )
  }, [state.production, filterProject, orderProjectId])

  /** Items filtrados por impressora. */
  const byPrinter = useMemo(
    () =>
      filterPrinter === 'all'
        ? byProject
        : byProject.filter((p) => p.printer === filterPrinter),
    [byProject, filterPrinter],
  )

  /** Items filtrados por busca de texto. */
  const bySearch = useMemo(() => {
    if (!searchQuery.trim()) return byPrinter
    const q = searchQuery.toLowerCase()
    return byPrinter.filter(
      (p) =>
        p.item.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q),
    )
  }, [byPrinter, searchQuery])

  /** Fila ativa (sem finalizados), ordenada por prioridade. */
  const active = useMemo(
    () =>
      [...bySearch.filter((p) => p.status !== 'done')].sort(
        (a, b) => a.priority - b.priority,
      ),
    [bySearch],
  )

  /** Itens finalizados. */
  const done = useMemo(
    () => bySearch.filter((p) => p.status === 'done'),
    [bySearch],
  )

  /** Itens a exibir conforme tab ativa. */
  const visibleItems = useMemo(() => {
    if (activeTab === 'active') return active
    if (activeTab === 'done')   return done
    return bySearch
  }, [activeTab, active, done, bySearch])

  // ---------------------------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------------------------

  /** Impressoes ativas (queued + printing) — hero KPI. */
  const activeCount = state.production.filter((p) => p.status !== 'done').length

  /** Tempo total estimado restante (em andamento). */
  const totalHoursLeft = useMemo(
    () => active.reduce((s, p) => s + p.estimatedHours, 0),
    [active],
  )

  /** Lucro previsto dos pedidos linkados as impressoes ativas (order.value - productionCost). */
  const predictedProfit = useMemo(() => {
    return active.reduce((s, p) => {
      if (!p.orderId) return s
      const order = state.orders.find((o) => o.id === p.orderId)
      if (!order) return s
      const profit =
        order.productionCost != null
          ? order.value - order.productionCost
          : order.value
      return s + profit
    }, 0)
  }, [active, state.orders])

  // Eyebrow
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()
  const printingNow = state.production.filter((p) => p.status === 'printing').length

  // ---------------------------------------------------------------------------
  // Tabs para ModuleShell
  // ---------------------------------------------------------------------------

  const tabs = useMemo(
    () => [
      { id: 'active', label: 'Em andamento', count: active.length,             active: activeTab === 'active' },
      { id: 'done',   label: 'Finalizadas',  count: done.length,               active: activeTab === 'done'   },
      { id: 'all',    label: 'Todas',        count: bySearch.length,           active: activeTab === 'all'    },
    ],
    [active.length, done.length, bySearch.length, activeTab],
  )

  // ---------------------------------------------------------------------------
  // Handler de status com side effects (filamento + transacao)
  // RESTRICAO: logica identica ao original — nao simplificar.
  // ---------------------------------------------------------------------------

  const changeStatus = useCallback(
    (item: ProductionItem, status: ProductionStatus) => {
      dispatch({ type: 'UPDATE_PRODUCTION', payload: { ...item, status } })

      // Side effect duplo: consome filamento + cria despesa ao iniciar impressao.
      if (status === 'printing' && item.status !== 'printing') {
        const order   = state.orders.find((o) => o.id === item.orderId)
        const product = order?.productId
          ? state.products.find((p) => p.id === order.productId)
          : undefined
        const baseGrams  = product?.materialGrams ?? 0
        const filamentId = product?.inventoryItemId
        const filament   = filamentId
          ? state.inventory.find((i) => i.id === filamentId)
          : undefined

        const uso = filament?.filamentUso
        const canConsume = !uso || uso === 'impressao' || uso === 'ambos'

        if (
          product &&
          filament &&
          baseGrams > 0 &&
          filament.category === 'filament' &&
          canConsume
        ) {
          const totalGrams = baseGrams * (1 + (product.failureRate ?? 0.1))
          const delta =
            filament.unit === 'kg' ? -(totalGrams / 1000) : -totalGrams

          const movement: StockMovement = {
            id:        uid(),
            projectId: filament.projectId,
            itemId:    filament.id,
            type:      'out',
            quantity:  Math.abs(delta),
            reason:    'printing',
            date:      new Date().toISOString().slice(0, 10),
            notes:     `Impressao iniciada - ${product.name} (${totalGrams.toFixed(0)}g)`,
          }
          dispatch({
            type:    'ADJUST_STOCK',
            payload: { movement, itemId: filament.id, delta },
          })

          const costPerUnit  = filament.costPrice ?? 0
          const filamentCost =
            filament.unit === 'kg'
              ? costPerUnit * (totalGrams / 1000)
              : costPerUnit * totalGrams

          if (filamentCost > 0) {
            const transaction: Transaction = {
              id:          uid(),
              projectId:   filament.projectId,
              type:        'expense',
              value:       Math.round(filamentCost * 100) / 100,
              category:    'filament',
              description: `Filamento: ${product.name} (${totalGrams.toFixed(0)}g)`,
              date:        new Date().toISOString().slice(0, 10),
              source:      'Auto-gerado ao iniciar impressao',
            }
            dispatch({ type: 'ADD_TRANSACTION', payload: transaction })
          }
        }
      }

      setMenuOpen(null)
    },
    [dispatch, state.orders, state.products, state.inventory],
  )

  // ---------------------------------------------------------------------------
  // CRUD handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    (data: ProductionFormData) => {
      dispatch({
        type:    'ADD_PRODUCTION',
        payload: {
          id:             uid(),
          ...data,
          estimatedHours: parseFloat(data.estimatedHours) || 4,
          priority:       parseInt(data.priority)         || 1,
        },
      })
      setCreating(false)
    },
    [dispatch],
  )

  const handleEdit = useCallback(
    (data: ProductionFormData) => {
      if (!editing) return
      dispatch({
        type:    'UPDATE_PRODUCTION',
        payload: {
          ...editing,
          ...data,
          estimatedHours: parseFloat(data.estimatedHours) || 4,
          priority:       parseInt(data.priority)         || 1,
        },
      })
      setEditing(null)
    },
    [editing, dispatch],
  )

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_PRODUCTION', payload: id })
      setMenuOpen(null)
    },
    [dispatch],
  )

  const handleMenuToggle = useCallback(
    (id: string) => setMenuOpen((prev) => (prev === id ? null : id)),
    [],
  )

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as ProductionTab)
    setMenuOpen(null)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  // ---------------------------------------------------------------------------
  // Guard de loading
  // ---------------------------------------------------------------------------

  if (loading) return null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <ModuleShell
        eyebrow={`${mesAtual} · ${printingNow} IMPRIMINDO · ${active.length} NA FILA`}
        title="Operacao"
        titleItalicSuffix="ao vivo"
        livePhrase={
          activeCount > 0
            ? `${activeCount} ${activeCount === 1 ? 'impressao ativa' : 'impressoes ativas'}, ${totalHoursLeft.toFixed(1)}h estimadas.`
            : 'Fila vazia. Adicione um item para comecar.'
        }
        primaryAction={{
          label:   'Adicionar',
          onClick: () => setCreating(true),
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'IMPRESSOES ATIVAS',
          value:       String(activeCount),
          description:
            activeCount > 0
              ? `${printingNow} imprimindo agora, ${active.filter((p) => p.status === 'waiting').length} aguardando.`
              : 'Nenhuma impressao em andamento.',
        }}
        satelliteKpis={[
          {
            label:       'TEMPO RESTANTE',
            value:       totalHoursLeft > 0 ? `${totalHoursLeft.toFixed(1)}h` : 'livre',
            description: 'soma das impressoes ativas.',
            tone:        totalHoursLeft > 8 ? 'ember' : 'neutral',
          },
          {
            label:       'LUCRO PREVISTO',
            value:
              predictedProfit > 0
                ? `R$ ${Math.round(predictedProfit)}`
                : 'sem dados',
            description: 'pedidos linkados em andamento.',
            tone:        predictedProfit > 0 ? 'petrol' : 'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar item, cliente..."
        onSearch={handleSearch}
      >
        {/* Board de impressoras — sempre visivel, acima dos filtros */}
        <div className="mb-5">
          <PrinterBoard
            production={state.production}
            onStatusChange={changeStatus}
          />
        </div>

        {/* Filtros: projeto + impressora */}
        <ProjectFilter
          projects={state.projects}
          value={filterProject}
          onChange={setFilterProject}
        />

        {/* Filtro por impressora (tabs compactos) */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {(['all', 'bambu', 'flashforge'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPrinter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filterPrinter === p
                  ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                  : 'text-[#8888a0] border-transparent hover:text-[#f0f0f5]'
              }`}
              aria-pressed={filterPrinter === p}
              aria-label={`Filtrar por impressora: ${p === 'all' ? 'Todas' : PRINTER_CONFIG[p].label}`}
            >
              {p === 'all' ? 'Todas' : PRINTER_CONFIG[p].label}
            </button>
          ))}
        </div>

        {/* Conteudo da tab ativa */}
        {state.production.length === 0 ? (
          <ProductionEmptyState onAdd={() => setCreating(true)} />
        ) : (
          <>
            {/* Fila ativa */}
            {(activeTab === 'active' || activeTab === 'all') && active.length > 0 && (
              <section className="space-y-2 mb-6" aria-label="Fila ativa de producao">
                <h3 className="text-[#8888a0] text-xs font-medium uppercase tracking-wide">
                  Fila Ativa ({active.length})
                </h3>

                {/* Mobile */}
                <div className="sm:hidden space-y-2">
                  {active.map((item) => (
                    <ProductionCardMobile
                      key={item.id}
                      item={item}
                      projectLabel={
                        item.orderId
                          ? projectName(orderProjectId(item.orderId)) || undefined
                          : undefined
                      }
                      onChangeStatus={changeStatus}
                      onEdit={setEditing}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block space-y-2">
                  {active.map((item) => (
                    <ProductionCardDesktop
                      key={item.id}
                      item={item}
                      projectLabel={
                        item.orderId
                          ? projectName(orderProjectId(item.orderId)) || undefined
                          : undefined
                      }
                      menuOpen={menuOpen}
                      onMenuToggle={handleMenuToggle}
                      onChangeStatus={changeStatus}
                      onEdit={setEditing}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Finalizados */}
            {(activeTab === 'done' || activeTab === 'all') && done.length > 0 && (
              <section className="space-y-2" aria-label="Impressoes finalizadas">
                <h3 className="text-[#8888a0] text-xs font-medium uppercase tracking-wide">
                  Finalizados ({done.length})
                </h3>
                <div className="space-y-1.5">
                  {visibleItems
                    .filter((i) => i.status === 'done')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3 flex items-center gap-4 opacity-50 hover:opacity-70 transition-opacity"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[#8888a0] text-sm">{item.item}</p>
                          <p className="text-[#444455] text-xs">
                            {PRINTER_CONFIG[item.printer].label}
                            {item.clientName && ` - ${item.clientName}`}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-[#3a3a4a] hover:text-[#ef4444] transition-colors rounded-lg hover:bg-[#ef44441a]"
                          aria-label={`Remover item finalizado ${item.item}`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Nenhum resultado para busca/filtro */}
            {visibleItems.length === 0 && (
              <p className="text-center text-[#555566] text-sm py-12">
                Nenhum item encontrado para os filtros atuais.
              </p>
            )}
          </>
        )}
      </ModuleShell>

      {/* Modal: adicionar */}
      {creating && (
        <Modal title="Adicionar a Fila" onClose={() => setCreating(false)}>
          <ProductionForm
            orders={state.orders}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {/* Modal: editar */}
      {editing && (
        <Modal title="Editar Item" onClose={() => setEditing(null)}>
          <ProductionForm
            orders={state.orders}
            initial={{
              clientName:     editing.clientName,
              item:           editing.item,
              printer:        editing.printer,
              status:         editing.status,
              estimatedHours: String(editing.estimatedHours),
              priority:       String(editing.priority),
              orderId:        editing.orderId,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  )
}
