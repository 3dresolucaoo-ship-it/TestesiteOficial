'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import {
  TrendingUp, DollarSign, ShoppingCart, Users, Video, Target,
  ArrowUp, ArrowDown, Package,
} from 'lucide-react'

type Period = '7d' | '30d' | '90d' | 'all'

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function fmtShort(v: number) {
  if (Math.abs(v) >= 1000)
    return `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
  return fmt(v)
}
function pct(v: number) {
  return `${v.toFixed(1)}%`
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function MetricsPage() {
  const { state, loading } = useStore()
  const [period, setPeriod] = useState<Period>('30d')
  const [projectId, setProjectId] = useState<string>('all')

  const cutoff = useMemo(() => {
    if (period === '7d')  return daysAgo(7)
    if (period === '30d') return daysAgo(30)
    if (period === '90d') return daysAgo(90)
    return '0000-00-00'
  }, [period])

  const prevCutoff = useMemo(() => {
    if (period === '7d')  return daysAgo(14)
    if (period === '30d') return daysAgo(60)
    if (period === '90d') return daysAgo(180)
    return '0000-00-00'
  }, [period])

  const {
    orders, transactions, leads, content, inventory, projects,
  } = state

  const inScope = <T extends { projectId?: string }>(rows: T[]) =>
    projectId === 'all' ? rows : rows.filter(r => r.projectId === projectId)

  const ordersScope      = inScope(orders)
  const transactionsScope = inScope(transactions)
  const leadsScope       = inScope(leads)
  const contentScope     = inScope(content)
  const inventoryScope   = inScope(inventory)

  const inPeriod = <T extends { date: string }>(rows: T[], from: string) =>
    rows.filter(r => r.date >= from)
  const between = <T extends { date: string }>(rows: T[], from: string, to: string) =>
    rows.filter(r => r.date >= from && r.date < to)

  // ── Sales ────────────────────────────────────────────────────────────────────
  const paidNow  = inPeriod(ordersScope.filter(o => o.status === 'paid' || o.status === 'delivered'), cutoff)
  const paidPrev = between(ordersScope.filter(o => o.status === 'paid' || o.status === 'delivered'), prevCutoff, cutoff)
  const revenueNow  = paidNow.reduce((s, o) => s + o.value, 0)
  const revenuePrev = paidPrev.reduce((s, o) => s + o.value, 0)
  const revenueDelta = revenuePrev > 0 ? ((revenueNow - revenuePrev) / revenuePrev) * 100 : null
  const avgTicket    = paidNow.length > 0 ? revenueNow / paidNow.length : 0

  // ── Finance ──────────────────────────────────────────────────────────────────
  const txNow      = inPeriod(transactionsScope, cutoff)
  const incomeNow  = txNow.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0)
  const expenseNow = txNow.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0)
  const profitNow  = incomeNow - expenseNow
  const profitMargin = incomeNow > 0 ? (profitNow / incomeNow) * 100 : 0

  // ── CRM / Conversion ─────────────────────────────────────────────────────────
  const leadsNow  = inPeriod(leadsScope as { date: string; status: string }[], cutoff) as typeof leads
  const leadsWon  = leadsNow.filter(l => l.status === 'won').length
  const leadsLost = leadsNow.filter(l => l.status === 'lost').length
  const conversionRate = leadsNow.length > 0 ? (leadsWon / leadsNow.length) * 100 : 0

  // ── Content ──────────────────────────────────────────────────────────────────
  const contentNow = inPeriod(contentScope, cutoff)
  const contentPosted = contentNow.filter(c => c.status === 'posted')
  const totalViews  = contentPosted.reduce((s, c) => s + (c.views || 0), 0)
  const totalLeadsFromContent = contentPosted.reduce((s, c) => s + (c.leads || 0), 0)
  const totalSalesFromContent = contentPosted.reduce((s, c) => s + (c.salesGenerated || 0), 0)
  const contentConversion = totalLeadsFromContent > 0
    ? (totalSalesFromContent / totalLeadsFromContent) * 100
    : 0

  // ── Inventory ────────────────────────────────────────────────────────────────
  const stockValue = inventoryScope.reduce((s, i) => s + i.costPrice * i.quantity, 0)
  const lowStock   = inventoryScope.filter(i => i.quantity <= (i.minStock ?? 2)).length

  // ── By origin ───────────────────────────────────────────────────────────────
  const byOrigin = (['whatsapp', 'instagram', 'facebook', 'other'] as const).map(origin => {
    const list = paidNow.filter(o => o.origin === origin)
    return {
      origin,
      count: list.length,
      revenue: list.reduce((s, o) => s + o.value, 0),
    }
  }).filter(x => x.count > 0)
  const maxOrigin = Math.max(...byOrigin.map(x => x.revenue), 1)

  // ── By project ──────────────────────────────────────────────────────────────
  const byProject = projects.map(p => {
    const list = paidNow.filter(o => o.projectId === p.id)
    return {
      id: p.id,
      name: p.name,
      revenue: list.reduce((s, o) => s + o.value, 0),
      count: list.length,
    }
  }).filter(x => x.revenue > 0).sort((a, b) => b.revenue - a.revenue)
  const maxProject = Math.max(...byProject.map(x => x.revenue), 1)

  const PERIOD_LABELS: Record<Period, string> = {
    '7d':  '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    'all': 'Tudo',
  }

  if (loading) return null
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--t-text-primary)' }}>
            Métricas
          </h2>
          <p className="text-sm" style={{ color: 'var(--t-text-muted)' }}>
            Vendas, CRM, conteúdo e financeiro consolidados · últimos {PERIOD_LABELS[period]}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
            style={{
              background: 'var(--t-surface)',
              color: 'var(--t-text-secondary)',
              border: '1px solid var(--t-border)',
            }}
          >
            <option value="all">Todos os projetos</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--t-border)' }}>
            {(['7d', '30d', '90d', 'all'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: period === p ? 'var(--t-accent-soft)' : 'transparent',
                  color: period === p ? 'var(--t-accent)' : 'var(--t-text-secondary)',
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Receita"
          value={fmtShort(revenueNow)}
          delta={revenueDelta}
          icon={DollarSign}
          color="var(--t-accent)"
        />
        <KpiCard
          label="Lucro"
          value={fmtShort(profitNow)}
          sub={`margem ${pct(profitMargin)}`}
          icon={TrendingUp}
          color={profitNow >= 0 ? '#10b981' : '#ef4444'}
        />
        <KpiCard
          label="Pedidos Pagos"
          value={`${paidNow.length}`}
          sub={avgTicket > 0 ? `ticket ${fmtShort(avgTicket)}` : undefined}
          icon={ShoppingCart}
          color="var(--t-accent)"
        />
        <KpiCard
          label="Conversão Leads"
          value={pct(conversionRate)}
          sub={`${leadsWon} ganhos · ${leadsLost} perdidos`}
          icon={Target}
          color={conversionRate >= 30 ? '#10b981' : conversionRate >= 15 ? 'var(--t-accent)' : '#f59e0b'}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Views (Conteúdo)"
          value={totalViews.toLocaleString('pt-BR')}
          sub={`${contentPosted.length} posts`}
          icon={Video}
          color="var(--t-accent)"
        />
        <KpiCard
          label="Leads do Conteúdo"
          value={`${totalLeadsFromContent}`}
          sub={contentConversion > 0 ? `→ ${totalSalesFromContent} vendas (${pct(contentConversion)})` : undefined}
          icon={Users}
          color="var(--t-accent)"
        />
        <KpiCard
          label="Valor em Estoque"
          value={fmtShort(stockValue)}
          sub={`${inventoryScope.length} itens`}
          icon={Package}
          color="#3b82f6"
        />
        <KpiCard
          label="Estoque Baixo"
          value={`${lowStock}`}
          sub={lowStock === 0 ? 'tudo em ordem' : 'requer atenção'}
          icon={Package}
          color={lowStock === 0 ? '#10b981' : '#f59e0b'}
        />
      </div>

      {/* Breakdown panels */}
      <div className="grid md:grid-cols-2 gap-3">
        <Panel title="Receita por Origem" empty={byOrigin.length === 0}>
          {byOrigin.map(x => (
            <BarRow
              key={x.origin}
              label={x.origin}
              count={`${x.count} pedidos`}
              value={fmtShort(x.revenue)}
              pct={(x.revenue / maxOrigin) * 100}
            />
          ))}
        </Panel>

        <Panel title="Receita por Projeto" empty={byProject.length === 0}>
          {byProject.slice(0, 6).map(x => (
            <BarRow
              key={x.id}
              label={x.name}
              count={`${x.count} pedidos`}
              value={fmtShort(x.revenue)}
              pct={(x.revenue / maxProject) * 100}
            />
          ))}
        </Panel>
      </div>
    </div>
  )
}

function KpiCard({
  label, value, sub, delta, icon: Icon, color,
}: {
  label: string
  value: string
  sub?: string
  delta?: number | null
  icon: React.ElementType
  color: string
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--t-card-from)',
        border: '1px solid var(--t-card-border)',
        boxShadow: 'var(--t-card-shadow)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: 'var(--t-accent-soft)' }}
        >
          <Icon size={13} style={{ color }} />
        </div>
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--t-text-muted)' }}
        >
          {label}
        </span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <div className="flex items-center gap-2 mt-1 min-h-[1rem]">
        {delta !== null && delta !== undefined && (
          <span
            className="text-[11px] flex items-center gap-0.5 font-medium"
            style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}
          >
            {delta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {sub && (
          <span className="text-[11px]" style={{ color: 'var(--t-text-muted)' }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

function Panel({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--t-card-from)',
        border: '1px solid var(--t-card-border)',
        boxShadow: 'var(--t-card-shadow)',
      }}
    >
      <p className="text-sm font-medium mb-4" style={{ color: 'var(--t-text-primary)' }}>
        {title}
      </p>
      {empty ? (
        <p className="text-xs" style={{ color: 'var(--t-text-muted)' }}>
          Sem dados no período.
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  )
}

function BarRow({ label, count, value, pct }: {
  label: string; count: string; value: string; pct: number
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-xs capitalize truncate" style={{ color: 'var(--t-text-primary)' }}>
            {label}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--t-text-muted)' }}>
            {count}
          </span>
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--t-text-primary)' }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--t-hover)' }}>
        <div
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--t-accent), #10b981)',
          }}
          className="h-full rounded-full transition-all duration-500"
        />
      </div>
    </div>
  )
}
