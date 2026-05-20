'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { submitWaitlistStep1, type WaitlistStep1State } from '@/app/waitlist/actions'
import { track, identify } from '@/lib/posthog'
import { Loader2, ArrowRight } from 'lucide-react'

const initial: WaitlistStep1State = { status: 'idle' }

export function WaitlistForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [state, action, pending] = useActionState(submitWaitlistStep1, initial)
  const formRef = useRef<HTMLFormElement>(null)

  // Otávio (Security): timestamp do render pro time-check anti-bot.
  // SSR começa em 0 (evita hydration mismatch), useEffect seta após mount.
  const [renderedAt, setRenderedAt] = useState(0)
  useEffect(() => {
    setRenderedAt(Date.now())
  }, [])

  // Sucesso → identifica usuario (LGPD: consent_lgpd=true foi required no form)
  // e vai pra /waitlist/obrigado
  useEffect(() => {
    if (state.status === 'success') {
      // Identifica pelo email somente — consentimento foi dado no formulário
      // (checkbox consent_lgpd required). Não passa nome nem whatsapp.
      if (state.email && state.leadId !== 'honeypot-blocked' && state.leadId !== 'time-check-blocked') {
        identify(state.email)
        track('waitlist_submit_success', {
          is_duplicate: state.leadId === 'duplicate',
          has_utm:      !!searchParams.get('utm_source'),
          utm_source:   searchParams.get('utm_source') ?? undefined,
          utm_medium:   searchParams.get('utm_medium') ?? undefined,
          utm_campaign: searchParams.get('utm_campaign') ?? undefined,
        })
      }
      router.push('/waitlist/obrigado')
    }

    if (state.status === 'error') {
      track('waitlist_submit_error', {
        // Não envia o message completo — pode conter dados do user em edge cases
        error_type: state.fieldErrors ? 'validation' : 'server',
        has_field_errors: !!state.fieldErrors,
      })
    }
  }, [state, router, searchParams])

  function handleSubmitAttempt() {
    // Dispara antes da Server Action executar (no onSubmit do form)
    // Metadados comportamentais apenas — zero PII
    const form = formRef.current
    track('waitlist_submit_attempt', {
      has_whatsapp: !!(form?.querySelector<HTMLInputElement>('[name="whatsapp"]')?.value?.trim()),
      name_length:  form?.querySelector<HTMLInputElement>('[name="name"]')?.value?.trim().length ?? 0,
      // email_length como proxy de preenchimento sem expor o email
      email_filled: !!(form?.querySelector<HTMLInputElement>('[name="email"]')?.value?.trim()),
      has_utm:      !!searchParams.get('utm_source'),
    })
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={handleSubmitAttempt}
      className="space-y-3"
    >
      {/* Honeypot — humano nunca preenche, bot que varre form preenche.
          Posicionado fora da tela com aria-hidden + tabIndex=-1. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <label>
          Não preencha este campo:
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      {/* Time-check — render < 2.5s antes do submit = robô */}
      <input type="hidden" name="_t" value={renderedAt} />

      {/* UTM hidden — captura automática */}
      <input type="hidden" name="utm_source"   value={searchParams.get('utm_source')   || ''} />
      <input type="hidden" name="utm_medium"   value={searchParams.get('utm_medium')   || ''} />
      <input type="hidden" name="utm_campaign" value={searchParams.get('utm_campaign') || ''} />
      <input type="hidden" name="utm_content"  value={searchParams.get('utm_content')  || ''} />
      <input type="hidden" name="utm_term"     value={searchParams.get('utm_term')     || ''} />
      <input type="hidden" name="referrer"
             value={typeof window !== 'undefined' ? document.referrer : ''} />

      {/* Nome + Email lado a lado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="name" className="tag tag-fog mb-1.5 block">nome</label>
          <input
            id="name"
            type="text"
            name="name"
            required
            placeholder="Rafael"
            autoComplete="given-name"
            className="field-dark w-full rounded-md px-3.5 py-2.5 text-[14px]"
            aria-label="Seu nome"
            onInvalid={(e) => e.currentTarget.setCustomValidity('Coloca teu nome aqui.')}
            onInput={(e) => e.currentTarget.setCustomValidity('')}
          />
        </div>
        <div>
          <label htmlFor="email" className="tag tag-fog mb-1.5 block">email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="voce@email.com"
            autoComplete="email"
            inputMode="email"
            className="field-dark w-full rounded-md px-3.5 py-2.5 text-[14px]"
            aria-label="Teu email"
            onInvalid={(e) => {
              const t = e.currentTarget
              if (t.validity.valueMissing) t.setCustomValidity('Coloca teu email pra eu te avisar.')
              else if (t.validity.typeMismatch) t.setCustomValidity('Esse email não tá certo. Exemplo: nome@email.com')
              else t.setCustomValidity('')
            }}
            onInput={(e) => e.currentTarget.setCustomValidity('')}
          />
        </div>
      </div>

      {/* WhatsApp opcional */}
      <div>
        <label htmlFor="whatsapp" className="tag tag-fog mb-1.5 block">
          whatsapp <span className="normal-case opacity-60">(opcional)</span>
        </label>
        <input
          id="whatsapp"
          type="tel"
          name="whatsapp"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
          inputMode="tel"
          className="field-dark w-full rounded-md px-3.5 py-2.5 text-[14px]"
          aria-label="WhatsApp"
        />
      </div>

      {/* Consentimento LGPD — opt-in ATIVO (QA audit 20/05: defaultChecked fere LGPD Art. 5° VIII) */}
      <label className="flex cursor-pointer items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          name="consent_lgpd"
          required
          onInvalid={(e) => e.currentTarget.setCustomValidity('Precisa aceitar a Política de Privacidade pra entrar na lista.')}
          onInput={(e) => e.currentTarget.setCustomValidity('')}
          className="mt-0.5 h-5 w-5"
          style={{ accentColor: 'hsl(var(--petrol-400))' }}
        />
        <span className="text-[12.5px] leading-[1.5] text-muted-foreground">
          Concordo em receber emails sobre o Hayzer. Posso sair quando quiser.{' '}
          <a href="/privacidade" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidade
          </a>.
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="btn-light mt-2 flex w-full items-center justify-center gap-2 rounded-md py-3 text-[14.5px] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Quero acesso antecipado
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="pt-2 text-center text-[12px] text-muted-foreground/70">
        Sem cartão. Você recebe aviso por email quando abrir.
      </p>

      {state.status === 'error' && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}
    </form>
  )
}
