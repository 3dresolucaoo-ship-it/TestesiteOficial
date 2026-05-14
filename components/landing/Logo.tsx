import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** 'sm' (32px header) | 'lg' (80-96px hero identity) */
  size?: 'sm' | 'lg'
  /** Animação pulse-glow no mark (só faz sentido no 'lg' do hero) */
  pulse?: boolean
  /** Esconde o texto "Hayzer", deixa só o mark */
  iconOnly?: boolean
}

/**
 * Logo Hayzer — H com raízes orgânicas saindo da haste esquerda.
 * Conceito: cuidar das raízes do negócio. Pronúncia "ai-zer" (H mudo PT-BR).
 *
 * PNG tem fundo preto sólido — `mix-blend-screen` faz o preto sumir em qualquer
 * background escuro (a landing inteira é night #07090A), preservando só o verde.
 *
 * Variantes:
 * - sm: h-9 (36px) — header e footer
 * - lg: h-20 md:h-24 (80-96px) — Hero, vira identidade da página
 */
export function Logo({ className, size = 'sm', pulse = false, iconOnly = false }: LogoProps) {
  if (size === 'lg') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <Image
          src="/logo-hayzer.png"
          alt="Hayzer"
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 768px) 144px, 120px"
          className={cn(
            'h-20 w-auto mix-blend-screen md:h-24',
            pulse && 'logo-pulse',
          )}
        />
        {!iconOnly && (
          <div className="flex flex-col gap-1">
            <span className="tag">v0.3 · waitlist aberta</span>
            <span className="display-h2 text-2xl text-foreground md:text-3xl">Hayzer</span>
          </div>
        )}
      </div>
    )
  }

  // size === 'sm'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/logo-hayzer.png"
        alt="Hayzer"
        width={1536}
        height={1024}
        sizes="60px"
        className="h-9 w-auto mix-blend-screen"
      />
      {!iconOnly && (
        <span className="text-[15px] font-medium tracking-tight">Hayzer</span>
      )}
    </div>
  )
}
