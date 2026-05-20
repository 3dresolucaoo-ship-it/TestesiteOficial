'use client'

/**
 * app/orders/page.tsx — Modulo de Pedidos V4.8
 *
 * Migrado para ModuleShell em 2026-05-19 (pattern orders-v4-tom-novo.html).
 * Funcionalidade 100% preservada: filtros, modais, OrderForm, OrderCostPreview,
 * tabela desktop, cards mobile, empty states maker BR.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - ProjectFilter (select de projeto — nao tem slot nativo no FilterBar)
 *       - MobileCards   (sm:hidden)
 *       - DesktopTable  (hidden sm:block)
 *   Modal Novo Pedido
 *   Modal Editar Pedido
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { useStore, uid }                  from '@/lib/store'
import { isSupabaseConfigured }           from '@/lib/supabaseClient'
import type { Order, OrderStatus }        from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Cpu, ShoppingCart, Download, Filter } from 'lucide-react'
import { Modal }                          from '@/components/Modal'
import { calcUnitCost }                   from '@/core/analytics/productionEngine'
import { ModuleShell, V4ThemeProvider }   from '@/components/dashboard/v4'
import { UnderlineMarker }                from '@/components/visual-library'
import {
  isoWeekNumber,
  totalEntreguesNoMes,
  calcSubtitleData,
  calcHeroKpiData,
  calcAtrasadosData,
  diasAtraso,
} from '@/services/ordersMetrics'

// CSS V4 do ModuleShell (mesmo pattern do /dashboard — scoped por rota).
// Sem isso, page-header / kpi-card / filter-bar viram texto plano.
import '../globals-v4.css'

// Componentes extraidos (refactor 2026-05-16)
import {
  ORDER_STATUS_CONFIG,
  ORDER_ORIGIN_LABELS,
  ORDER_ORIGIN_COLORS,
  type OrderFormData,
} from './_components/helpers'
import { OrderStatusBadge } from './_components/Badge'
import { OrderForm }        from './_components/OrderForm'

// ---------------------------------------------------------------------------
// Helpers de formatacao
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toFixed(2)
}

function fmtBRL(n: number): string {
  return `R$ ${n.toFixed(0)}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ---------------------------------------------------------------------------
// Constante de tab "todos"
// ---------------------------------------------------------------------------

const ALL = 'all'

// ---------------------------------------------------------------------------
// Tipo do tab id (uniao literal)
// ---------------------------------------------------------------------------

type TabId = typeof ALL | OrderStatus

// ---------------------------------------------------------------------------
// Sub-componente: filtro de projeto (nao tem slot nativo no ModuleShell FilterBar)
// ---------------------------------------------------------------------------

interface ProjectFilterProps {
  projects:  { id: string; name: string }[]
  value:     string
  onChange:  (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="order-project-filter" className="sr-only">
        Filtrar por projeto
      </label>
      <select
        id="order-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar pedidos por projeto"
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
// Sub-componente: cards mobile
// ---------------------------------------------------------------------------

interface MobileCardsProps {
  orders:      Order[]
  projectName: (id: string) => string
  productName: (id: string | undefined) => string | undefined
  onEdit:      (o: Order) => void
  onDelete:    (id: string) => void
}

function MobileCards({ orders, projectName, productName, onEdit, onDelete }: MobileCardsProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <ShoppingCart size={32} className="text-[hsl(173_30%_57%)] mb-3" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground mb-1.5">
          Sua primeira venda esta esperando
        </h3>
        <p className="text-xs text-foreground/65 leading-relaxed max-w-xs">
          Registre pedidos do WhatsApp, Instagram ou Mercado Livre aqui. O Hayzer conecta o pedido
          ao produto e desconta o filamento.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const pName = productName(o.productId)
        return (
          <div
            key={o.id}
            className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="text-[#ebebeb] font-medium text-sm">{o.clientName}</p>
                <p className="text-[#555555] text-xs mt-0.5 truncate">{o.item}</p>
                {pName && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Cpu size={10} className="text-[hsl(173_58%_35%)]" aria-hidden="true" />
                    <span className="text-[hsl(173_58%_35%)] text-[10px]">{pName}</span>
                  </div>
                )}
                <p className="text-[#3a3a3a] text-xs mt-0.5">
                  {projectName(o.projectId)} · {fmtDate(o.date)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#ebebeb] font-semibold text-sm">R$ {fmt(o.value)}</p>
                {o.productionCost != null && (
                  <p className="text-[#555555] text-[10px]">custo R$ {fmt(o.productionCost)}</p>
                )}
                <div className="mt-1">
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#1c1c1c] pt-3">
              <span className={`text-xs font-medium ${ORDER_ORIGIN_COLORS[o.origin]}`}>
                {ORDER_ORIGIN_LABELS[o.origin]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(o)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] text-xs transition-colors"
                  aria-label={`Editar pedido de ${o.clientName}`}
                >
                  <Pencil size={12} aria-hidden="true" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(o.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef44441a] text-xs transition-colors"
                  aria-label={`Excluir pedido de ${o.clientName}`}
                >
                  <Trash2 size={12} aria-hidden="true" /> Excluir
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: tabela desktop
// ---------------------------------------------------------------------------

interface DesktopTableProps {
  orders:      Order[]
  projectName: (id: string) => string
  menuOpen:    string | null
  onMenuToggle:(id: string) => void
  onEdit:      (o: Order) => void
  onDelete:    (id: string) => void
  today:       Date
}

function DesktopTable({ orders, projectName, menuOpen, onMenuToggle, onEdit, onDelete, today }: DesktopTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6">
        <div
          className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
          style={{
            background: 'hsl(173 58% 28% / 0.12)',
            border: '1px solid hsl(173 58% 28% / 0.25)',
          }}
          aria-hidden="true"
        >
          <ShoppingCart size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
          Sua primeira venda esta esperando
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed mb-2">
          Registre pedidos do WhatsApp, Instagram ou Mercado Livre aqui.
        </p>
        <p className="text-sm text-foreground/60 leading-relaxed">
          O Hayzer conecta o pedido ao produto e desconta o filamento do estoque automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" aria-label="Lista de pedidos">
        <thead>
          <tr className="border-b border-[#2a2a2a]">
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Cliente
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Projeto
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">
              Origem
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">
              Item
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Valor
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">
              Custo
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Status
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Acao
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const margin =
              o.productionCost != null && o.value > 0
                ? ((o.value - o.productionCost) / o.value) * 100
                : null
            return (
              <tr
                key={o.id}
                className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-[#ebebeb] text-sm font-medium">{o.clientName}</p>
                  <p className="text-[#555555] text-xs">{fmtDate(o.date)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#888888] text-sm">{projectName(o.projectId)}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-sm font-medium ${ORDER_ORIGIN_COLORS[o.origin]}`}>
                    {ORDER_ORIGIN_LABELS[o.origin]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div>
                    <span className="text-[#888888] text-sm truncate max-w-[180px] block">
                      {o.item}
                    </span>
                    {o.productId && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Cpu size={10} className="text-[hsl(173_58%_35%)]" aria-hidden="true" />
                        <span className="text-[hsl(173_58%_35%)] text-[10px]">produto vinculado</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[#ebebeb] text-sm font-semibold">
                    R$ {fmt(o.value)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell">
                  {o.productionCost != null ? (
                    <div>
                      <span className="text-[#555555] text-xs">
                        R$ {fmt(o.productionCost)}
                      </span>
                      {margin !== null && (
                        <p
                          className={`text-[10px] font-medium ${
                            margin >= 40
                              ? 'text-[#10b981]'
                              : margin >= 20
                              ? 'text-[hsl(173_50%_55%)]'
                              : 'text-[#f59e0b]'
                          }`}
                        >
                          {margin.toFixed(0)}% margem
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#3a3a3a] text-xs" aria-label="Sem custo registrado">
                      s/d
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-2 py-3 relative">
                  {/* B.6 — Badge ATRASADO + botao Abrir + menu ... */}
                  <div className="flex items-center justify-end gap-1.5">
                    {(() => {
                      const atraso = diasAtraso(o, today)
                      if (atraso <= 0) return null
                      return (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            background:    'rgba(208,138,74,0.18)',
                            color:         'hsl(28 67% 70%)',
                            border:        '1px solid rgba(208,138,74,0.36)',
                            fontFamily:    'var(--font-geist-mono, "Geist Mono", monospace)',
                            letterSpacing: '0.12em',
                          }}
                          aria-label={`Pedido atrasado ${atraso} dia${atraso === 1 ? '' : 's'}`}
                        >
                          ATRASADO {atraso}D
                        </span>
                      )
                    })()}
                    <button
                      type="button"
                      onClick={() => onEdit(o)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a] text-xs transition-colors"
                      aria-label={`Abrir pedido de ${o.clientName}`}
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => onMenuToggle(o.id)}
                      className="p-1.5 text-[#555555] hover:text-[#ebebeb] transition-colors rounded-lg hover:bg-[#2a2a2a]"
                      aria-label={`Mais acoes do pedido de ${o.clientName}`}
                      aria-expanded={menuOpen === o.id}
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal size={15} aria-hidden="true" />
                    </button>
                  </div>
                  {menuOpen === o.id && (
                    <div
                      role="menu"
                      className="absolute right-2 top-10 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => onEdit(o)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Pencil size={13} aria-hidden="true" /> Editar
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => onDelete(o.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                      >
                        <Trash2 size={13} aria-hidden="true" /> Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const { state, dispatch, loading } = useStore()
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ---------------------------------------------------------------------------
  // Leitura de ?quote=<productId> — pré-seleção de produto ao chegar de /products.
  // Derivado diretamente do searchParams (sem setState), o que evita re-render
  // extra e não viola react-hooks/set-state-in-effect.
  // ---------------------------------------------------------------------------
  const paramProductId  = searchParams.get('quote') ?? ''
  const quoteProduct    = paramProductId
    ? state.products.find((p) => p.id === paramProductId)
    : undefined
  // Valida existência do produto; se inválido, ignora o param.
  const quoteProductId  = quoteProduct ? paramProductId : ''

  // Estado de UI
  // O modal de criação abre no mount quando há quoteProductId válido.
  // useState(() => ...) garante que o valor inicial só é calculado uma vez.
  const [creating,      setCreating]      = useState(() => Boolean(quoteProductId))
  const [editing,       setEditing]       = useState<Order | null>(null)
  const [menuOpen,      setMenuOpen]      = useState<string | null>(null)
  const [filterProject, setFilterProject] = useState<string>('all')

  // Tab e busca controlados pelo ModuleShell via callbacks
  const [activeTab,   setActiveTab]   = useState<TabId>(ALL)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // B.5 — Filtros avancados
  const [filtrosOpen,         setFiltrosOpen]         = useState(false)
  const [filtroProjetoAdv,    setFiltroProjetoAdv]    = useState<string>('all')
  const [filtroPeriodo,       setFiltroPeriodo]       = useState<'mes-atual' | 'mes-passado' | 'todos'>('todos')
  const [filtroValorMin,      setFiltroValorMin]      = useState<string>('')

  // Limpa o param ?quote= da URL após o mount, sem re-render de estado.
  useEffect(() => {
    if (!paramProductId) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('quote')
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only: apenas limpa a URL, não aciona estado

  // ---------------------------------------------------------------------------
  // Derivacoes de estado
  // ---------------------------------------------------------------------------

  const byProject = useMemo(() => {
    // Filtro de projeto (ProjectFilter basico)
    const projetoFiltro = filtroProjetoAdv !== 'all' ? filtroProjetoAdv : filterProject
    let base = projetoFiltro === 'all'
      ? state.orders
      : state.orders.filter((o) => o.projectId === projetoFiltro)

    // B.5 — Filtros avancados: periodo
    if (filtroPeriodo !== 'todos') {
      const agora    = new Date()
      const mesAtivo = filtroPeriodo === 'mes-atual'
        ? agora.getMonth()
        : agora.getMonth() - 1 < 0 ? 11 : agora.getMonth() - 1
      const anoAtivo = filtroPeriodo === 'mes-atual'
        ? agora.getFullYear()
        : agora.getMonth() === 0 ? agora.getFullYear() - 1 : agora.getFullYear()
      base = base.filter((o) => {
        const d = new Date(o.date)
        return d.getMonth() === mesAtivo && d.getFullYear() === anoAtivo
      })
    }

    // B.5 — Filtro valor minimo
    const valorMin = parseFloat(filtroValorMin)
    if (!isNaN(valorMin) && valorMin > 0) {
      base = base.filter((o) => o.value >= valorMin)
    }

    return base
  }, [state.orders, filterProject, filtroProjetoAdv, filtroPeriodo, filtroValorMin])

  const filtered = useMemo(() => {
    let base = activeTab === ALL ? byProject : byProject.filter((o) => o.status === activeTab)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      base = base.filter(
        (o) =>
          o.clientName.toLowerCase().includes(q) ||
          o.item.toLowerCase().includes(q),
      )
    }
    return base
  }, [byProject, activeTab, searchQuery])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  )

  const statusCounts = useMemo(
    () =>
      (Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[]).reduce(
        (acc, k) => {
          acc[k] = byProject.filter((o) => o.status === k).length
          return acc
        },
        {} as Record<OrderStatus, number>,
      ),
    [byProject],
  )

  // KPIs derivados
  const faturado = useMemo(
    () =>
      byProject
        .filter((o) => o.status === 'paid' || o.status === 'delivered')
        .reduce((s, o) => s + o.value, 0),
    [byProject],
  )

  const ticketMedio = useMemo(() => {
    const pagos = byProject.filter(
      (o) => o.status === 'paid' || o.status === 'delivered',
    )
    return pagos.length > 0 ? faturado / pagos.length : 0
  }, [byProject, faturado])

  const totalAbertos = byProject.filter(
    (o) => o.status === 'lead' || o.status === 'quote_sent',
  ).length

  // ---------------------------------------------------------------------------
  // Metricas derivadas (Onda B) — calculadas com helpers de services/ordersMetrics
  // ---------------------------------------------------------------------------

  // B.1 — Semana ISO + total entregues no mes
  const today          = useMemo(() => new Date(), [])
  const semanaISO      = useMemo(() => isoWeekNumber(today), [today])
  const entreguesNoMes = useMemo(() => totalEntreguesNoMes(byProject, today), [byProject, today])

  // ---------------------------------------------------------------------------
  // Metricas derivadas (Onda B) — calculadas com helpers de services/ordersMetrics
  // ---------------------------------------------------------------------------

  // B.1 — Semana ISO + total entregues no mes
  const today          = useMemo(() => new Date(), [])
  const semanaISO      = useMemo(() => isoWeekNumber(today), [today])
  const entreguesNoMes = useMemo(() => totalEntreguesNoMes(byProject, today), [byProject, today])

  // Mes corrente para eyebrow
  const mesAtual = useMemo(
    () => today.toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
    [today],
  )

  // B.2 — Dados para subtitle humanizado
  const subtitleData = useMemo(() => calcSubtitleData(byProject, today), [byProject, today])

  // B.3 — Hero KPI com delta
  const heroKpiData = useMemo(() => calcHeroKpiData(byProject, today), [byProject, today])

  // B.4 — Satellite ATRASADOS
  const atrasadosData = useMemo(() => calcAtrasadosData(byProject, today), [byProject, today])

  // ---------------------------------------------------------------------------
  // Helpers de lookup (estavel por ref)
  // ---------------------------------------------------------------------------

  const projectName = useCallback(
    (id: string) => state.projects.find((p) => p.id === id)?.name ?? 'Projeto',
    [state.projects],
  )

  const productName = useCallback(
    (id: string | undefined): string | undefined =>
      id ? state.products.find((p) => p.id === id)?.name : undefined,
    [state.products],
  )

  // ---------------------------------------------------------------------------
  // Handlers de CRUD
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    (data: OrderFormData) => {
      const newOrderId = uid()
      const product = data.productId
        ? state.products.find((p) => p.id === data.productId)
        : undefined
      const productionCost = product
        ? calcUnitCost(product, state.inventory).totalCost
        : undefined

      const order: Order = {
        id:              newOrderId,
        projectId:       data.projectId,
        clientName:      data.clientName,
        origin:          data.origin,
        item:            data.item,
        value:           parseFloat(data.value) || 0,
        status:          data.status,
        date:            data.date,
        inventoryItemId: data.inventoryItemId || undefined,
        qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
        productId:       product?.id,
        productionCost,
      }

      dispatch({ type: 'ADD_ORDER', payload: order })

      // Efeitos colaterais local-only (syncAction lida com Supabase mode)
      if (!isSupabaseConfigured) {
        if (product) {
          dispatch({
            type: 'ADD_PRODUCTION',
            payload: {
              id:             uid(),
              orderId:        newOrderId,
              projectId:      data.projectId,
              clientName:     data.clientName,
              item:           product.name,
              printer:        'bambu',
              status:         'waiting',
              estimatedHours: product.printTimeHours,
              priority:       state.production.length + 1,
            },
          })
        }
      }

      setCreating(false)
    },
    [state.products, state.inventory, state.production, dispatch],
  )

  const handleEdit = useCallback(
    (data: OrderFormData) => {
      if (!editing) return
      const product = data.productId
        ? state.products.find((p) => p.id === data.productId)
        : undefined
      const productionCost = product
        ? calcUnitCost(product, state.inventory).totalCost
        : editing.productionCost

      dispatch({
        type: 'UPDATE_ORDER',
        payload: {
          ...editing,
          projectId:       data.projectId,
          clientName:      data.clientName,
          origin:          data.origin,
          item:            data.item,
          value:           parseFloat(data.value) || 0,
          status:          data.status,
          date:            data.date,
          inventoryItemId: data.inventoryItemId || undefined,
          qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
          productId:       product?.id,
          productionCost,
        },
      })
      setEditing(null)
    },
    [editing, state.products, state.inventory, dispatch],
  )

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_ORDER', payload: id })
      setMenuOpen(null)
    },
    [dispatch],
  )

  const handleMenuToggle = useCallback(
    (id: string) => setMenuOpen((prev) => (prev === id ? null : id)),
    [],
  )

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as TabId)
    setMenuOpen(null)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  const handleNewOrder = useCallback(() => setCreating(true), [])

  // B.5 — Limpa filtros avancados
  const handleLimparFiltros = useCallback(() => {
    setFiltroProjetoAdv('all')
    setFiltroPeriodo('todos')
    setFiltroValorMin('')
  }, [])

  // Exporta a lista atual (respeita filtro de projeto + tab + busca quando aplicaveis)
  const handleExportCsv = useCallback(() => {
    const escapeCell = (v: unknown): string => {
      if (v == null) return ''
      const s = String(v)
      // CSV padrao: envolve em aspas se tiver virgula, aspas, ; ou quebra de linha
      if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }

    const headers = [
      'Cliente',
      'Projeto',
      'Origem',
      'Item',
      'Valor (R$)',
      'Custo Producao (R$)',
      'Status',
      'Data',
    ]

    const rows = byProject.map((o) => {
      const statusLabel = ORDER_STATUS_CONFIG[o.status]?.label ?? o.status
      const originLabel = ORDER_ORIGIN_LABELS[o.origin] ?? o.origin
      return [
        o.clientName,
        projectName(o.projectId),
        originLabel,
        o.item || productName(o.productId) || '',
        fmt(o.value || 0),
        o.productionCost != null ? fmt(o.productionCost) : '',
        statusLabel,
        fmtDate(o.date),
      ]
    })

    const csvBody = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(';'))
      .join('\r\n')

    // BOM UTF-8 garante que Excel BR abre acentos corretamente
    const csvWithBom = '﻿' + csvBody
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })

    const url   = URL.createObjectURL(blob)
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const link  = document.createElement('a')
    link.href     = url
    link.download = `hayzer-pedidos-${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [byProject, projectName, productName])

  // ---------------------------------------------------------------------------
  // Tabs para ModuleShell
  // ---------------------------------------------------------------------------

  const tabs = useMemo(
    () => [
      { id: ALL, label: 'Todos', count: byProject.length, active: activeTab === ALL },
      ...(Object.entries(ORDER_STATUS_CONFIG) as [OrderStatus, { label: string; color: string }][]).map(
        ([s, { label }]) => ({
          id:     s,
          label,
          count:  statusCounts[s] ?? 0,
          active: activeTab === s,
        }),
      ),
    ],
    [byProject.length, statusCounts, activeTab],
  )

  // ---------------------------------------------------------------------------
  // Frase viva do header (B.2 — subtitle maker BR humanizado)
  // ---------------------------------------------------------------------------

  const livePhrase = useMemo(() => {
    const { entregaNaSemana, diaLimite, atrasados, saidosEssaSemana, estado } = subtitleData

    // Sem pedidos no projeto/filtro
    if (estado === 'vazio') {
      return (
        <>
          Nenhum pedido ainda.{' '}
          <UnderlineMarker tone="petrol">Sua primeira venda esta esperando</UnderlineMarker>.
        </>
      )
    }

    // Frase principal
    const fraseEntrega = entregaNaSemana > 0
      ? (
          <>
            <UnderlineMarker tone="ember">
              {entregaNaSemana} pra entregar ate {diaLimite}
            </UnderlineMarker>
            {atrasados > 0
              ? `, ${atrasados} ${atrasados === 1 ? 'atrasou' : 'atrasaram'}`
              : ''}
            {saidosEssaSemana > 0
              ? `, ${saidosEssaSemana} ${saidosEssaSemana === 1 ? 'ja saiu' : 'ja sairam'} do galpao`
              : ''}
            .{' '}
          </>
        )
      : atrasados > 0
      ? (
          <>
            <UnderlineMarker tone="ember">
              {atrasados} {atrasados === 1 ? 'pedido atrasado' : 'pedidos atrasados'}
            </UnderlineMarker>
            {saidosEssaSemana > 0
              ? `, ${saidosEssaSemana} ${saidosEssaSemana === 1 ? 'entregue' : 'entregues'} essa semana`
              : ''}
            .{' '}
          </>
        )
      : null

    // Estado final
    const fraseEstado = estado === 'atencao'
      ? <UnderlineMarker tone="ember" markerStyle="solid">precisando atencao</UnderlineMarker>
      : <UnderlineMarker tone="petrol" markerStyle="wavy">no ritmo certo</UnderlineMarker>

    return (
      <>
        {fraseEntrega}
        {fraseEntrega === null
          ? (
              <>
                {byProject.length} {byProject.length === 1 ? 'pedido' : 'pedidos'},{' '}
              </>
            )
          : <>Resto ta {fraseEstado}.</>
        }
        {fraseEntrega === null && <>resto ta {fraseEstado}.</>}
      </>
    )
  }, [subtitleData, byProject.length])

  // ---------------------------------------------------------------------------
  // Guard de loading
  // ---------------------------------------------------------------------------

  if (loading) return null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · SEM ${String(semanaISO).padStart(2, '0')} · ${totalAbertos} ABERTOS · ${entreguesNoMes} ENTREGUES NO MES`}
        title="Pedidos"
        titleItalicSuffix="essa semana"
        livePhrase={livePhrase}
        primaryAction={{
          label:   'Novo Pedido',
          onClick: handleNewOrder,
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        secondaryAction={{
          label:   'Exportar CSV',
          onClick: handleExportCsv,
          icon:    <Download size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'FATURADO (PAGO + ENTREGUE)',
          value:       fmtBRL(heroKpiData.totalPago),
          description: heroKpiData.count > 0
            ? `${heroKpiData.count} pedidos fechados, ticket medio R$ ${Math.round(heroKpiData.ticketMedio)}`
            : 'nenhum pedido fechado ainda.',
          delta: heroKpiData.delta ?? undefined,
        }}
        satelliteKpis={[
          {
            label:       'TICKET MEDIO',
            value:       ticketMedio > 0 ? fmtBRL(ticketMedio) : 'sem dados',
            description: 'pedidos pagos e entregues.',
            tone:        'neutral',
          },
          // B.4 — ATRASADOS com fallback para ORCAMENTOS ABERTOS quando count==0
          atrasadosData.count > 0
            ? {
                label:       'ATRASADOS',
                value:       `${atrasadosData.count} ${atrasadosData.count === 1 ? 'pedido' : 'pedidos'}`,
                description: atrasadosData.clientNames.length > 0
                  ? `${atrasadosData.clientNames.join(', ')} esperando.`
                  : undefined,
                alertText:   atrasadosData.urgenciaLabel,
                tone:        'ember' as const,
              }
            : {
                label:     'ORCAMENTOS ABERTOS',
                value:     String(statusCounts['quote_sent'] ?? 0),
                alertText: (statusCounts['quote_sent'] ?? 0) > 0 ? 'aguardando retorno' : undefined,
                tone:      ((statusCounts['quote_sent'] ?? 0) > 0 ? 'ember' : 'neutral') as 'ember' | 'neutral',
              },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar pedido, cliente..."
        onSearch={handleSearch}
      >
        {/* B.5 — Barra superior: filtro de projeto + botao Filtros */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <ProjectFilter
            projects={state.projects}
            value={filterProject}
            onChange={(v) => { setFilterProject(v) }}
          />
          <button
            type="button"
            onClick={() => setFiltrosOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a] text-sm transition-colors"
            aria-label="Abrir filtros avancados"
          >
            <Filter size={14} aria-hidden="true" />
            Filtros
            {(filtroProjetoAdv !== 'all' || filtroPeriodo !== 'todos' || filtroValorMin !== '') && (
              <span className="ml-1 w-2 h-2 rounded-full bg-[hsl(28_67%_65%)]" aria-label="Filtros ativos" />
            )}
          </button>
        </div>

        {/* Cards mobile */}
        <div className="sm:hidden">
          <MobileCards
            orders={sorted}
            projectName={projectName}
            productName={productName}
            onEdit={(o) => setEditing(o)}
            onDelete={handleDelete}
          />
        </div>

        {/* Tabela desktop */}
        <div
          className="hidden sm:block bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden"
        >
          <DesktopTable
            orders={sorted}
            projectName={projectName}
            menuOpen={menuOpen}
            onMenuToggle={handleMenuToggle}
            onEdit={(o) => { setEditing(o); setMenuOpen(null) }}
            onDelete={handleDelete}
            today={today}
          />
        </div>
      </ModuleShell>

      {/* Modal: novo pedido (suporta pré-seleção de produto via ?quote=) */}
      {creating && (
        <Modal title="Novo Pedido" onClose={() => setCreating(false)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            initial={quoteProductId ? {
              projectId:       state.projects[0]?.id ?? '',
              clientName:      '',
              origin:          'whatsapp',
              item:            quoteProduct?.name ?? '',
              value:           String(quoteProduct?.salePrice ?? ''),
              status:          'quote_sent',
              date:            new Date().toISOString().slice(0, 10),
              inventoryItemId: '',
              qtyUsed:         '1',
              productId:       quoteProductId,
            } : undefined}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {/* Modal: editar pedido */}
      {editing && (
        <Modal title="Editar Pedido" onClose={() => setEditing(null)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            initial={{
              projectId:       editing.projectId,
              clientName:      editing.clientName,
              origin:          editing.origin,
              item:            editing.item,
              value:           String(editing.value),
              status:          editing.status,
              date:            editing.date,
              inventoryItemId: editing.inventoryItemId ?? '',
              qtyUsed:         String(editing.qtyUsed ?? 1),
              productId:       editing.productId ?? '',
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* B.5 — Modal de filtros avancados */}
      {filtrosOpen && (
        <Modal title="Filtros avancados" onClose={() => setFiltrosOpen(false)}>
          <div className="flex flex-col gap-5 min-w-[300px]">

            {/* Filtro: projeto */}
            {state.projects.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="filtro-adv-projeto" className="text-xs font-medium text-[#888888] uppercase tracking-wide">
                  Projeto
                </label>
                <select
                  id="filtro-adv-projeto"
                  value={filtroProjetoAdv}
                  onChange={(e) => setFiltroProjetoAdv(e.target.value)}
                  className="bg-[#1c1c1c] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
                  aria-label="Filtrar por projeto"
                >
                  <option value="all">Todos os projetos</option>
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro: periodo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">Periodo</span>
              <div className="flex gap-2 flex-wrap">
                {([
                  { value: 'todos',       label: 'Todos' },
                  { value: 'mes-atual',   label: 'Este mes' },
                  { value: 'mes-passado', label: 'Mes passado' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFiltroPeriodo(value)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      filtroPeriodo === value
                        ? 'bg-[hsl(173_58%_28%)] border-[hsl(173_58%_35%)] text-[#ebebeb]'
                        : 'bg-[#1c1c1c] border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a]'
                    }`}
                    aria-pressed={filtroPeriodo === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro: valor minimo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filtro-adv-valor" className="text-xs font-medium text-[#888888] uppercase tracking-wide">
                Valor minimo (R$)
              </label>
              <input
                id="filtro-adv-valor"
                type="number"
                min={0}
                step={10}
                value={filtroValorMin}
                onChange={(e) => setFiltroValorMin(e.target.value)}
                placeholder="Ex: 100"
                className="bg-[#1c1c1c] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors placeholder:text-[#555555]"
                aria-label="Valor minimo do pedido"
              />
            </div>

            {/* Acoes */}
            <div className="flex justify-between items-center pt-1 border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="text-sm text-[#888888] hover:text-[#ef4444] transition-colors"
                aria-label="Limpar todos os filtros"
              >
                Limpar filtros
              </button>
              <button
                type="button"
                onClick={() => setFiltrosOpen(false)}
                className="px-4 py-2 rounded-lg bg-[hsl(173_58%_28%)] border border-[hsl(173_58%_35%)] text-[#ebebeb] text-sm hover:bg-[hsl(173_58%_32%)] transition-colors"
                aria-label="Aplicar filtros e fechar"
              >
                Aplicar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
