export type TransactionType = 'income' | 'expense'

export type IncomeCategory =
  | 'product_sale'
  | 'service_sale'
  | 'affiliate_income'
  | 'other_income'

export type ExpenseCategory =
  | 'filament'
  | 'equipment'
  | 'ads'
  | 'shipping'
  | 'software'
  | 'commission'
  | 'other_expense'

export type TransactionCategory = IncomeCategory | ExpenseCategory

export interface Transaction {
  id: string
  projectId: string
  type: TransactionType
  category: TransactionCategory
  description: string
  value: number
  date: string
  source: string
}

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  product_sale:    'Venda de Produto',
  service_sale:    'Venda de Serviço',
  affiliate_income:'Renda de Afiliado',
  other_income:    'Outra Receita',
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  filament:      'Filamento',
  equipment:     'Equipamento',
  ads:           'Anúncios',
  shipping:      'Frete',
  software:      'Software',
  commission:    'Comissão',
  other_expense: 'Outra Despesa',
}
