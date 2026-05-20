'use client'

/**
 * CalcRateLimitWrapper
 *
 * Renderiza o pill de contador ("X/5 cálculos hoje") no canto superior direito
 * da tela + o modal upsell quando o cap é atingido.
 *
 * Também provê CalcRateLimitContext pra que CalculadoraForm chame `onCalcSuccess`
 * sem saber dos detalhes de rate limiting.
 *
 * Não interfere no layout da página: pill é `fixed`, modal é `fixed`.
 */

import { useCallback, useState } from 'react'
import { useCalcRateLimit } from '@/lib/hooks/useCalcRateLimit'
import { CalcRateLimitContext } from '@/components/calculadora/CalcRateLimitContext'
import { CalcUpsellModal } from '@/components/calculadora/CalcUpsellModal'

interface CalcRateLimitWrapperProps {
  children: React.ReactNode
}

export function CalcRateLimitWrapper({ children }: CalcRateLimitWrapperProps) {
  const { count, cap, increment } = useCalcRateLimit()
  const [upsellOpen, setUpsellOpen] = useState(false)
  const [attemptN, setAttemptN] = useState(0)

  const onCalcSuccess = useCallback(() => {
    const next = increment()

    if (next >= cap) {
      // Bateu ou ultrapassou o cap: abre modal upsell
      setAttemptN(n => n + 1)
      setUpsellOpen(true)
    }
    // Se next < cap: só incrementa, pill atualiza via estado
  }, [increment, cap])

  // Pill: petrol se < 4 usados (remaining >= 2), ember se >= 4 usados (remaining <= 1)
  const usedGe4 = count >= 4

  return (
    <CalcRateLimitContext.Provider value={{ onCalcSuccess, limitReached: count >= cap, count, cap }}>
      {children}

      {/* Pill contador — visível só se pelo menos 1 cálculo foi feito */}
      {count > 0 && (
        <div
          className="fixed bottom-5 right-4 z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] shadow-lg backdrop-blur-sm transition-all duration-300 md:top-20 md:bottom-auto md:right-5"
          style={{
            background: usedGe4
              ? 'hsl(var(--ember-500) / 0.18)'
              : 'hsl(var(--petrol-500) / 0.18)',
            border: usedGe4
              ? '1px solid hsl(var(--ember-400) / 0.4)'
              : '1px solid hsl(var(--petrol-400) / 0.4)',
            color: usedGe4
              ? 'hsl(var(--ember-300))'
              : 'hsl(var(--petrol-300))',
            backdropFilter: 'blur(8px)',
          }}
          role="status"
          aria-live="polite"
          aria-label={`${count} de ${cap} cálculos usados hoje`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: usedGe4
                ? 'hsl(var(--ember-300))'
                : 'hsl(var(--petrol-300))',
            }}
          />
          {count}/{cap} cálculos hoje
        </div>
      )}

      {/* Modal upsell */}
      <CalcUpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        attemptN={attemptN}
      />
    </CalcRateLimitContext.Provider>
  )
}
