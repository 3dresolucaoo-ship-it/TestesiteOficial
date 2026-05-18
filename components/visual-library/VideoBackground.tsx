'use client'

/** Video em loop como fundo de section. Suporte mp4+webm com fallback poster. */

import { cn } from '@/lib/utils'

interface VideoBackgroundProps {
  /** Caminho do .mp4 em public/ (ex: /assets/videos/hero-roots-1080p.mp4) */
  srcMp4?: string
  /** Caminho do .webm em public/ (opcional, menor tamanho) */
  srcWebm?: string
  /** Imagem de fallback (poster) quando video nao carrega ou JS desativado */
  poster?: string
  className?: string
  /** Opacidade do video (0-1, padrao: 1) */
  opacity?: number
  /** Descricao do video para leitores de tela */
  'aria-label'?: string
}

/**
 * VideoBackground — video autoplay muted loop em object-cover. Use como filho de
 * um elemento com position: relative e overflow-hidden.
 * Sempre fornecer srcMp4 como fallback universal. srcWebm e recomendado junto.
 */
export function VideoBackground({
  srcMp4,
  srcWebm,
  poster,
  className,
  opacity = 1,
  'aria-label': ariaLabel,
}: VideoBackgroundProps) {
  if (!srcMp4 && !srcWebm) return null

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-label={ariaLabel ?? 'Video de fundo'}
      style={{ opacity }}
      className={cn(
        'absolute inset-0 h-full w-full object-cover pointer-events-none',
        className,
      )}
    >
      {srcWebm && <source src={srcWebm} type="video/webm" />}
      {srcMp4  && <source src={srcMp4}  type="video/mp4"  />}
    </video>
  )
}
