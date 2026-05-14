'use server'

import { cookies, headers } from 'next/headers'
import {
  waitlistStep1Schema,
  waitlistStep2Schema,
  type LeadCaptureMeta,
} from '@/services/waitlistSchema'
import { addLeadStep1, updateLeadStep2 } from '@/services/waitlist'

// ─── Helpers de extração de meta do request ─────────────────────────────────

function detectDevice(ua: string): LeadCaptureMeta['device'] {
  const lower = ua.toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(lower)) return 'mobile'
  if (/ipad|tablet/.test(lower)) return 'tablet'
  return 'desktop'
}

async function buildCaptureMeta(formData: FormData): Promise<LeadCaptureMeta> {
  const h = await headers()

  return {
    utm_source:   String(formData.get('utm_source')   || '') || undefined,
    utm_medium:   String(formData.get('utm_medium')   || '') || undefined,
    utm_campaign: String(formData.get('utm_campaign') || '') || undefined,
    utm_content:  String(formData.get('utm_content')  || '') || undefined,
    utm_term:     String(formData.get('utm_term')     || '') || undefined,
    referrer:     String(formData.get('referrer')     || '') || undefined,
    ip_country:   h.get('x-vercel-ip-country') || undefined,
    ip_region:    h.get('x-vercel-ip-country-region') || undefined,
    ip_city:      h.get('x-vercel-ip-city') ? decodeURIComponent(h.get('x-vercel-ip-city')!) : undefined,
    user_agent:   h.get('user-agent') || undefined,
    device:       detectDevice(h.get('user-agent') || ''),
  }
}

// ─── Action: submit etapa 1 ─────────────────────────────────────────────────

export type WaitlistStep1State =
  | { status: 'idle' }
  | { status: 'success'; leadId: string; email: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }

export async function submitWaitlistStep1(
  _prevState: WaitlistStep1State,
  formData: FormData
): Promise<WaitlistStep1State> {
  // Parse e validação Zod
  const parsed = waitlistStep1Schema.safeParse({
    email:        formData.get('email'),
    name:         formData.get('name'),
    whatsapp:     formData.get('whatsapp'),
    consent_lgpd: formData.get('consent_lgpd') === 'on' || formData.get('consent_lgpd') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      status:  'error',
      message: 'Confere os campos abaixo.',
      fieldErrors: fieldErrors as Record<string, string[]>,
    }
  }

  // Meta automática (UTM, geo, device)
  const meta = await buildCaptureMeta(formData)

  // Insere no DB
  const result = await addLeadStep1(parsed.data, meta)

  if (!result.ok) {
    if (result.error === 'already_registered') {
      // UX: comportamento gentil — leva pra obrigado mesmo assim
      // (ele já tá na lista, não precisa repetir cadastro)
      const cookieStore = await cookies()
      cookieStore.set('waitlist_email', parsed.data.email, {
        httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60,
      })
      return {
        status:  'success',
        leadId:  'duplicate',
        email:   parsed.data.email,
      }
    }
    return { status: 'error', message: result.message }
  }

  // Sucesso — guarda leadId em cookie pra usar na etapa 2
  const cookieStore = await cookies()
  cookieStore.set('waitlist_lead_id', result.leadId, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60,
  })
  cookieStore.set('waitlist_email', result.email, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60,
  })

  return { status: 'success', leadId: result.leadId, email: result.email }
}

// ─── Action: submit etapa 2 (qualificação opcional) ─────────────────────────

export type WaitlistStep2State =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function submitWaitlistStep2(
  _prevState: WaitlistStep2State,
  formData: FormData
): Promise<WaitlistStep2State> {
  const cookieStore = await cookies()
  const leadId = cookieStore.get('waitlist_lead_id')?.value

  if (!leadId || leadId === 'duplicate') {
    // Sem leadId válido — não tem como atualizar. Retorna ok silencioso
    // (ele já tá na lista, etapa 2 é opcional mesmo).
    return { status: 'success' }
  }

  const parsed = waitlistStep2Schema.safeParse({
    business_name: formData.get('business_name'),
    segment:       formData.get('segment'),
    size:          formData.get('size'),
    revenue_band:  formData.get('revenue_band'),
    pain:          formData.get('pain'),
    source:        formData.get('source'),
  })

  if (!parsed.success) {
    return { status: 'error', message: 'Confere os campos.' }
  }

  const result = await updateLeadStep2(leadId, parsed.data)
  if (!result.ok) {
    return { status: 'error', message: result.message }
  }

  return { status: 'success' }
}
