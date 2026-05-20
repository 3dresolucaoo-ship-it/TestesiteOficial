'use client'

/**
 * CalcRateLimitContext — compartilha a função `onCalcSuccess` entre
 * CalcRateLimitWrapper (pill + modal) e CalculadoraForm (dispara após cálculo válido).
 *
 * Pattern: Context local ao componente de página. Não vai pro store global.
 */

import { createContext, useContext } from 'react'

interface CalcRateLimitCtx {
  /** Chamar após cada cálculo bem-sucedido (precoSugerido > 0, sem alerta crítico) */
  onCalcSuccess: () => void
}

export const CalcRateLimitContext = createContext<CalcRateLimitCtx>({
  onCalcSuccess: () => {},
})

export function useCalcRateLimitContext(): CalcRateLimitCtx {
  return useContext(CalcRateLimitContext)
}
