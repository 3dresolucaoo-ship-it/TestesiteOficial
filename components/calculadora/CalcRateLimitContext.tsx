'use client'

/**
 * CalcRateLimitContext — compartilha estado de rate limit entre
 * CalcRateLimitWrapper (pill + modal) e CalculadoraForm (dispara após cálculo válido).
 *
 * Pattern: Context local ao componente de página. Não vai pro store global.
 */

import { createContext, useContext } from 'react'

interface CalcRateLimitCtx {
  /** Chamar após cada cálculo bem-sucedido (precoSugerido > 0, sem alerta crítico) */
  onCalcSuccess: () => void
  /** true quando o usuário esgotou os 5 cálculos do dia */
  limitReached: boolean
  /** Quantos cálculos foram feitos hoje */
  count: number
  /** Cap diário (5) */
  cap: number
}

export const CalcRateLimitContext = createContext<CalcRateLimitCtx>({
  onCalcSuccess: () => {},
  limitReached: false,
  count: 0,
  cap: 5,
})

export function useCalcRateLimitContext(): CalcRateLimitCtx {
  return useContext(CalcRateLimitContext)
}
