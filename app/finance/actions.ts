'use server'

/**
 * app/finance/actions.ts — Server Actions pro módulo Financeiro (transactions).
 *
 * Mesmo motivo dos outros actions (ADR 031): supabase.auth.getUser() do
 * browser client trava 8-12s em Vercel Fluid Compute cold-start. Resultado:
 * transactionsService.create/update/delete via syncAction NUNCA persistem
 * em prod.
 *
 * Cobertura: createTransaction / updateTransaction / deleteTransaction.
 *
 * Custos fixos + meta de lucro continuam via `/api/finance/fixed-costs` e
 * `/api/finance/profit-goal` (já são server-side via API routes — não
 * sofrem o bug).
 */

import { createServerClient }      from '@/lib/supabaseServer'
import { revalidatePath }          from 'next/cache'
import { z }                       from 'zod'
import type {
  Transaction, TransactionType, TransactionCategory, IncomeCategory, ExpenseCategory,
} from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const INCOME_CATEGORIES:  readonly IncomeCategory[]  = ['product_sale', 'service_sale', 'affiliate_income', 'other_income'] as const
const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = ['filament', 'equipment', 'ads', 'shipping', 'software', 'commission', 'other_expense'] as const

const TRANSACTION_CATEGORIES: readonly TransactionCategory[] = [
  ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES,
] as const

const CreateTransactionSchema = z.object({
  id:          z.string().min(1),
  projectId:   z.string().min(1),
  type:        z.enum(['income', 'expense']),
  category:    z.enum([
    'product_sale', 'service_sale', 'affiliate_income', 'other_income',
    'filament', 'equipment', 'ads', 'shipping', 'software', 'commission', 'other_expense',
  ]),
  description: z.string().default(''),
  value:       z.number().min(0),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data YYYY-MM-DD'),
  source:      z.string().default(''),
})

const UpdateTransactionSchema = CreateTransactionSchema

const DeleteTransactionSchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Nao autenticado')
  }
  return { supabase, userId: user.id }
}

function txToDB(t: z.output<typeof CreateTransactionSchema>, userId: string) {
  return {
    id:          t.id,
    project_id:  t.projectId,
    type:        t.type,
    category:    t.category,
    description: t.description,
    value:       t.value,
    date:        t.date,
    source:      t.source,
    user_id:     userId,
  }
}

function buildTransactionReturn(t: z.output<typeof CreateTransactionSchema>): Transaction {
  return {
    id:          t.id,
    projectId:   t.projectId,
    type:        t.type as TransactionType,
    category:    t.category as TransactionCategory,
    description: t.description,
    value:       t.value,
    date:        t.date,
    source:      t.source,
  }
}

// ─── Server Action: criar transação ───────────────────────────────────────────

export async function createTransaction(
  rawInput: z.input<typeof CreateTransactionSchema>,
): Promise<
  | { success: true; transaction: Transaction }
  | { success: false; error: string }
> {
  const parsed = CreateTransactionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase.from('transactions').insert(txToDB(parsed.data, userId))
  if (error) {
    return { success: false, error: `Erro Supabase: ${error.message}` }
  }

  revalidatePath('/finance')
  revalidatePath('/dashboard')

  return { success: true, transaction: buildTransactionReturn(parsed.data) }
}

// ─── Server Action: editar transação ──────────────────────────────────────────

export async function updateTransaction(
  rawInput: z.input<typeof UpdateTransactionSchema>,
): Promise<
  | { success: true; transaction: Transaction }
  | { success: false; error: string }
> {
  const parsed = UpdateTransactionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await supabase
    .from('transactions')
    .update(txToDB(parsed.data, userId))
    .eq('id', parsed.data.id)
    .eq('user_id', userId)
    .eq('project_id', parsed.data.projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar transacao: ${error.message}` }
  }

  revalidatePath('/finance')
  revalidatePath('/dashboard')

  return { success: true, transaction: buildTransactionReturn(parsed.data) }
}

// ─── Server Action: deletar transação ─────────────────────────────────────────

export async function deleteTransaction(
  rawInput: z.input<typeof DeleteTransactionSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteTransactionSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { id, projectId } = parsed.data
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao deletar transacao: ${error.message}` }
  }

  revalidatePath('/finance')
  revalidatePath('/dashboard')

  return { success: true }
}
