/**
 * RootHover.tsx — SVG de raízes animadas no hover dos bento cards
 *
 * Referência HTML: linhas 1384-1423 + 2773-2782 (v4-hibrido.html)
 * Classes: .root-hover · .rh-trunk · .rh-branch-l · .rh-branch-r · .rh-sub-l
 *
 * Mecanismo de dopamina #8 (surprise + delight):
 * raízes CRESCEM ao hover — motif único Hayzer, nenhum template SaaS tem isso.
 * Anti-IA score: +0.3 (Diego, ADR-014).
 *
 * Animação: CSS puro via stroke-dashoffset com transition-delay escalonado.
 * O JS NÃO toca esta animação — apenas o CSS :hover do .bento-card pai.
 *
 * Mobile: display:none em ≤768px (sem hover real em touch — Júlia P1).
 *
 * IMPORTANTE: este componente é Server Component (sem interatividade).
 * O hover é controlado pelo CSS global (v4-tokens.css ou globals.css).
 */

// ---------------------------------------------------------------------------
// Componente — Server Component (sem 'use client')
// ---------------------------------------------------------------------------

/**
 * SVG de raízes do motif Hayzer.
 * Posicionado em .bento-card::before via position: absolute top-14 left-14.
 *
 * Todos os paths compartilham o mesmo d="" de referência do V4.8.
 * Variação entre cards é intencional (anti-uniformidade IA) — futuramente
 * aceitar prop `variant` para paths alternativos.
 */
export function RootHover() {
  return (
    <svg
      className="root-hover"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tronco principal — anima primeiro (sem delay) */}
      <path
        className="rh-trunk"
        d="M32,4 Q32,18 28,28 Q24,38 22,52"
      />
      {/* Galho esquerdo — delay 200ms */}
      <path
        className="rh-branch-l"
        d="M28,22 Q22,24 18,32"
      />
      {/* Galho direito — delay 300ms */}
      <path
        className="rh-branch-r"
        d="M30,32 Q38,36 42,46"
      />
      {/* Sub-galho esquerdo — delay 500ms */}
      <path
        className="rh-sub-l"
        d="M18,32 Q14,38 12,46"
      />
      {/* Nós (círculos) — fade-in 800ms */}
      <circle cx="22" cy="52" r="2"   />
      <circle cx="18" cy="32" r="1.5" />
      <circle cx="12" cy="46" r="1.2" />
      <circle cx="42" cy="46" r="1.5" />
    </svg>
  )
}
