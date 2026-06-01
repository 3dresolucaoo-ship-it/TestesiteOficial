'use server'

/**
 * app/crm/actions.ts — Server Actions pro golden path CRM.
 *
 * Por que existe (descoberto 01/06/2026 durante smoke test pre soft launch 13/06):
 * supabase.auth.getUser() do BROWSER CLIENT trava 8-12s+ em prod (Vercel Fluid
 * Compute cold-start + auth-js 2.106.0 dispara _refreshAccessToken sincrono).
 * Resultado: leadsService.create() (chamado via syncAction no store) nunca
 * persiste — lead aparece otimistico mas SQL retorna []. Cookie-based
 * createServerClient() funciona ok (SSR layout prova).
 *
 * Estratégia: WRITES criticos do golden path migram pra Server Actions.
 * READS continuam via store cliente + SSR initialState. Refactor estrutural
 * dos demais services vai pra Bloco 5 (ADR 030).
 *
 * Padrão de uso no client:
 *   const result = await createLead({ id: uid(), ...formData })
 *   if (result.success) rawDispatch({ type: 'ADD_LEAD', payload: lead })
 *
 * IMPORTANTE: usar rawDispatch (sem Supabase sync) — DB ja foi escrito pelo
 * Server Action. dispatch normal dispararia syncAction que chama
 * leadsService.create() que tem o bug.
 *
 * Referencia decisao: workflow G7 wv1c1yo49 — Bruna diagnostico +
 * Felipe plan + External research (GH issues #2344, #2111, #1594) +
 * Helena sintese.
 */

import { createServerClient }    from '@/lib/supabaseServer'
import { revalidatePath }        from 'next/cache'
import { z }                     from 'zod'
import type { Lead, Order, ContactSource, LeadStatus, OrderStatus, OrderOrigin } from '@/lib/types'

// ─── Schemas Zod ──────────────────────────────────────────────────────────────

const CONTACT_SOURCES = ['whatsapp', 'instagram', 'facebook', 'shopee', 'referral', 'catalog', 'other'] as const
const LEAD_STATUSES   = ['new', 'contacted', 'negotiating', 'won', 'lost'] as const
const ORDER_STATUSES  = ['lead', 'quote_sent', 'paid', 'delivered'] as const

const CreateLeadSchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
  name:      z.string().min(1, 'Nome obrigatorio'),
  contact:   z.string().default(''),
  source:    z.enum(CONTACT_SOURCES),
  status:    z.enum(LEAD_STATUSES),
  value:     z.number().min(0).default(0),
  notes:     z.string().default(''),
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
})

const ConvertLeadSchema = z.object({
  leadId:    z.string().min(1),
  projectId: z.string().min(1),
  orderId:   z.string().min(1),
  item:      z.string().min(1, 'Item obrigatorio'),
  value:     z.number().min(0),
  status:    z.enum(ORDER_STATUSES),
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Drag-and-drop kanban: muda status do lead ao soltar em outra coluna.
const UpdateLeadStatusSchema = z.object({
  leadId:    z.string().min(1),
  projectId: z.string().min(1),
  newStatus: z.enum(LEAD_STATUSES),
})

// Atualizar campos completos de um lead (editar via formulario).
const UpdateLeadSchema = z.object({
  id:        z.string().min(1),
  projectId: z.string().min(1),
  name:      z.string().min(1, 'Nome obrigatorio'),
  contact:   z.string().default(''),
  source:    z.enum(CONTACT_SOURCES),
  status:    z.enum(LEAD_STATUSES),
  value:     z.number().min(0).default(0),
  notes:     z.string().default(''),
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

// Deletar lead (guard multi-tenant).
const DeleteLeadSchema = z.object({
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

// Mapper ContactSource (lead) -> OrderOrigin (pedido)
// OrderOrigin = 'whatsapp' | 'instagram' | 'facebook' | 'other'
// Mesmo padrao de leadsService.convertToOrder pra consistencia.
const ORIGIN_MAP: Record<typeof CONTACT_SOURCES[number], OrderOrigin> = {
  whatsapp:  'whatsapp',
  instagram: 'instagram',
  facebook:  'facebook',
  shopee:    'other',
  referral:  'other',
  catalog:   'other',
  other:     'other',
}

// ─── Server Action: criar lead ────────────────────────────────────────────────

export async function createLead(
  rawInput: z.input<typeof CreateLeadSchema>,
): Promise<
  | { success: true; lead: Lead }
  | { success: false; error: string }
> {
  const parsed = CreateLeadSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const l = parsed.data
  const { error } = await supabase.from('leads').insert({
    id:         l.id,
    project_id: l.projectId,
    user_id:    userId,
    name:       l.name,
    contact:    l.contact,
    source:     l.source,
    status:     l.status,
    value:      l.value,
    notes:      l.notes,
    date:       l.date,
  })

  if (error) {
    return { success: false, error: `Erro Supabase: ${error.message}` }
  }

  // Revalida pra SSR re-buscar (badges sidebar, dashboard counts, etc)
  revalidatePath('/crm')
  revalidatePath('/dashboard')

  const lead: Lead = {
    id:        l.id,
    projectId: l.projectId,
    name:      l.name,
    contact:   l.contact,
    source:    l.source as ContactSource,
    status:    l.status as LeadStatus,
    value:     l.value,
    notes:     l.notes,
    date:      l.date,
  }

  return { success: true, lead }
}

// ─── Server Action: atualizar status do lead (drag-and-drop kanban) ──────────

export async function updateLeadStatus(
  rawInput: z.input<typeof UpdateLeadStatusSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = UpdateLeadStatusSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { leadId, projectId, newStatus } = parsed.data

  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus })
    .eq('id', leadId)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar status: ${error.message}` }
  }

  revalidatePath('/crm')
  revalidatePath('/dashboard')

  return { success: true }
}

// ─── Server Action: editar lead completo ──────────────────────────────────────

export async function updateLead(
  rawInput: z.input<typeof UpdateLeadSchema>,
): Promise<
  | { success: true; lead: Lead }
  | { success: false; error: string }
> {
  const parsed = UpdateLeadSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const l = parsed.data
  const { error } = await supabase
    .from('leads')
    .update({
      name:    l.name,
      contact: l.contact,
      source:  l.source,
      status:  l.status,
      value:   l.value,
      notes:   l.notes,
      date:    l.date,
    })
    .eq('id', l.id)
    .eq('user_id', userId)
    .eq('project_id', l.projectId)

  if (error) {
    return { success: false, error: `Erro ao atualizar lead: ${error.message}` }
  }

  revalidatePath('/crm')

  const lead: Lead = {
    id:        l.id,
    projectId: l.projectId,
    name:      l.name,
    contact:   l.contact,
    source:    l.source as ContactSource,
    status:    l.status as LeadStatus,
    value:     l.value,
    notes:     l.notes,
    date:      l.date,
  }

  return { success: true, lead }
}

// ─── Server Action: deletar lead ──────────────────────────────────────────────

export async function deleteLead(
  rawInput: z.input<typeof DeleteLeadSchema>,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = DeleteLeadSchema.safeParse(rawInput)
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
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (error) {
    return { success: false, error: `Erro ao deletar lead: ${error.message}` }
  }

  revalidatePath('/crm')
  revalidatePath('/dashboard')

  return { success: true }
}

// ─── Server Action: converter lead em pedido ──────────────────────────────────

export async function convertLeadToOrder(
  rawInput: z.input<typeof ConvertLeadSchema>,
): Promise<
  | { success: true; order: Order; alreadyConverted: boolean }
  | { success: false; error: string }
> {
  const parsed = ConvertLeadSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(i => i.message).join(', ') }
  }

  let supabase, userId
  try {
    ({ supabase, userId } = await getAuthenticatedClient())
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { leadId, projectId, orderId, item, value, status, date } = parsed.data

  // Multi-tenant guard: lead deve pertencer ao user + project
  const { data: leadRow, error: fetchErr } = await supabase
    .from('leads')
    .select('id, name, contact, source, converted_order_id')
    .eq('id', leadId)
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single()

  if (fetchErr || !leadRow) {
    return { success: false, error: 'Lead nao encontrado ou nao pertence ao projeto' }
  }

  // Idempotencia — lead ja convertido retorna o pedido existente
  if (leadRow.converted_order_id) {
    const { data: existing } = await supabase
      .from('orders')
      .select('*')
      .eq('id', leadRow.converted_order_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      const order: Order = {
        id:               existing.id,
        projectId:        existing.project_id,
        clientName:       existing.client_name,
        origin:           existing.origin as OrderOrigin,
        item:             existing.item,
        value:            Number(existing.value),
        status:           existing.status as OrderStatus,
        date:             existing.date,
        sourceLeadId:     existing.source_lead_id ?? undefined,
        customerWhatsapp: existing.customer_whatsapp ?? undefined,
        source:           existing.source ?? undefined,
      }
      return { success: true, order, alreadyConverted: true }
    }
  }

  // Insert pedido + update lead (atomico via 2 calls sequenciais, mesmo padrao do leadsService.convertToOrder)
  const source = (leadRow.source ?? 'other') as typeof CONTACT_SOURCES[number]
  const origin = ORIGIN_MAP[source] ?? 'manual'
  const whatsappDigits = leadRow.contact?.replace(/\D/g, '') ?? ''
  const customerWhatsapp = whatsappDigits.length >= 8 ? whatsappDigits : null

  const { error: insertErr } = await supabase.from('orders').insert({
    id:                orderId,
    project_id:        projectId,
    user_id:           userId,
    client_name:       leadRow.name,
    origin,
    item,
    value,
    status,
    date,
    source:            'manual',
    customer_whatsapp: customerWhatsapp,
    source_lead_id:    leadId,
  })

  if (insertErr) {
    return { success: false, error: `Erro ao criar pedido: ${insertErr.message}` }
  }

  // Marca lead como convertido + status won
  const { error: updateErr } = await supabase
    .from('leads')
    .update({ converted_order_id: orderId, status: 'won' })
    .eq('id', leadId)
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (updateErr) {
    // Pedido foi criado mas lead nao atualizou — caller deve tratar
    console.error('[convertLeadToOrder] order created but lead update failed:', updateErr.message)
  }

  revalidatePath('/crm')
  revalidatePath('/orders')
  revalidatePath('/dashboard')

  const order: Order = {
    id:               orderId,
    projectId,
    clientName:       leadRow.name,
    origin,
    item,
    value,
    status:           status as OrderStatus,
    date,
    source:           'manual',
    customerWhatsapp: customerWhatsapp ?? undefined,
    sourceLeadId:     leadId,
  }

  return { success: true, order, alreadyConverted: false }
}
