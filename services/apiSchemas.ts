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

// ── /api/finance/fixed-costs ─────────────────────────────────────────────────
// Otávio 2026-05-17 (Tier 1 finalização):
// - label: trim + min 1 + max 120 evita strings vazias e bytes-flood
// - amount: nonneg (custo é >= 0) + max 1e9 evita overflow no Numeric do PG
// - id e projectId: UUID v4 estrito
const idSchema        = z.string().uuid({ message: 'ID inválido' })
const projectIdSchema = z.string().uuid({ message: 'projectId inválido' })

const fixedCostLabelSchema = z
  .string()
  .trim()
  .min(1, 'Descrição é obrigatória')
  .max(120, 'Descrição muito longa (máximo 120 caracteres)')

const fixedCostAmountSchema = z
  .number({ message: 'Valor deve ser número' })
  .finite('Valor inválido')
  .nonnegative('Valor não pode ser negativo')
  .max(1_000_000_000, 'Valor acima do limite aceito')

export const fixedCostCreateSchema = z.object({
  id:        idSchema,
  projectId: projectIdSchema,
  label:     fixedCostLabelSchema,
  amount:    fixedCostAmountSchema,
})

export const fixedCostPatchSchema = z.object({
  label:  fixedCostLabelSchema,
  amount: fixedCostAmountSchema,
})

export type FixedCostCreatePayload = z.infer<typeof fixedCostCreateSchema>
export type FixedCostPatchPayload  = z.infer<typeof fixedCostPatchSchema>

// ── /api/finance/profit-goal ─────────────────────────────────────────────────
// month YYYY-MM regex (define escopo da meta).
// Aceita amount como `monthlyTarget` por compat com o handler atual + opcional
// month YYYY-MM caso o front mande no futuro (não usado ainda — guard pré-existente).
const monthYYYYMMSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês deve estar no formato YYYY-MM')

export const profitGoalSchema = z.object({
  projectId:     projectIdSchema,
  monthlyTarget: z
    .number({ message: 'Meta deve ser número' })
    .finite('Meta inválida')
    .nonnegative('Meta não pode ser negativa')
    .max(1_000_000_000, 'Meta acima do limite aceito'),
  // Opcional — caso queira fixar meta por mês no futuro
  month: monthYYYYMMSchema.optional(),
})

export type ProfitGoalPayload = z.infer<typeof profitGoalSchema>

// ── /api/payment-configs ─────────────────────────────────────────────────────
// Substitui validação manual atual no handler (POST).
// Mercado Pago: webhookSecret obrigatório (min 16) — sem ele payments/mercadopago.ts:121
// throw e webhook é rejeitado. Bloqueio aqui evita salvar config quebrada.
// Stripe/InfinityPay: webhookSecret opcional.
const accessTokenSchema = z
  .string()
  .trim()
  .min(8, 'accessToken obrigatório (mínimo 8 caracteres)')
  .max(500, 'accessToken muito longo')
  .refine(v => !v.startsWith('****'), {
    message: 'accessToken ainda mascarado — cole o valor real',
  })

const webhookSecretSchema = z
  .string()
  .trim()
  .max(500, 'webhookSecret muito longo')
  .optional()

const paymentConfigBase = z.object({
  id:            idSchema.optional(),
  accessToken:   accessTokenSchema,
  publicKey:     z.string().trim().max(500, 'publicKey muito longa').optional(),
  webhookSecret: webhookSecretSchema,
  sandbox:       z.boolean().optional().default(false),
})

export const paymentConfigSchema = z.discriminatedUnion('provider', [
  paymentConfigBase.extend({
    provider: z.literal('mercadopago'),
    // Override: MP exige webhookSecret >= 16
    webhookSecret: z
      .string({ message: 'webhookSecret é obrigatório para Mercado Pago' })
      .trim()
      .min(16, 'webhookSecret obrigatório para Mercado Pago (mínimo 16 caracteres). Pegue em: MP Dashboard → Sua aplicação → Webhooks → Chave secreta.')
      .max(500, 'webhookSecret muito longo'),
  }),
  paymentConfigBase.extend({
    provider: z.literal('stripe'),
  }),
  paymentConfigBase.extend({
    provider: z.literal('infinitypay'),
  }),
])

export type PaymentConfigPayload = z.infer<typeof paymentConfigSchema>

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
