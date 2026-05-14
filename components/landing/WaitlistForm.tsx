'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { submitWaitlistStep1, type WaitlistStep1State } from '@/app/waitlist/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const initial: WaitlistStep1State = { status: 'idle' }

export function WaitlistForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [state, action, pending] = useActionState(submitWaitlistStep1, initial)
  const formRef = useRef<HTMLFormElement>(null)

  // Sucesso → vai pra /waitlist/obrigado
  useEffect(() => {
    if (state.status === 'success') {
      router.push('/waitlist/obrigado')
    }
  }, [state, router])

  return (
    <form
      ref={formRef}
      action={action}
      className="mx-auto flex w-full max-w-md flex-col gap-3 text-left"
    >
      {/* UTM hidden — captura automática */}
      <input type="hidden" name="utm_source"   value={searchParams.get('utm_source')   || ''} />
      <input type="hidden" name="utm_medium"   value={searchParams.get('utm_medium')   || ''} />
      <input type="hidden" name="utm_campaign" value={searchParams.get('utm_campaign') || ''} />
      <input type="hidden" name="utm_content"  value={searchParams.get('utm_content')  || ''} />
      <input type="hidden" name="utm_term"     value={searchParams.get('utm_term')     || ''} />
      <input type="hidden" name="referrer"
             value={typeof window !== 'undefined' ? document.referrer : ''} />

      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          type="text"
          name="name"
          required
          placeholder="Seu nome"
          autoComplete="given-name"
          className="md:flex-1"
          aria-label="Seu nome"
        />
        <Input
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
          className="md:flex-1"
          aria-label="Seu email"
        />
      </div>

      <Input
        type="tel"
        name="whatsapp"
        placeholder="WhatsApp (opcional, recebe a novidade antes)"
        autoComplete="tel"
        inputMode="tel"
        aria-label="WhatsApp"
      />

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="consent_lgpd"
          required
          defaultChecked
          className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-background accent-primary"
        />
        <span>
          Concordo em receber emails sobre o BVaz Hub. Posso sair quando quiser.
          {' '}
          <a href="/privacidade" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidade
          </a>.
        </span>
      </label>

      <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>Entrar na lista de espera</>
        )}
      </Button>

      {state.status === 'error' && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}
    </form>
  )
}
