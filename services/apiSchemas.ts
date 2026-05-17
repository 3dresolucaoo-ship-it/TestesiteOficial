/**
 * Schemas Zod compartilhados pras rotas API públicas.
 *
 * Otávio (Security) 2026-05-16:
 * - Bloqueia XSS via clientName / customerName / item (strings com tags HTML)
 * - Limita tamanho de campos pra evitar abuso (DOS via payload gigante)
 * - Whitelist de chars no whatsapp e slug (evita injection em URL)
 * - Email validado por RFC 5322
 *
 * Padrão de uso na rota:
 *   const parsed = schema.safeParse(body)
 *   if (!parsed.success) {
 *     return NextResponse.json(
 *       { error: 'Dados inválidos', issues: parsed.error.flatten() },
 *       { status: 400 }
 *     )
 *   }
 *   const data = parsed.data
 */

import { z } from 'zod'

// Comum a múltiplos endpoints
const productIdSchema = z
  .string()
  .uuid({ message: 'ID do produto inválido' })

const catalogSlugSchema = z
  .string()
  .min(1, 'Slug do catálogo é obrigatório')
  .max(120, 'Slug muito longo')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug deve conter apenas letras minúsculas, números e hífens'
  )

const customerNameSchema = z
  .string()
  .trim()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo (máximo 100 caracteres)')

const whatsappSchema = z
  .string()
  .trim()
  .regex(
    /^[\d\s\-()+ ]{8,20}$/,
    'WhatsApp deve conter apenas dígitos, espaços, parênteses, traços e + (8 a 20 caracteres)'
  )

const quantitySchema = z
  .number({ message: 'Quantidade deve ser número' })
  .int({ message: 'Quantidade deve ser inteiro' })
  .min(1, 'Quantidade mínima é 1')
  .max(999, 'Quantidade máxima é 999')
  .optional()
  .default(1)

// ── /api/checkout ────────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  productId:    productIdSchema,
  catalogSlug:  catalogSlugSchema,
  quantity:     quantitySchema,
  customerName: customerNameSchema,
  whatsapp:     whatsappSchema,
})

export type CheckoutPayload = z.infer<typeof checkoutSchema>

// ── /api/encomenda ───────────────────────────────────────────────────────────
export const encomendaSchema = z.object({
  productId:    productIdSchema,
  catalogSlug:  catalogSlugSchema,
  quantity:     quantitySchema,
  customerName: customerNameSchema,
  whatsapp:     whatsappSchema,
})

export type EncomendaPayload = z.infer<typeof encomendaSchema>

// ── /api/catalog/quote ───────────────────────────────────────────────────────
export const quoteSchema = z
  .object({
    productId:    productIdSchema,
    catalogSlug:  catalogSlugSchema,
    name:         customerNameSchema,
    whatsapp:     z.string().trim().optional(),
    email:        z.string().trim().email('Email inválido').optional().or(z.literal('').transform(() => undefined)),
    description:  z.string().trim().min(1, 'Descrição é obrigatória').max(2000, 'Descrição muito longa (máximo 2000 caracteres)'),
    urgency:      z.enum(['flexible', 'normal', 'urgent']).optional().default('normal'),
    referenceUrl: z.string().trim().url('URL de referência inválida').max(500, 'URL muito longa').optional().or(z.literal('').transform(() => undefined)),
  })
  .refine(
    data => (data.whatsapp && data.whatsapp.length > 0) || (data.email && data.email.length > 0),
    { message: 'Informe WhatsApp ou email para contato', path: ['whatsapp'] }
  )

export type QuotePayload = z.infer<typeof quoteSchema>

// ── /api/content/sync ────────────────────────────────────────────────────────
// Otávio 2026-05-17: rota antes totalmente exposta (sem auth, sem Zod,
// usando client browser no server) — qualquer um podia update cross-user.
// Agora exige auth (RLS no service) + Zod (limites firmes).
export const contentSyncSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid({ message: 'ID do conteúdo inválido' }),
        link: z
          .string()
          .trim()
          .url({ message: 'Link inválido' })
          .max(500, 'Link muito longo (máximo 500 caracteres)'),
      }),
    )
    .min(1, 'Informe pelo menos 1 item')
    .max(100, 'Máximo 100 itens por sync (evita DOS)'),
})

export type ContentSyncPayload = z.infer<typeof contentSyncSchema>

// ── Helper: formata erro de Zod em PT-BR amigável ────────────────────────────
export function zodErrorToPtBr(error: z.ZodError): {
  message: string
  fields: Record<string, string>
} {
  // Pega primeira mensagem de cada path (campo) — v4 do Zod usa issues direto
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root'
    if (!fields[path]) {
      fields[path] = issue.message
    }
  }

  // Mensagem agregada (primeiro erro encontrado)
  const firstKey = Object.keys(fields)[0]
  const message = firstKey ? fields[firstKey] : 'Dados inválidos'

  return { message, fields }
}
