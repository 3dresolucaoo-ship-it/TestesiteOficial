'use client'

import { useActionState, useState } from 'react'
import { submitWaitlistStep2, type WaitlistStep2State } from '@/app/waitlist/actions'
import {
  SEGMENT_OPTIONS,
  SIZE_OPTIONS,
  REVENUE_OPTIONS,
  SOURCE_OPTIONS,
} from '@/services/waitlistSchema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

const initial: WaitlistStep2State = { status: 'idle' }

export function Step2Form() {
  const [state, action, pending] = useActionState(submitWaitlistStep2, initial)
  const [dismissed, setDismissed] = useState(false)

  if (state.status === 'success' || dismissed) {
    return (
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-2xl border border-border/40 bg-card/30 p-8">
            <p className="text-sm text-muted-foreground">
              Pronto. A gente te avisa em breve.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pb-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-2xl border border-border/40 bg-card/30 p-6 md:p-10">
          <div className="mb-6 flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Quer pular a fila quando abrir?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Me conta um pouco do seu negócio. Quem responde aqui ganha acesso antes.
                30 segundos, todos os campos opcionais.
              </p>
            </div>
          </div>

          <form action={action} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="business_name" className="mb-1.5 block text-xs text-muted-foreground">
                Nome do negócio
              </Label>
              <Input
                id="business_name"
                name="business_name"
                placeholder="Ex.: Impressões 3D do Rafael"
              />
            </div>

            <div>
              <Label htmlFor="segment" className="mb-1.5 block text-xs text-muted-foreground">
                Segmento
              </Label>
              <select
                id="segment"
                name="segment"
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">Selecione...</option>
                {SEGMENT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="size" className="mb-1.5 block text-xs text-muted-foreground">
                Tamanho
              </Label>
              <select
                id="size"
                name="size"
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">Selecione...</option>
                {SIZE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="revenue_band" className="mb-1.5 block text-xs text-muted-foreground">
                Faturamento mensal
              </Label>
              <select
                id="revenue_band"
                name="revenue_band"
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">Selecione...</option>
                {REVENUE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="source" className="mb-1.5 block text-xs text-muted-foreground">
                Como descobriu o BVaz?
              </Label>
              <select
                id="source"
                name="source"
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">Selecione...</option>
                {SOURCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="pain" className="mb-1.5 block text-xs text-muted-foreground">
                Maior dor hoje
              </Label>
              <Input
                id="pain"
                name="pain"
                placeholder="Em 1 frase. Ex.: perco pedidos no WhatsApp."
                maxLength={300}
              />
            </div>

            <div className="md:col-span-2 mt-2 flex flex-col-reverse items-stretch gap-3 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Agora não, obrigado
              </button>
              <Button type="submit" disabled={pending} size="lg">
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>Pular a fila</>
                )}
              </Button>
            </div>

            {state.status === 'error' && (
              <p className="md:col-span-2 text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
