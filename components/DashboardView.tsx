'use client'

import { useStore }                from '@/lib/store'
import { getGlobalStats, revenuePerProject } from '@/core/analytics/engine'
import { getTopPerformingContent, conversionRate, platformBreakdown } from '@/core/analytics/contentEngine'
import { getProductionIntelligence } from '@/core/analytics/productionEngine'
import { monthlyBreakdown }         from '@/core/finance/engine'
import { RevenueLineChart }         from '@/components/FinanceCharts'
import { getProjectColor }          from '@/lib/moduleConfig'
import Link                         from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Printer, Eye,
  ArrowUpRight, AlertTriangle, Zap, BarChart3, Target, Cpu, Flame,
  Package, Layers, Activity,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Section, StatCard, Panel, fmt, fmtFull } from './dashboard/shared'

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-[rgba(255,255,255,0.05)] rounded-lg w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.06)]" />
        ))}
      </div>
      <div className="h-40 bg-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.06)]" />
    </div>
  )
}

type AppState = ReturnType<typeof useStore>['state']

export function DashboardView({ initialState }: { initialState: AppState }) {
  const [state] = useState(initialState)

  const stats     = getGlobalStats(state)
  const byProject = revenuePerProject(state)

  const recentTx = useMemo(
    () => [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [state.transactions],
  )

  const monthly          = useMemo(() => monthlyBreakdown(state.transactions).slice(-6), [state.transactions])
  const revenueSparkData = monthly.map(r => r.income)
  const profitSparkData  = monthly.map(r => r.profit)
  const expenseSparkData = monthly.map(r => r.expense)

  const prodIntel  = useMemo(
    () => getProductionIntelligence(state.products, state.orders, state.inventory),
    [state.products, state.orders, state.inventory],
  )
  const hasProdData = prodIntel.ordersWithProduct > 0

  const topContent           = getTopPerformingContent(state.content, 3, 'views')
  const allLeads             = state.leads
  const wonLeads             = allLeads.filter(l => l.status === 'won').length
  const globalConversionRate = conversionRate(allLeads.length, wonLeads)
  const platforms            = platformBreakdown(state.content)

  const bestProject = byProject.length > 0
    ? byProject.reduce((best, p) => {
        const margin     = p.revenue > 0 ? (p.profit / p.revenue) * 100 : -Infinity
        const bestMargin = best.revenue > 0 ? (best.profit / best.revenue) * 100 : -Infinity
        return margin > bestMargin ? p : best
      })
    : null

  const inventoryValue = useMemo(
    () => state.inventory.reduce((s, i) => s + i.quantity * i.costPrice, 0),
    [state.inventory],
  )
  const inventoryProfitPotential = useMemo(
    () => state.inventory.reduce((s, i) => s + i.quantity * (i.salePrice - i.costPrice), 0),
    [state.inventory],
  )
  const topInventoryItems = useMemo(
    () =>
      [...state.inventory]
        .map(i => ({
          ...i,
          totalValue: i.quantity * i.costPrice,
          profitPot:  i.quantity * (i.salePrice - i.costPrice),
        }))
        .filter(i => i.totalValue > 0)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5),
    [state.inventory],
  )

  const alerts: string[] = []
  if (stats.lowStock > 0) alerts.push(`${stats.lowStock} item(s) com estoque baixo`)
  if (stats.printing > 0) alerts.push(`${stats.printing} impressora(s) em operação`)
  const pendingLeads = state.leads.filter(l => l.status === 'new').length
  if (pendingLeads > 0) alerts.push(`${pendingLeads} lead(s) novo(s) aguardando contato`)

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <div className="flex items-start justify-between pt-1">
        <div>
          <h2 className="gradient-text font-bold text-xl tracking-tight">Sistema Operacional</h2>
          <p className="text-[#444455] text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.printing > 0 && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-[#10b981]"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 12px rgba(16,185,129,0.2)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] glow-pulse-green inline-block" />
              {stats.printing} imprimindo
            </span>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.20)',
            boxShadow: '0 0 20px rgba(245,158,11,0.08)',
          }}
        >
          <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {alerts.map((a, i) => (
              <span key={i} className="text-[#f59e0b] text-sm">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Finance ──────────────────────────────────────────────────────────── */}
      <Section title="Visão Financeira" icon={TrendingUp} iconColor="text-[#10b981]" href="/finance">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Receita Total" value={fmt(stats.revenue)} sub={`${state.transactions.filter(t => t.type === 'income').length} transações`} icon={TrendingUp} accentColor="#10b981" sparkData={revenueSparkData} sparkColor="#10b981" />
          <StatCard label="Despesas" value={fmt(stats.expenses)} sub="todas as categorias" icon={TrendingDown} accentColor="#ef4444" sparkData={expenseSparkData} sparkColor="#ef4444" />
          <StatCard label="Lucro Líquido" value={fmt(stats.profit)} sub={stats.profit >= 0 ? 'resultado positivo' : 'resultado negativo'} icon={DollarSign} accentColor={stats.profit >= 0 ? '#10b981' : '#ef4444'} sparkData={profitSparkData} sparkColor={stats.profit >= 0 ? '#10b981' : '#ef4444'} />
          <StatCard label="Pedidos Ativos" value={String(stats.activeOrders)} sub={`${state.orders.length} total`} icon={ShoppingCart} accentColor="#3b82f6" />
        </div>
        {monthly.length >= 2 && (
          <Panel>
            <p className="text-[#555566] text-[11px] font-semibold uppercase tracking-wider mb-4">Receita &amp; Lucro — Últimos {monthly.length} meses</p>
            <RevenueLineChart rows={monthly} height={120} />
          </Panel>
        )}
      </Section>

      {/* ── Operations ───────────────────────────────────────────────────────── */}
      <Section title="Operações" icon={Printer} iconColor="text-[#f59e0b]" href="/production">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Em Produção" value={String(stats.printing)} sub={`${state.production.filter(p => p.status === 'waiting').length} aguardando`} icon={Printer} accentColor="#f59e0b" />
          <StatCard label="Valor em Estoque" value={fmt(inventoryValue)} sub={`potencial ${fmt(inventoryProfitPotential)}`} icon={Package} accentColor="#a78bfa" />
          <StatCard label="Leads Ativos" value={String(stats.activeLeads)} sub={`${stats.wonLeads} fechados`} icon={Target} accentColor="#10b981" />
          <StatCard label="Views (Conteúdo)" value={stats.totalViews.toLocaleString('pt-BR')} sub={`${stats.contentPosted} postados`} icon={Eye} accentColor="#a78bfa" />
        </div>
      </Section>

      {/* ── Projects & Transactions ──────────────────────────────────────────── */}
      <Section title="Projetos & Transações" icon={BarChart3} iconColor="text-[#3b82f6]">
        <div className="grid lg:grid-cols-5 gap-4">
          <Panel className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#f0f0f5] font-medium text-sm">Performance por Projeto</p>
              <Link href="/projects" className="text-[#444455] hover:text-[#f0f0f5] transition-colors"><ArrowUpRight size={14} /></Link>
            </div>
            {byProject.length === 0 ? (
              <p className="text-[#444455] text-xs py-4">Nenhum projeto ainda.</p>
            ) : (
              <div className="space-y-4">
                {byProject.map(p => {
                  const color      = getProjectColor(p)
                  const maxRevenue = Math.max(...byProject.map(x => x.revenue), 1)
                  const pct        = (p.revenue / maxRevenue) * 100
                  const margin     = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
                  return (
                    <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-4 group">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[#f0f0f5] text-xs font-medium group-hover:text-white transition-colors truncate">{p.name}</span>
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <span className={`text-[11px] font-medium ${margin >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{margin.toFixed(0)}%</span>
                            <span className="text-[#f0f0f5] text-xs font-bold">{fmt(p.revenue)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color}66)`, boxShadow: `0 0 8px ${color}50` }} />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[#444455] text-[11px]">Desp. {fmt(p.expenses)}</span>
                          <span className={`text-[11px] font-medium ${p.profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>Lucro {fmt(p.profit)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Panel>

          <Panel className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#f0f0f5] font-medium text-sm">Transações Recentes</p>
              <Link href="/finance" className="text-[#444455] hover:text-[#f0f0f5] transition-colors"><ArrowUpRight size={14} /></Link>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-[#444455] text-xs py-4">Nenhuma transação ainda.</p>
            ) : (
              <div className="space-y-px">
                {recentTx.map(t => {
                  const project = state.projects.find(p => p.id === t.projectId)
                  const color   = project ? getProjectColor(project) : '#7c3aed'
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] rounded-lg px-2 -mx-2 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0f5] text-xs truncate">{t.description}</p>
                        <p className="text-[#444455] text-[11px]">{project?.name ?? '—'}</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 tabular-nums ${t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {t.type === 'income' ? '+' : '−'}{fmt(Number(t.value))}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      </Section>

      {/* ── Inventory Intelligence ───────────────────────────────────────────── */}
      {state.inventory.length > 0 && (
        <Section title="Inteligência de Estoque" icon={Layers} iconColor="text-[#a78bfa]" href="/inventory" collapsible>
          <Panel glow="#7c3aed">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Valor Total',    value: fmt(inventoryValue),           color: '#a78bfa' },
                { label: 'Lucro Potencial', value: fmt(inventoryProfitPotential), color: inventoryProfitPotential >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Itens',          value: String(state.inventory.length), color: '#3b82f6' },
                { label: 'Alertas',        value: String(stats.lowStock),         color: stats.lowStock > 0 ? '#f59e0b' : '#444455' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl px-4 py-3" style={{ background: `${color}0d`, border: `1px solid ${color}22` }}>
                  <p className="text-[#555566] text-[11px] mb-1">{label}</p>
                  <p className="text-sm font-bold tabular-nums" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
            {topInventoryItems.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[#444455] text-[11px] font-semibold uppercase tracking-widest mb-3">Maiores Valores em Estoque</p>
                {topInventoryItems.map(item => {
                  const maxVal = topInventoryItems[0].totalValue
                  const pct    = (item.totalValue / maxVal) * 100
                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#f0f0f5] text-xs truncate">{item.name}</span>
                          <span className="text-[#444455] text-[10px] whitespace-nowrap">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className={`text-[11px] font-medium ${item.profitPot >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>+{fmtFull(item.profitPot)}</span>
                          <span className="text-[#f0f0f5] text-xs font-bold tabular-nums">{fmt(item.totalValue)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', boxShadow: '0 0 8px rgba(124,58,237,0.4)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </Section>
      )}

      {/* ── Production Intelligence ──────────────────────────────────────────── */}
      {hasProdData && (
        <Section title="Inteligência de Produção" icon={Cpu} iconColor="text-[#7c3aed]" href="/products" collapsible>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Custo Produção',   value: fmt(prodIntel.totalProductionCost), color: '#f59e0b', icon: Zap },
                { label: 'Receita Produtos', value: fmt(prodIntel.totalRevenue),        color: '#10b981', icon: TrendingUp },
                { label: 'Lucro Produtos',   value: fmt(prodIntel.totalProfit),         color: prodIntel.totalProfit >= 0 ? '#10b981' : '#ef4444', icon: DollarSign },
                { label: 'Margem Geral',     value: `${prodIntel.overallMargin.toFixed(1)}%`, color: prodIntel.overallMargin >= 40 ? '#a78bfa' : prodIntel.overallMargin >= 20 ? '#f59e0b' : '#ef4444', icon: Flame },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]" style={{ background: `${color}0d`, border: `1px solid ${color}22`, boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#555566] text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                    <div className="p-1 rounded-md" style={{ background: `${color}1a` }}><Icon size={12} strokeWidth={1.5} style={{ color }} /></div>
                  </div>
                  <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {(prodIntel.bestProduct || prodIntel.worstProduct) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {prodIntel.bestProduct && (
                  <div className="rounded-xl px-4 py-3 flex items-start justify-between" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.20)', boxShadow: '0 0 20px rgba(16,185,129,0.08)' }}>
                    <div>
                      <p className="text-[#444455] text-[10px] font-semibold uppercase tracking-wider mb-1">Mais Rentável</p>
                      <p className="text-[#f0f0f5] text-sm font-semibold">{prodIntel.bestProduct.product.name}</p>
                      <p className="text-[#555566] text-xs mt-0.5">{prodIntel.bestProduct.orderCount} pedido(s) · {fmt(prodIntel.bestProduct.totalProfit)} lucro</p>
                    </div>
                    <span className="text-[#10b981] text-xl font-bold shrink-0" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>{prodIntel.bestProduct.avgMargin.toFixed(0)}%</span>
                  </div>
                )}
                {prodIntel.worstProduct && (
                  <div className="rounded-xl px-4 py-3 flex items-start justify-between" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.20)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
                    <div>
                      <p className="text-[#444455] text-[10px] font-semibold uppercase tracking-wider mb-1">Menos Rentável</p>
                      <p className="text-[#f0f0f5] text-sm font-semibold">{prodIntel.worstProduct.product.name}</p>
                      <p className="text-[#555566] text-xs mt-0.5">{prodIntel.worstProduct.orderCount} pedido(s) · margem {prodIntel.worstProduct.avgMargin.toFixed(1)}%</p>
                    </div>
                    <span className="text-xl font-bold shrink-0" style={{ color: prodIntel.worstProduct.avgMargin < 20 ? '#ef4444' : '#f59e0b', textShadow: `0 0 20px ${prodIntel.worstProduct.avgMargin < 20 ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}` }}>{prodIntel.worstProduct.avgMargin.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Performance Intelligence ─────────────────────────────────────────── */}
      <Section title="Performance Intelligence" icon={Activity} iconColor="text-[#7c3aed]" collapsible>
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye size={13} className="text-[#a78bfa]" />
                <h4 className="text-[#f0f0f5] text-sm font-medium">Top Conteúdo</h4>
              </div>
              <Link href="/content" className="text-[#444455] hover:text-[#f0f0f5] transition-colors"><ArrowUpRight size={13} /></Link>
            </div>
            {topContent.length === 0 ? (
              <p className="text-[#444455] text-xs">Nenhum conteúdo postado ainda.</p>
            ) : (
              <div className="space-y-3.5">
                {topContent.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <span className="text-xs font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: i === 0 ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#a78bfa' : '#444455' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f0f0f5] text-xs leading-snug truncate">{c.idea}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#444455] text-[11px]">{c.views.toLocaleString('pt-BR')} views</span>
                        {c.leads > 0 && <span className="text-[#10b981] text-[11px]">{c.leads} leads</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <div className="flex items-center gap-2 mb-4">
              <Target size={13} className="text-[#10b981]" />
              <h4 className="text-[#f0f0f5] text-sm font-medium">Conversão &amp; Margens</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[#555566] text-xs mb-2">Taxa de conversão de leads</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(globalConversionRate, 100)}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                  </div>
                  <span className="text-[#f0f0f5] text-sm font-bold w-12 text-right shrink-0">{globalConversionRate.toFixed(1)}%</span>
                </div>
                <p className="text-[#444455] text-[11px] mt-1">{wonLeads} de {allLeads.length} leads</p>
              </div>
              {bestProject && (
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-[#555566] text-xs mb-1">Melhor margem de lucro</p>
                  <Link href={`/projects/${bestProject.id}`} className="group">
                    <p className="text-[#f0f0f5] text-sm font-medium group-hover:text-white transition-colors">{bestProject.name}</p>
                    <p className="text-[#10b981] text-xs" style={{ textShadow: '0 0 8px rgba(16,185,129,0.4)' }}>
                      {bestProject.revenue > 0 ? `${((bestProject.profit / bestProject.revenue) * 100).toFixed(1)}% margem` : 'Sem receita'}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={13} className="text-[#f59e0b]" />
              <h4 className="text-[#f0f0f5] text-sm font-medium">Plataformas de Conteúdo</h4>
            </div>
            {platforms.length === 0 ? (
              <p className="text-[#444455] text-xs">Nenhum conteúdo postado ainda.</p>
            ) : (
              <div className="space-y-3.5">
                {platforms.map(p => {
                  const maxViews = Math.max(...platforms.map(x => x.views), 1)
                  const pct      = (p.views / maxViews) * 100
                  return (
                    <div key={p.platform}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#8888a0] text-xs capitalize">{p.platform}</span>
                        <span className="text-[#f0f0f5] text-xs font-semibold tabular-nums">{p.views.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', boxShadow: '0 0 6px rgba(124,58,237,0.5)' }} />
                      </div>
                      <p className="text-[#444455] text-[11px] mt-0.5">{p.count} posts · {p.leads} leads</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      </Section>

      {/* ── Quick Access ─────────────────────────────────────────────────────── */}
      {state.projects.length > 0 && (
        <Section title="Acesso Rápido" icon={Zap} iconColor="text-[#f59e0b]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {state.projects.map(p => {
              const color  = getProjectColor(p)
              const pStats = byProject.find(x => x.id === p.id)
              const margin = pStats && pStats.revenue > 0 ? (pStats.profit / pStats.revenue) * 100 : null
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group rounded-2xl p-4 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
                    border: `1px solid ${color}22`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.6), 0 0 20px ${color}20`
                    el.style.borderColor = `${color}44`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.transform = ''
                    el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'
                    el.style.borderColor = `${color}22`
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold mb-3" style={{ backgroundColor: `${color}1a`, color, boxShadow: `0 0 16px ${color}30` }}>
                    {p.name.charAt(0)}
                  </div>
                  <p className="text-[#f0f0f5] text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-[#444455] text-xs mt-0.5">{fmt(pStats?.revenue ?? 0)} receita</p>
                  {margin !== null && (
                    <p className={`text-xs mt-0.5 font-medium ${margin >= 20 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>{margin.toFixed(0)}% margem</p>
                  )}
                </Link>
              )
            })}
          </div>
        </Section>
      )}

      <div className="h-4" />
    </div>
  )
}
