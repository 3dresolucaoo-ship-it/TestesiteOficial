/**
 * StreakPill.tsx — Pílula de streak fixa no canto inferior esquerdo
 *
 * Referência HTML: linhas 3184-3192 (v4-hibrido.html)
 * Classes: .streak-pill · .streak-num · .streak-leaf
 *
 * Mecanismo de dopamina #7 (streak sutil):
 * "12 dias seguidos no controle" — mantém o maker voltando todo dia.
 * Vibe pílula âmbar igual à landing — único elemento celebratório do dashboard
 * (Hick's Law: não repetir em outros lugares).
 *
 * CSS: sheen ember via keyframe + box-shadow ember glow.
 * Posição: fixed bottom-22 left-270 (alinhado ao fim da sidebar).
 *
 * Server Component: dados de streak chegam via prop — sem fetch aqui.
 * TODO (backlog ADR-014): Streak D3+ com dados reais (por ora: dados estáticos
 * até tabela de streak existir no Supabase).
 */

import type { StreakData } from './types'

// ---------------------------------------------------------------------------
// Ícone folha (motif Hayzer)
// ---------------------------------------------------------------------------

function LeafIcon() {
  return (
    <svg
      className="streak-leaf"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2 Q4 8 4 14 a8 8 0 0 0 16 0 Q20 8 12 2 Z" />
      <path d="M12 2 L12 22" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StreakPillProps {
  data: StreakData
}

// ---------------------------------------------------------------------------
// Componente — Server Component (sem interatividade)
// ---------------------------------------------------------------------------

export function StreakPill({ data }: StreakPillProps) {
  if (data.days < 2) return null // streak D1 não exibe (backlog ADR-014)

  return (
    <div
      className="streak-pill"
      role="status"
      aria-label={`${data.days} dias seguidos de uso do Hayzer`}
    >
      <LeafIcon />
      <span className="streak-num num">{data.days} dias</span>
      <span>seguidos no controle</span>
    </div>
  )
}
