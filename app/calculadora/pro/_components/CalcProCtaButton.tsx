'use client'

/**
 * CalcProCtaButton — CTA primário do pitch Pro.
 * Client Component para disparar evento PostHog no clique.
 */

import { track } from '@/lib/posthog'

interface CalcProCtaButtonProps {
  stripeLink: string | undefined
  proPrice: string
}

export function CalcProCtaButton({ stripeLink, proPrice }: CalcProCtaButtonProps) {
  function handleClick() {
    track('calc_pro_checkout_click', { origem: 'pro_page' })
  }

  if (!stripeLink) {
    return (
      <div
        className="rounded-xl px-6 py-3 text-[14px] text-muted-foreground"
        style={{
          background: 'hsl(var(--card) / 0.5)',
          border: '1px solid hsl(var(--fog-50) / 0.08)',
        }}
        role="status"
        aria-live="polite"
      >
        Checkout temporariamente indisponivel, volta em alguns minutos.
      </div>
    )
  }

  return (
    <a
      href={stripeLink}
      onClick={handleClick}
      className="group inline-flex items-center justify-center rounded-xl px-8 py-4 text-[16px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_0_28px_hsl(var(--petrol-400)/0.55),0_18px_44px_-12px_hsl(var(--petrol-500)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--petrol-400)) 0%, hsl(var(--petrol-500)) 100%)',
        color: 'hsl(var(--fog-50))',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 24px -8px hsl(var(--petrol-500) / 0.55)',
      }}
      aria-label={`Assinar Calculadora Pro por R$ ${proPrice} por mes`}
    >
      Quero o Pro · R${proPrice}/mes
    </a>
  )
}
