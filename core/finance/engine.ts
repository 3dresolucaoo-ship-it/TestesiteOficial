import type { Transaction, TransactionType } from './types'

export function calcRevenue(transactions: Transaction[], projectId?: string): number {
  return transactions
    .filter(t => t.type === 'income' && (!projectId || t.projectId === projectId))
    .reduce((sum, t) => sum + t.value, 0)
}

export function calcExpenses(transactions: Transaction[], projectId?: string): number {
  return transactions
    .filter(t => t.type === 'expense' && (!projectId || t.projectId === projectId))
    .reduce((sum, t) => sum + t.value, 0)
}

export function calcProfit(transactions: Transaction[], projectId?: string): number {
  return calcRevenue(transactions, projectId) - calcExpenses(transactions, projectId)
}

export interface MonthlyRow {
  month: string
  income: number
  expense: number
  profit: number
}

export function monthlyBreakdown(transactions: Transaction[], projectId?: string): MonthlyRow[] {
  const filtered = projectId ? transactions.filter(t => t.projectId === projectId) : transactions
  const map: Record<string, { income: number; expense: number }> = {}

  for (const t of filtered) {
    const month = t.date.slice(0, 7)
    if (!map[month]) map[month] = { income: 0, expense: 0 }
    if (t.type === 'income') map[month].income += t.value
    else map[month].expense += t.value
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, ...d, profit: d.income - d.expense }))
}

export function revenueByProject(transactions: Transaction[], projectIds: string[]) {
  return projectIds.map(id => ({
    projectId: id,
    revenue:  calcRevenue(transactions, id),
    expenses: calcExpenses(transactions, id),
    profit:   calcProfit(transactions, id),
  }))
}

export function exportCsv(transactions: Transaction[], projectId?: string): string {
  const rows = projectId ? transactions.filter(t => t.projectId === projectId) : transactions
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date))
  const header = 'Data,Tipo,Categoria,Descricao,Valor,Fonte'
  const lines = sorted.map(t =>
    `${t.date},${t.type},${t.category},"${t.description.replace(/"/g, "''")}",${t.value.toFixed(2)},"${t.source}"`
  )
  return [header, ...lines].join('\n')
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function categoryBreakdown(
  transactions: Transaction[],
  type: TransactionType,
  projectId?: string,
): Array<{ category: string; value: number }> {
  const filtered = transactions.filter(
    t => t.type === type && (!projectId || t.projectId === projectId),
  )
  const map: Record<string, number> = {}
  for (const t of filtered) map[t.category] = (map[t.category] ?? 0) + t.value
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([category, value]) => ({ category, value }))
}

export function profitMargin(transactions: Transaction[], projectId?: string): number {
  const rev = calcRevenue(transactions, projectId)
  if (rev === 0) return 0
  return (calcProfit(transactions, projectId) / rev) * 100
}
