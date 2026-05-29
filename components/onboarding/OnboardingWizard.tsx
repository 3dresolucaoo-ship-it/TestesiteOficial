'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  step:      number
  onNext:    () => void
  onBack:    () => void
  onSkip:    () => void
  onComplete: () => void
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === current ? 20 : 8,
            height:     8,
            background: i === current
              ? 'hsl(var(--petrol-400))'
              : 'hsl(var(--petrol-700) / 0.5)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Step layout ─────────────────────────────────────────────────────────────

interface StepLayoutProps {
  headline:   string
  subtitle:   ReactNode
  cta:        string
  skip?:      string
  showBack:   boolean
  onCta:      () => void
  onSkip:     () => void
  onBack:     () => void
  isLast?:    boolean
}

function StepLayout({
  headline,
  subtitle,
  cta,
  skip,
  showBack,
  onCta,
  onSkip,
  onBack,
  isLast = false,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Texto principal */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-8">
        <h2
          className="text-2xl md:text-3xl leading-tight tracking-tight mb-4"
          style={{
            fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
            fontStyle:  'italic',
            color:      'hsl(var(--fog-50))',
          }}
        >
          {headline}
        </h2>
        <div
          className="text-sm md:text-base leading-relaxed space-y-1"
          style={{ color: 'hsl(var(--fog-200))' }}
        >
          {subtitle}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-6 md:px-8 md:pb-8 flex flex-col gap-4">
        <button
          onClick={onCta}
          className="w-full py-3 px-6 rounded-lg font-medium text-sm transition-all duration-150 active:scale-[0.98]"
          style={{
            background:  isLast
              ? 'linear-gradient(135deg, hsl(var(--petrol-500)), hsl(var(--petrol-600)))'
              : 'linear-gradient(135deg, hsl(var(--petrol-500)), hsl(var(--petrol-600)))',
            color:       'hsl(var(--fog-50))',
            boxShadow:   '0 0 24px hsl(var(--petrol-500) / 0.35)',
          }}
        >
          {cta}
        </button>

        <div className="flex items-center justify-between">
          {/* Botao voltar — invisivel no step 0 mas ocupa o espaço */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs transition-opacity"
            style={{
              color:   'hsl(var(--fog-300))',
              opacity: showBack ? 1 : 0,
              pointerEvents: showBack ? 'auto' : 'none',
            }}
            tabIndex={showBack ? 0 : -1}
            aria-hidden={!showBack}
          >
            <ArrowLeft size={13} />
            Voltar
          </button>

          {/* Skip */}
          {skip && (
            <button
              onClick={onSkip}
              className="text-xs underline-offset-2 hover:underline transition-colors"
              style={{ color: 'hsl(var(--fog-400))' }}
            >
              {skip}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Steps content ────────────────────────────────────────────────────────────

const STEPS: Array<{
  headline: string
  subtitle: ReactNode
  cta:      string
  skip?:    string
  isLast?:  boolean
}> = [
  {
    headline: 'Seu negócio de impressão, num lugar só.',
    subtitle: (
      <>
        <p>Pedido, estoque, produção e financeiro conectados.</p>
        <p>Tu cadastra uma vez, o Hayzer puxa o resto.</p>
      </>
    ),
    cta:  'Bora ver como funciona',
    skip: 'Já manjo, pular pro dashboard',
  },
  {
    headline: 'Pedido chegou no WhatsApp? Registra aqui.',
    subtitle: (
      <>
        <p>Cliente manda mensagem, tu cola no Hayzer ou cadastra na mão.</p>
        <p>O pedido já entra na fila de produção, sem digitar de novo.</p>
      </>
    ),
    cta:  'Próximo: como o estoque se vira',
    skip: 'Já sei, pular',
  },
  {
    headline: 'Vendeu uma peça? Filamento já saiu do estoque.',
    subtitle: (
      <>
        <p>Tu cadastra o gasto de filamento por produto uma vez.</p>
        <p>Cada pedido que sai, o Hayzer desconta sozinho. Acabou rolo? Avisa.</p>
      </>
    ),
    cta:  'Próximo: o número que importa',
    skip: 'Já sei, pular',
  },
  {
    headline: 'No fim do mês, tu sabe o que sobrou.',
    subtitle: (
      <>
        <p>Receita menos filamento, energia, taxa de cartão, custo fixo.</p>
        <p>Lucro real, não chute. Margem por peça também, pra tu saber qual produto paga a conta.</p>
      </>
    ),
    cta:     'Criar meu primeiro projeto',
    skip:    'Explorar o dashboard antes',
    isLast:  true,
  },
]

// ─── Animation config ────────────────────────────────────────────────────────

const SLIDE = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
}

const TRANSITION: Transition = { type: 'spring', stiffness: 380, damping: 34, mass: 0.85 }

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingWizard({ step, onNext, onBack, onSkip, onComplete }: OnboardingWizardProps) {
  const overlayRef   = useRef<HTMLDivElement>(null)
  const closeRef     = useRef<HTMLButtonElement>(null)
  const directionRef = useRef(0)
  const prevStepRef  = useRef(step)

  // Determina direcao da animacao
  if (step !== prevStepRef.current) {
    directionRef.current = step > prevStepRef.current ? 1 : -1
    prevStepRef.current  = step
  }

  // Focus trap: foco no botao fechar ao montar
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  // ESC fecha (trata como skip)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onSkip()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onSkip])

  // Trava scroll do body enquanto o wizard esta aberto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const currentStep = STEPS[step]
  if (!currentStep) return null

  const handleCta = step === STEPS.length - 1 ? onComplete : onNext

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(7, 9, 10, 0.80)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Bem-vindo ao Hayzer"
      onClick={(e) => { if (e.target === overlayRef.current) onSkip() }}
    >
      {/* Painel do wizard */}
      <div
        className="relative w-full md:max-w-md overflow-hidden flex flex-col"
        style={{
          background:   'hsl(var(--night-850, 22 14% 11%))',
          border:       '1px solid rgba(242, 239, 234, 0.10)',
          borderRadius: '1rem 1rem 0 0',
          maxHeight:    '92dvh',
          // Desktop: bordas arredondadas em todos os lados
        }}
        // eslint-disable-next-line react/no-unknown-property
        data-onboarding-panel=""
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: dots + fechar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <ProgressDots current={step} total={STEPS.length} />
          <button
            ref={closeRef}
            onClick={onSkip}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
            style={{ color: 'hsl(var(--fog-400))' }}
            aria-label="Fechar onboarding"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step animado */}
        <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
          <AnimatePresence initial={false} custom={directionRef.current} mode="wait">
            <motion.div
              key={step}
              custom={directionRef.current}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="w-full"
            >
              <StepLayout
                headline={currentStep.headline}
                subtitle={currentStep.subtitle}
                cta={currentStep.cta}
                skip={currentStep.skip}
                showBack={step > 0}
                onCta={handleCta}
                onSkip={onSkip}
                onBack={onBack}
                isLast={currentStep.isLast}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop: estilo do painel com bordas arredondadas em todos os cantos */}
      <style>{`
        @media (min-width: 768px) {
          [data-onboarding-panel] {
            border-radius: 1rem !important;
          }
        }
      `}</style>
    </div>
  )

  // Portal para garantir z-index acima de tudo (V4Shell, sidebar, topbar)
  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}
