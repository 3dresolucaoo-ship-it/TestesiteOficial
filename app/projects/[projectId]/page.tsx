'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getProjectStats } from '@/core/analytics/engine'
import { getProjectColor, MODULE_CONFIG } from '@/lib/moduleConfig'
import type { ProjectModule } from '@/lib/types'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, ShoppingCart, Printer, Users, Package,
  Eye, ArrowRight, DollarSign,
} from 'lucide-react'

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function Stat({ label, value, sub, icon: Icon, color = 'text-[#a78bfa]', bg = 'bg-[#7c3aed1a]' }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string; bg?: string
}) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bg}`}><Icon size={13} strokeWidth={1.5} className={color} /></div>
        <span className="text-[#555555] text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[#ebebeb] text-2xl font-bold">{value}</p>
      {sub && <p className="text-[#555555] text-xs mt-1">{sub}</p>}
    </div>
  )
}

const MODULE_ICONS: Partial<Record<ProjectModule, React.ElementType>> = {
  finance:    TrendingUp,
  crm:        Users,
  inventory:  Package,
  content:    Eye,
  operations: Printer,
}

export default function ProjectDashboardPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { state, loading } = useStore()

  const project = state.projects.find(p => p.id === projectId)
  if (loading) return null
  if (!project) return (
    <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
      <p className="text-[#ebebeb] text-lg font-semibold">Projeto não encontrado</p>
      <Link href="/projects" className="text-[#7c3aed] hover:text-[#a78bfa] text-sm transition-colors">← Ver todos os projetos</Link>
    </div>
  )

  const color  = getProjectColor(project)
  const stats  = getProjectStats(state, projectId)
  const modules = project.modules ?? []

  const recentOrders = state.orders
    .filter(o => o.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const recentTx = state.transactions
    .filter(t => t.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const activeLeads = state.leads.filter(l => l.projectId === projectId && l.status !== 'won' && l.status !== 'lost')
  const lowStock = state.inventory.filter(i => i.projectId === projectId && i.quantity <= 2)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Project header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: color }}
        >
          {project.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-[#ebebeb] font-bold text-xl">{project.name}</h2>
          <p className="text-[#555555] text-sm">{project.description}</p>
        </div>
        <span
          className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full border"
          style={{ color, borderColor: color + '44', backgroundColor: color + '11' }}
        >
          {project.status === 'active' ? 'Ativo' : project.status === 'paused' ? 'Pausado' : 'Finalizado'}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Receita"        value={fmt(stats.revenue)}  sub="total faturado"     icon={TrendingUp}   color="text-[#10b981]" bg="bg-[#10b9811a]" />
        <Stat label="Despesas"       value={fmt(stats.expenses)} sub="total gasto"        icon={TrendingDown} color="text-[#ef4444]" bg="bg-[#ef44441a]" />
        <Stat label="Lucro"          value={fmt(stats.profit)}   sub={stats.profit >= 0 ? 'positivo' : 'negativo'} icon={DollarSign} color={stats.profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'} bg={stats.profit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]'} />
        <Stat label="Pedidos"        value={stats.totalOrders}   sub={`${stats.activeOrders} ativos`} icon={ShoppingCart} color="text-[#3b82f6]" bg="bg-[#3b82f61a]" />
      </div>

      {/* Module quick stats */}
      {modules.includes('crm') && (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Leads Ativos"  value={stats.leads}    sub={`${stats.wonLeads} fechados`} icon={Users}    color="text-[#f59e0b]" bg="bg-[#f59e0b1a]" />
          <Stat label="Views Total"   value={stats.totalViews.toLocaleString('pt-BR')} sub={`${stats.contentPosted} postados`} icon={Eye} color="text-[#a78bfa]" bg="bg-[#7c3aed1a]" />
        </div>
      )}
      {modules.includes('inventory') && stats.lowStock > 0 && (
        <div className="flex items-center gap-3 bg-[#f59e0b0f] border border-[#f59e0b22] rounded-xl px-4 py-3">
          <Package size={15} className="text-[#f59e0b] shrink-0" />
          <span className="text-[#f59e0b] text-sm">{stats.lowStock} item(s) com estoque baixo</span>
          <Link href={`/projects/${projectId}/inventory`} className="ml-auto text-[#f59e0b] text-xs hover:underline">
            Ver estoque →
          </Link>
        </div>
      )}
      {activeLeads.length > 0 && modules.includes('crm') && (
        <div className="flex items-center gap-3 bg-[#3b82f60f] border border-[#3b82f622] rounded-xl px-4 py-3">
          <Users size={15} className="text-[#3b82f6] shrink-0" />
          <span className="text-[#3b82f6] text-sm">{activeLeads.length} lead(s) aguardando ação</span>
          <Link href={`/projects/${projectId}/crm`} className="ml-auto text-[#3b82f6] text-xs hover:underline">
            Ver CRM →
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#ebebeb] text-sm font-medium">Transações Recentes</h3>
            <Link href={`/projects/${projectId}/finance`} className="text-[#888888] hover:text-[#ebebeb] text-xs flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-[#555555] text-sm">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c] last:border-0">
                  <div>
                    <p className="text-[#ebebeb] text-sm">{t.description}</p>
                    <p className="text-[#555555] text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#ebebeb] text-sm font-medium">Pedidos Recentes</h3>
            <Link href="/orders" className="text-[#888888] hover:text-[#ebebeb] text-xs flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-[#555555] text-sm">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c] last:border-0">
                  <div>
                    <p className="text-[#ebebeb] text-sm">{o.clientName}</p>
                    <p className="text-[#555555] text-xs truncate max-w-[160px]">{o.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#ebebeb] text-sm font-semibold">R$ {o.value}</p>
                    <p className="text-[#555555] text-xs capitalize">{o.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module quick access */}
      <div>
        <h3 className="text-[#555555] text-xs font-semibold uppercase tracking-widest mb-3">Módulos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {modules.map(mod => {
            const cfg = MODULE_CONFIG[mod]
            if (!cfg) return null
            const Icon = MODULE_ICONS[mod] ?? TrendingUp
            return (
              <Link
                key={mod}
                href={cfg.href(projectId)}
                className="flex items-center gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors group"
              >
                <div className="p-2 rounded-lg bg-[#1c1c1c] group-hover:bg-[#2a2a2a] transition-colors">
                  <Icon size={15} strokeWidth={1.5} className="text-[#888888] group-hover:text-[#ebebeb] transition-colors" />
                </div>
                <span className="text-[#888888] text-sm group-hover:text-[#ebebeb] transition-colors">{cfg.label}</span>
                <ArrowRight size={12} className="ml-auto text-[#3a3a3a] group-hover:text-[#888888] transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
