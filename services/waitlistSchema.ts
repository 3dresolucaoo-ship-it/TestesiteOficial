/**
 * Waitlist — schemas Zod e tipos.
 * Otávio (Security): validação rigorosa em toda entrada externa.
 */

import { z } from 'zod'

// ─── Etapa 1 — form mínimo (email + nome + whatsapp opcional + LGPD) ──────

const whatsappRegex = /^\+?[\d\s\-()]+$/

export const waitlistStep1Schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, 'Email muito curto')
    .max(254, 'Email muito longo')
    .email('Esse email não tá certo — verifica se tem @ e o domínio.'),

  name: z
    .string()
    .trim()
    .min(2, 'Nome muito curto')
    .max(80, 'Nome muito longo'),

  whatsapp: z
    .string()
    .trim()
    .max(20, 'WhatsApp muito longo')
    .regex(whatsappRegex, 'WhatsApp inválido — use apenas números e símbolos +-()')
    .optional()
    .or(z.literal('')),

  consent_lgpd: z
    .boolean()
    .refine(v => v === true, {
      message: 'Você precisa aceitar a Política de Privacidade pra entrar na lista.',
    }),
})

export type WaitlistLeadStep1 = z.infer<typeof waitlistStep1Schema>

// ─── Etapa 2 — qualificação opcional ────────────────────────────────────────

export const SEGMENT_OPTIONS = [
  { value: '3d-printing', label: 'Impressão 3D' },
  { value: 'estetica',    label: 'Estética / Beleza' },
  { value: 'moda',        label: 'Moda / Vestuário' },
  { value: 'food',        label: 'Alimentação' },
  { value: 'servicos',    label: 'Serviços' },
  { value: 'ecommerce',   label: 'E-commerce' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'outro',       label: 'Outro' },
] as const

export const SIZE_OPTIONS = [
  { value: 'solo',  label: 'Eu sozinho' },
  { value: '2-5',   label: '2-5 pessoas' },
  { value: '6-20',  label: '6-20 pessoas' },
  { value: '20+',   label: 'Mais de 20' },
] as const

export const REVENUE_OPTIONS = [
  { value: '0-5k',     label: 'Até R$ 5 mil/mês' },
  { value: '5-25k',    label: 'R$ 5-25 mil' },
  { value: '25-100k',  label: 'R$ 25-100 mil' },
  { value: '100k+',    label: 'Mais de R$ 100 mil' },
] as const

export const SOURCE_OPTIONS = [
  { value: 'instagram',  label: 'Instagram' },
  { value: 'linkedin',   label: 'LinkedIn' },
  { value: 'whatsapp',   label: 'Grupo WhatsApp' },
  { value: 'indicacao',  label: 'Indicação' },
  { value: 'google',     label: 'Google' },
  { value: 'outro',      label: 'Outro' },
] as const

export const waitlistStep2Schema = z.object({
  business_name: z.string().trim().max(120).optional().or(z.literal('')),
  segment:       z.enum(SEGMENT_OPTIONS.map(o => o.value) as [string, ...string[]]).optional().or(z.literal('')),
  size:          z.enum(SIZE_OPTIONS.map(o => o.value)    as [string, ...string[]]).optional().or(z.literal('')),
  revenue_band:  z.enum(REVENUE_OPTIONS.map(o => o.value) as [string, ...string[]]).optional().or(z.literal('')),
  pain:          z.string().trim().max(300).optional().or(z.literal('')),
  source:        z.enum(SOURCE_OPTIONS.map(o => o.value)  as [string, ...string[]]).optional().or(z.literal('')),
})

export type WaitlistLeadStep2 = z.infer<typeof waitlistStep2Schema>

// ─── Meta capturada do request (automática) ─────────────────────────────────

export interface LeadCaptureMeta {
  utm_source?:   string
  utm_medium?:   string
  utm_campaign?: string
  utm_content?:  string
  utm_term?:     string
  referrer?:     string
  ip_country?:   string
  ip_region?:    string
  ip_city?:      string
  user_agent?:   string
  device?:       'mobile' | 'desktop' | 'tablet'
}

// ─── Tipo completo do lead (vindo do DB) ────────────────────────────────────

export interface WaitlistLead {
  id:              string
  email:           string
  name:            string
  whatsapp:        string | null
  business_name:   string | null
  segment:         string | null
  size:            string | null
  revenue_band:    string | null
  pain:            string | null
  source:          string | null
  utm_source:      string | null
  utm_medium:      string | null
  utm_campaign:    string | null
  utm_content:     string | null
  utm_term:        string | null
  referrer:        string | null
  ip_country:      string | null
  ip_region:       string | null
  ip_city:         string | null
  user_agent:      string | null
  device:          string | null
  consent_lgpd:    boolean
  consent_at:      string | null
  status:          'new' | 'warm' | 'hot' | 'converted' | 'unsubscribed'
  score:           number
  tags:            string[]
  email_confirmed: boolean
  email_confirmed_at: string | null
  converted_at:    string | null
  converted_user_id: string | null
  created_at:      string
  updated_at:      string
  last_contact_at: string | null
}
