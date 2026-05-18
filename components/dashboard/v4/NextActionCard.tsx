'use client'

/**
 * NextActionCard.tsx — Card "Próxima ação sugerida"
 *
 * Referência HTML: linhas 2731-2758 (v4-hibrido.html)
 * Classes: .next-action · .next-action-left · .next-action-icon
 *          .next-action-msg · .next-action-cta · .next-action-dismiss
 *
 * Mecanismo de dopamina #6 (paradoxo da escolha reduzida / Schwartz):
 * UMA ação sugerida — sem list, sem menu. Remove paralisia de decisão.
 *
 * Placeholder para o Copiloto Wave 6. Por ora, dados vêm de services/inventory.ts
 * (material com menor estoque) e são calculados na page.tsx antes de passar
 * via prop. Nenhuma lógica de DB aqui.
 *
 * Interatividade: botões de ação → 'use client'.
 * Se nextAction for null, o card não renderiza (sem espaço morto).
 */

import type { NextActionData } from './types'

// ---------------------------------------------------------------------------
// Ícone de raiz Hayzer (anti-IA: não é lâmpada nem estrela)
// ---------------------------------------------------------------------------

function RootIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" />
      <path d="M12 6.8 L12 14" />
      <path d="M12 11 Q9 12.5 7 16" />
      <path d="M12 11 Q15 12.5 17 16" />
      <path d="M12 14 L12 19" />
      <circle cx="7"  cy="16" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="17" cy="16" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" stroke="none" opacity="0.85" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NextActionCardProps {
  data: NextActionData
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function NextActionCard({ data }: NextActionCardProps) {
  const handleCta = () => {
    if (data.onCtaClick) {
      data.onCtaClick()
    } else if (data.ctaHref) {
      window.location.href = data.ctaHref
    }
  }

  return (
    <div
      className="next-action fade-in delay-2"
      role="region"
      aria-label="Próxima ação sugerida"
    >
      {/* Coluna esquerda: ícone + texto */}
      <div className="next-action-left">
        <span className="next-action-icon" aria-hidden="true">
          <RootIcon />
        </span>
        <div className="next-action-text">
          <span className="next-action-label">Próxima ação · sugerida</span>
          {/*
           * message pode conter <strong> para destacar nomes de materiais.
           * Em V4.8 é string pura → dangerouslySetInnerHTML é aceitável aqui
           * pois o dado vem de services/ internos, nunca de input do usuário.
           * TODO (Júlia Wave 4): substituir por React nodes tipados.
           */}
          <p
            className="next-action-msg"
            dangerouslySetInnerHTML={{ __html: data.message }}
          />
        </div>
      </div>

      {/* Coluna direita: CTAs */}
      <div className="next-action-right">
        <button
          className="next-action-cta"
          type="button"
          onClick={handleCta}
          aria-label={data.ctaLabel}
        >
          {data.ctaLabel}
        </button>
        {data.onDismiss && (
          <button
            className="next-action-dismiss"
            type="button"
            aria-label="Dispensar sugestão"
            onClick={data.onDismiss}
          >
            Dispensar
          </button>
        )}
      </div>
    </div>
  )
}
