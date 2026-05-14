import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** 'sm' (32px header) | 'lg' (80-96px hero identity) */
  size?: 'sm' | 'lg'
  /** Animação pulse-glow no mark (só faz sentido no 'lg' do hero) */
  pulse?: boolean
  /** Esconde o texto "BVaz Hub", deixa só o quadrado B */
  iconOnly?: boolean
}

/**
 * Logo BVaz Hub — duas variantes:
 * - sm: 32px quadrado + "BVaz Hub" pequeno (header e footer)
 * - lg: 80-96px quadrado + "BVaz Hub" Fraunces + tag "v0.3 · waitlist aberta" (Hero, vira identidade da página)
 */
export function Logo({ className, size = 'sm', pulse = false, iconOnly = false }: LogoProps) {
  if (size === 'lg') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div
          aria-hidden
          className={cn(
            'logo-mark grid h-20 w-20 place-items-center rounded-[10px] text-4xl md:h-24 md:w-24 md:text-5xl',
            pulse && 'logo-pulse',
          )}
        >
          B
        </div>
        {!iconOnly && (
          <div className="flex flex-col gap-1">
            <span className="tag">v0.3 · waitlist aberta</span>
            <span className="display-h2 text-2xl text-foreground md:text-3xl">BVaz Hub</span>
          </div>
        )}
      </div>
    )
  }

  // size === 'sm'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        aria-hidden
        className="logo-mark grid h-9 w-9 place-items-center rounded-[6px] text-base"
      >
        B
      </div>
      {!iconOnly && (
        <span className="text-[15px] font-medium tracking-tight">BVaz Hub</span>
      )}
    </div>
  )
}
