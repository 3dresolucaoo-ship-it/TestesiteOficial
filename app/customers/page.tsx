'use client'

/**
 * app/customers/page.tsx — Modulo de Clientes V4
 *
 * Shell V4 unificado: ModuleShell + KpiRow + FilterBar + skeleton.
 * Clientes sao derivados de state.orders (nao ha tabela propria).
 * customersMetrics.ts calcula tudo em TS puro (service-first).
 *
 * Blocos:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - MobileCards   (sm:hidden)
 *       - DesktopTable  (hidden sm:block)
 *   Modal perfil do cliente (detalhes + historico de pedidos)
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 * Criado: 2026-05-20 (feature/customers-v4)
 */

import { useState, useMemo, useCallback } from 'react'
import { useStore, useStoreModule }        from '@/lib/store'
import {
  Users, UserCheck, UserX, Star,
  Plus, ChevronRight, X,
} from 'lucide-react'
import { CustomersEmptyState } from './_components/CustomersEmptyState'
import { ModuleShell, V4ThemeProvider }    from '@/components/dashboard/v4'
import { UnderlineMarker }                 from '@/components/visual-library'
import {
  buildCustomerList,
  calcCustomersKpi,
  fmtBRL,
  fmtDate,
  SEGMENT_LABELS,
  SEGMENT_BADGE_STYLE,
  type CustomerRow,
  type CustomerFilter,
} from '@/services/customersMetrics'
import type { Order } from '@/lib/types'
import CustomersLoading from './loading'

import '../globals-v4.css'

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function fmtDays(days: number): string {
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30)  return `${days}d atras`
  if (days < 60)  return `1 mes atras`
  const months = Math.floor(days / 30)
  return `${months} meses atras`
}

// ---------------------------------------------------------------------------
// Badge de segmento
// ---------------------------------------------------------------------------

function SegmentBadge({ segment }: { segment: CustomerRow['segment'] }) {
  return (
    <span
      style={{
        ...SEGMENT_BADGE_STYLE[segment],
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '4px',
        padding:       '2px 8px',
        borderRadius:  '999px',
        fontSize:      '11px',
        fontWeight:    600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily:    'var(--font-geist-mono, "Geist Mono", monospace)',
        whiteSpace:    'nowrap',
      }}
      aria-label={`Segmento: ${SEGMENT_LABELS[segment]}`}
    >
      {segment === 'vip' && <Star size={9} aria-hidden="true" />}
      {SEGMENT_LABELS[segment]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: cards mobile
// ---------------------------------------------------------------------------

interface MobileCardsProps {
  customers:       CustomerRow[]
  totalCustomers:  number
  onOpen:          (c: CustomerRow) => void
  onNewOrder:      () => void
  onClearFilters:  () => void
}

function MobileCards({
  customers,
  totalCustomers,
  onOpen,
  onNewOrder,
  onClearFilters,
}: MobileCardsProps) {
  if (customers.length === 0) {
    return (
      <CustomersEmptyState
        mode={totalCustomers > 0 ? 'no-results' : 'empty'}
        variant="mobile"
        onNewOrder={onNewOrder}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <div className="space-y-2">
      {customers.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onOpen(c)}
          className="w-full text-left bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
          aria-label={`Ver perfil de ${c.name}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[#ebebeb] font-medium text-sm">{c.name}</p>
              <p className="text-[#555555] text-xs mt-0.5">
                {fmtDays(c.daysSinceLastOrder)} · {c.totalOrders}{' '}
                {c.totalOrders === 1 ? 'pedido' : 'pedidos'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[#ebebeb] font-semibold text-sm">{fmtBRL(c.ltv)}</p>
              <p className="text-[#555555] text-[10px] mt-0.5">LTV</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SegmentBadge segment={c.segment} />
            {c.segment === 'sumido' && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background:    'rgba(208,138,74,0.18)',
                  color:         'hsl(28 67% 70%)',
                  border:        '1px solid rgba(208,138,74,0.36)',
                  fontFamily:    'var(--font-geist-mono, "Geist Mono", monospace)',
                  letterSpacing: '0.12em',
                  padding:       '2px 6px',
                  borderRadius:  '4px',
                }}
                aria-label={`Sumiu ha ${c.daysSinceLastOrder} dias`}
              >
                {c.daysSinceLastOrder}D SEM PEDIDO
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: tabela desktop
// ---------------------------------------------------------------------------

interface DesktopTableProps {
  customers:      CustomerRow[]
  totalCustomers: number
  onOpen:         (c: CustomerRow) => void
  onNewOrder:     () => void
  onClearFilters: () => void
}

function DesktopTable({
  customers,
  totalCustomers,
  onOpen,
  onNewOrder,
  onClearFilters,
}: DesktopTableProps) {
  if (customers.length === 0) {
    return (
      <CustomersEmptyState
        mode={totalCustomers > 0 ? 'no-results' : 'empty'}
        variant="desktop"
        onNewOrder={onNewOrder}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" aria-label="Lista de clientes">
        <thead>
          <tr className="border-b border-[#2a2a2a]">
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Cliente
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Segmento
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              LTV
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">
              Ticket Medio
            </th>
            <th scope="col" className="text-center px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">
              Pedidos
            </th>
            <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">
              Ultimo contato
            </th>
            <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
              Acao
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr
              key={c.name}
              className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {/* Avatar inicial */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{
                      background:  c.segment === 'vip'
                        ? 'rgba(31,118,105,0.22)'
                        : c.segment === 'sumido'
                        ? 'rgba(208,138,74,0.16)'
                        : 'rgba(148,144,138,0.12)',
                      color: c.segment === 'vip'
                        ? 'hsl(173 50% 55%)'
                        : c.segment === 'sumido'
                        ? 'hsl(28 67% 65%)'
                        : '#94908A',
                    }}
                    aria-hidden="true"
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#ebebeb] text-sm font-medium">{c.name}</p>
                    <p className="text-[#555555] text-xs hidden lg:block">
                      cliente desde {fmtDate(c.firstOrderDate)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <SegmentBadge segment={c.segment} />
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-[#ebebeb] text-sm font-semibold">
                  {fmtBRL(c.ltv)}
                </span>
              </td>
              <td className="px-4 py-3 text-right hidden md:table-cell">
                <span className="text-[#888888] text-sm">
                  {c.avgTicket > 0 ? fmtBRL(c.avgTicket) : 'sem dados'}
                </span>
              </td>
              <td className="px-4 py-3 text-center hidden lg:table-cell">
                <span className="text-[#888888] text-sm">{c.totalOrders}</span>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div>
                  <p className="text-[#888888] text-sm">{fmtDays(c.daysSinceLastOrder)}</p>
                  {c.segment === 'sumido' && (
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{
                        color:         'hsl(28 67% 70%)',
                        fontFamily:    'var(--font-geist-mono, "Geist Mono", monospace)',
                        letterSpacing: '0.10em',
                      }}
                      aria-label={`Sumiu ha ${c.daysSinceLastOrder} dias`}
                    >
                      {c.daysSinceLastOrder}D SEM PEDIDO
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(c)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a] text-xs transition-colors inline-flex items-center gap-1"
                  aria-label={`Ver perfil de ${c.name}`}
                >
                  Ver perfil <ChevronRight size={12} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: modal de perfil do cliente
// ---------------------------------------------------------------------------

interface CustomerProfileModalProps {
  customer: CustomerRow
  orders:   Order[]
  onClose:  () => void
}

function CustomerProfileModal({ customer, orders, onClose }: CustomerProfileModalProps) {
  const clientOrders = useMemo(
    () =>
      orders
        .filter((o) => o.clientName.trim().toLowerCase() === customer.name.trim().toLowerCase())
        .sort((a, b) => b.date.localeCompare(a.date)),
    [orders, customer.name],
  )

  const STATUS_LABELS: Record<string, string> = {
    lead:       'Lead',
    quote_sent: 'Orcamento',
    paid:       'Pago',
    delivered:  'Entregue',
  }

  const STATUS_COLORS: Record<string, string> = {
    lead:       '#555555',
    quote_sent: 'hsl(28 67% 65%)',
    paid:       'hsl(173 50% 55%)',
    delivered:  'hsl(173 35% 65%)',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${customer.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.60)' }}
      >
        {/* Header do modal */}
        <div className="flex items-start justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
              style={{
                background: customer.segment === 'vip'
                  ? 'rgba(31,118,105,0.22)'
                  : customer.segment === 'sumido'
                  ? 'rgba(208,138,74,0.16)'
                  : 'rgba(148,144,138,0.12)',
                color: customer.segment === 'vip'
                  ? 'hsl(173 50% 55%)'
                  : customer.segment === 'sumido'
                  ? 'hsl(28 67% 65%)'
                  : '#94908A',
              }}
              aria-hidden="true"
            >
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[#ebebeb] font-semibold text-base">{customer.name}</h2>
              <p className="text-[#555555] text-xs mt-0.5">
                cliente desde {fmtDate(customer.firstOrderDate)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#555555] hover:text-[#ebebeb] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            aria-label="Fechar perfil"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* KPIs do cliente */}
        <div className="grid grid-cols-3 gap-px border-b border-[#2a2a2a]" style={{ background: '#2a2a2a' }}>
          {[
            { label: 'LTV',           value: fmtBRL(customer.ltv)                                    },
            { label: 'TICKET MEDIO',  value: customer.avgTicket > 0 ? fmtBRL(customer.avgTicket) : 'N/A' },
            { label: 'TOTAL PEDIDOS', value: String(customer.totalOrders)                            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 p-4 bg-[#141414]">
              <span
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: '#555555', fontFamily: 'var(--font-geist-mono, "Geist Mono", monospace)' }}
              >
                {label}
              </span>
              <span className="text-[#ebebeb] font-semibold text-base">{value}</span>
            </div>
          ))}
        </div>

        {/* Alerta sumido */}
        {customer.segment === 'sumido' && (
          <div
            className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(208,138,74,0.10)',
              border:     '1px solid rgba(208,138,74,0.28)',
            }}
            role="alert"
          >
            <UserX size={15} style={{ color: 'hsl(28 67% 68%)' }} aria-hidden="true" />
            <p style={{ color: 'hsl(28 67% 70%)', fontSize: '13px' }}>
              Sem pedido ha{' '}
              <strong>{customer.daysSinceLastOrder} dias</strong>. Hora de reconectar.
            </p>
          </div>
        )}

        {/* Badge segmento */}
        <div className="px-6 pt-4">
          <SegmentBadge segment={customer.segment} />
        </div>

        {/* Historico de pedidos */}
        <div className="flex flex-col flex-1 overflow-hidden px-4 pb-4 mt-4">
          <p
            className="text-[10px] font-medium uppercase tracking-wide mb-3 px-2"
            style={{ color: '#555555', fontFamily: 'var(--font-geist-mono, "Geist Mono", monospace)' }}
          >
            Historico de pedidos ({clientOrders.length})
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
            {clientOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[#ebebeb] text-sm font-medium truncate">{o.item}</p>
                  <p className="text-[#555555] text-xs mt-0.5">{fmtDate(o.date)}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[#ebebeb] text-sm font-semibold">{fmtBRL(o.value)}</p>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wide"
                    style={{
                      color:         STATUS_COLORS[o.status] ?? '#555555',
                      fontFamily:    'var(--font-geist-mono, "Geist Mono", monospace)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tabs para o modulo
// ---------------------------------------------------------------------------

const TAB_CONFIGS: { id: CustomerFilter; label: string; icon: React.ElementType }[] = [
  { id: 'todos',      label: 'Todos',       icon: Users     },
  { id: 'vip',        label: 'VIP',         icon: Star      },
  { id: 'recorrente', label: 'Recorrentes', icon: UserCheck },
  { id: 'sumido',     label: 'Sumidos',     icon: UserX     },
]

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function CustomersPage() {
  const { state }    = useStore()
  const { isLoading: ordersLoading } = useStoreModule('orders')

  const [activeFilter, setActiveFilter]         = useState<CustomerFilter>('todos')
  const [searchQuery,  setSearchQuery]           = useState<string>('')
  const [openProfile,  setOpenProfile]           = useState<CustomerRow | null>(null)

  // ---------------------------------------------------------------------------
  // Derivacoes de estado
  // ---------------------------------------------------------------------------

  const today = useMemo(() => new Date(), [])

  const mesAtual = useMemo(
    () => today.toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
    [today],
  )

  // Todos os clientes derivados dos pedidos
  const allCustomers = useMemo(
    () => buildCustomerList(state.orders, today),
    [state.orders, today],
  )

  // KPIs
  const kpi = useMemo(
    () => calcCustomersKpi(allCustomers, state.orders, today),
    [allCustomers, state.orders, today],
  )

  // Clientes filtrados por tab + search
  const filteredCustomers = useMemo(() => {
    let base = activeFilter === 'todos'
      ? allCustomers
      : allCustomers.filter((c) => c.segment === activeFilter)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      base = base.filter((c) => c.name.toLowerCase().includes(q))
    }

    return base
  }, [allCustomers, activeFilter, searchQuery])

  // Contagens por segmento para tabs
  const segmentCounts = useMemo(
    () => ({
      todos:      allCustomers.length,
      vip:        kpi.vips,
      recorrente: kpi.recorrentes,
      sumido:     kpi.sumidos,
      novo:       kpi.novos,
    }),
    [allCustomers.length, kpi],
  )

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTabChange = useCallback((id: string) => {
    setActiveFilter(id as CustomerFilter)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  const handleNewOrder = useCallback(() => {
    window.location.href = '/orders'
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveFilter('todos')
    setSearchQuery('')
  }, [])

  // ---------------------------------------------------------------------------
  // Frase viva humanizada
  // ---------------------------------------------------------------------------

  const livePhrase = useMemo(() => {
    if (kpi.totalClientes === 0) {
      return (
        <>
          Nenhum cliente ainda.{' '}
          <UnderlineMarker tone="petrol">Seu primeiro pedido cria automatico</UnderlineMarker>.
        </>
      )
    }

    if (kpi.sumidos > 0) {
      return (
        <>
          <UnderlineMarker tone="ember">
            {kpi.sumidos} {kpi.sumidos === 1 ? 'cliente sumiu' : 'clientes sumiram'}
          </UnderlineMarker>
          {', '}
          {kpi.vips > 0 && (
            <>
              <UnderlineMarker tone="petrol">{kpi.vips} VIP</UnderlineMarker>
              {' '}na base.{' '}
            </>
          )}
          {kpi.vips === 0 && 'reconecta com eles.'}
        </>
      )
    }

    if (kpi.vips > 0) {
      return (
        <>
          <UnderlineMarker tone="petrol">
            {kpi.vips} {kpi.vips === 1 ? 'cliente VIP' : 'clientes VIP'}
          </UnderlineMarker>
          {' '}na base. {kpi.recorrentes > 0 && (
            <>{kpi.recorrentes} recorrentes comprando de você.</>
          )}
        </>
      )
    }

    return (
      <>
        {kpi.totalClientes} {kpi.totalClientes === 1 ? 'cliente' : 'clientes'} na base,{' '}
        <UnderlineMarker tone="petrol" markerStyle="wavy">tudo tranquilo</UnderlineMarker>.
      </>
    )
  }, [kpi])

  // ---------------------------------------------------------------------------
  // Tabs para ModuleShell
  // ---------------------------------------------------------------------------

  const tabs = useMemo(
    () => TAB_CONFIGS.map((t) => ({
      id:     t.id,
      label:  t.label,
      count:  segmentCounts[t.id],
      active: activeFilter === t.id,
    })),
    [segmentCounts, activeFilter],
  )

  // ---------------------------------------------------------------------------
  // Guard de loading
  // ---------------------------------------------------------------------------

  if (ordersLoading) return <CustomersLoading />

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · ${kpi.totalClientes} CLIENTES · ${kpi.vips} VIP · ${kpi.sumidos} SUMIDOS`}
        title="Clientes"
        titleItalicSuffix="que voltaram"
        livePhrase={livePhrase}
        primaryAction={{
          label:   'Novo Pedido',
          onClick: handleNewOrder,
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'LTV TOTAL DA BASE',
          value:       fmtBRL(allCustomers.reduce((s, c) => s + c.ltv, 0)),
          description: kpi.totalClientes > 0
            ? `${kpi.totalClientes} ${kpi.totalClientes === 1 ? 'cliente' : 'clientes'}, LTV medio ${fmtBRL(kpi.ltvMedio)}`
            : 'nenhum cliente ainda.',
          delta: kpi.deltaAtivos ?? undefined,
        }}
        satelliteKpis={[
          {
            label:       'TICKET MEDIO',
            value:       kpi.ticketMedio > 0 ? fmtBRL(kpi.ticketMedio) : 'sem dados',
            description: 'pedidos pagos e entregues.',
            tone:        'neutral',
          },
          kpi.sumidos > 0
            ? {
                label:       'SUMIDOS',
                value:       `${kpi.sumidos} ${kpi.sumidos === 1 ? 'cliente' : 'clientes'}`,
                description: `mais de 60 dias sem pedido.`,
                alertText:   'reconectar com eles',
                tone:        'ember' as const,
              }
            : {
                label:       'CLIENTES VIP',
                value:       String(kpi.vips),
                description: kpi.vips > 0
                  ? `${kpi.vips} com 3+ pedidos e LTV alto.`
                  : 'nenhum VIP ainda.',
                tone:        kpi.vips > 0 ? 'petrol' as const : 'neutral' as const,
              },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar cliente..."
        onSearch={handleSearch}
      >
        {/* Cards mobile */}
        <div className="sm:hidden">
          <MobileCards
            customers={filteredCustomers}
            totalCustomers={allCustomers.length}
            onOpen={setOpenProfile}
            onNewOrder={handleNewOrder}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Tabela desktop */}
        <div className="hidden sm:block bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <DesktopTable
            customers={filteredCustomers}
            totalCustomers={allCustomers.length}
            onOpen={setOpenProfile}
            onNewOrder={handleNewOrder}
            onClearFilters={handleClearFilters}
          />
        </div>
      </ModuleShell>

      {/* Modal perfil do cliente */}
      {openProfile && (
        <CustomerProfileModal
          customer={openProfile}
          orders={state.orders}
          onClose={() => setOpenProfile(null)}
        />
      )}
    </>
  )
}
