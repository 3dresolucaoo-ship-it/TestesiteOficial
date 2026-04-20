import type { AppState } from '@/lib/types'
import { calcRevenue, calcExpenses, calcProfit } from '@/core/finance/engine'

export function getGlobalStats(state: AppState) {
  const revenue  = calcRevenue(state.transactions)
  const expenses = calcExpenses(state.transactions)
  const profit   = calcProfit(state.transactions)
  const activeOrders   = state.orders.filter(o => o.status === 'paid' || o.status === 'quote_sent').length
  const printing       = state.production.filter(p => p.status === 'printing').length
  const contentPosted  = state.content.filter(c => c.status === 'posted').length
  const totalViews     = state.content.filter(c => c.status === 'posted').reduce((s, c) => s + c.views, 0)
  const activeLeads    = state.leads.filter(l => l.status !== 'won' && l.status !== 'lost').length
  const wonLeads       = state.leads.filter(l => l.status === 'won').length
  const lowStock       = state.inventory.filter(i => i.quantity <= (i.minStock ?? 2)).length

  return { revenue, expenses, profit, activeOrders, printing, contentPosted, totalViews, activeLeads, wonLeads, lowStock }
}

export function getProjectStats(state: AppState, projectId: string) {
  const orders    = state.orders.filter(o => o.projectId === projectId)
  const revenue   = calcRevenue(state.transactions, projectId)
  const expenses  = calcExpenses(state.transactions, projectId)
  const leads     = state.leads.filter(l => l.projectId === projectId)
  const inventory = state.inventory.filter(i => i.projectId === projectId)
  const content   = state.content.filter(c => c.projectId === projectId)
  const production = state.production.filter(p =>
    orders.some(o => o.id === p.orderId)
  )

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    totalOrders:   orders.length,
    activeOrders:  orders.filter(o => o.status === 'paid' || o.status === 'quote_sent').length,
    leads:         leads.length,
    wonLeads:      leads.filter(l => l.status === 'won').length,
    lowStock:      inventory.filter(i => i.quantity <= 2).length,
    contentPosted: content.filter(c => c.status === 'posted').length,
    totalViews:    content.filter(c => c.status === 'posted').reduce((s, c) => s + c.views, 0),
    printing:      production.filter(p => p.status === 'printing').length,
    waiting:       production.filter(p => p.status === 'waiting').length,
  }
}

export function revenuePerProject(state: AppState) {
  return state.projects.map(p => ({
    ...p,
    revenue:  calcRevenue(state.transactions, p.id),
    expenses: calcExpenses(state.transactions, p.id),
    profit:   calcProfit(state.transactions, p.id),
    orders:   state.orders.filter(o => o.projectId === p.id).length,
  }))
}
