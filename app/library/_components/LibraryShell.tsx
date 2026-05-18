'use client'

import { useState, type ReactNode } from 'react'
import {
  TapeBadge,
  UnderlineMarker,
  HighlightedText,
  Stamp,
  GrainOverlay,
  GlowPetrol,
  RootSvg,
} from '@/components/visual-library'
import { ComponentCard } from './ComponentCard'

type FilterTab = 'todos' | 'componentes' | 'assets'

/**
 * LibraryShell — shell client da /library. Gerencia filtros por aba,
 * renderiza ComponentCards e a AssetSection (passada como prop pra
 * preservar Server Component boundary do filesystem).
 */
export function LibraryShell({ assetSection }: { assetSection: ReactNode }) {
  const [filter, setFilter] = useState<FilterTab>('todos')

  const showComponents = filter === 'todos' || filter === 'componentes'
  const showAssets     = filter === 'todos' || filter === 'assets'

  return (
    <div className="relative">
      <GrainOverlay intensity="soft" zIndex={10} />

      {/* Fundo petrol sutil */}
      <GlowPetrol
        tone="petrol"
        size="lg"
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2"
        opacity={0.12}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:px-10">

        {/* Header */}
        <header className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <TapeBadge tone="ember" size="sm" rotate={-3}>INTERNO</TapeBadge>
            <TapeBadge tone="petrol" size="sm" rotate={2}>v0.1</TapeBadge>
          </div>

          <h1
            className="mb-3 font-serif text-5xl font-semibold leading-none tracking-tight md:text-6xl"
            style={{
              fontFamily: 'var(--font-fraunces)',
              color: 'hsl(43 17% 93%)',     // fog-50
            }}
          >
            Biblioteca{' '}
            <UnderlineMarker tone="petrol" markerStyle="wavy">Hayzer</UnderlineMarker>
          </h1>

          <p style={{ color: 'hsl(40 12% 71%)' }} className="max-w-xl text-[15px] leading-relaxed">
            Design system interno. Componentes visuais, tokens e assets prontos pra usar.
            Cada preview roda o componente real em cima de fundo dark.
          </p>

          {/* Filtro por aba */}
          <nav aria-label="Filtrar por tipo" className="mt-8 flex gap-2">
            {(['todos', 'componentes', 'assets'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                aria-pressed={filter === tab}
                style={
                  filter === tab
                    ? {
                        backgroundColor: 'rgba(31, 118, 105, 0.25)',
                        color: 'hsl(171 40% 80%)',
                        borderColor: 'hsl(173 45% 42%)',
                      }
                    : {
                        backgroundColor: 'rgba(242, 239, 234, 0.04)',
                        color: 'hsl(40 12% 71%)',
                        borderColor: 'rgba(242, 239, 234, 0.10)',
                      }
                }
                className="rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Componentes */}
        {showComponents && (
          <section aria-label="Componentes visuais" className="mb-16">
            <h2
              className="mb-6 text-xs font-mono uppercase tracking-widest"
              style={{ color: 'hsl(173 35% 60%)' }}
            >
              componentes — visual-library/
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              <ComponentCard
                name="TapeBadge"
                description="Etiqueta rotacionada estilo fita adesiva. Status interno, badges de versao."
                snippet={`<TapeBadge tone="ember" size="md">INTERNO</TapeBadge>`}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-start gap-3">
                    <TapeBadge tone="ember"   size="sm">sm ember</TapeBadge>
                    <TapeBadge tone="ember"   size="md">md ember</TapeBadge>
                    <TapeBadge tone="ember"   size="lg">lg ember</TapeBadge>
                  </div>
                  <div className="flex flex-col items-start gap-3">
                    <TapeBadge tone="petrol"  size="sm">sm petrol</TapeBadge>
                    <TapeBadge tone="petrol"  size="md">md petrol</TapeBadge>
                    <TapeBadge tone="neutral" size="md">neutral</TapeBadge>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                name="UnderlineMarker"
                description="Sublinhado artesanal (wavy/solid/dashed) em ember ou petrol."
                snippet={`<UnderlineMarker tone="ember">palavra</UnderlineMarker>`}
              >
                <div className="flex flex-col gap-3" style={{ color: 'hsl(43 17% 93%)' }}>
                  <span className="text-lg">
                    Sem <UnderlineMarker tone="ember" markerStyle="wavy">caos</UnderlineMarker>.
                  </span>
                  <span className="text-lg">
                    Gestao <UnderlineMarker tone="petrol" markerStyle="solid">real</UnderlineMarker>.
                  </span>
                  <span className="text-lg">
                    Lucro <UnderlineMarker tone="neutral" markerStyle="dashed">claro</UnderlineMarker>.
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                name="HighlightedText"
                description="Fundo marca-texto translucido. Destaque sutil sem quebrar tipografia."
                snippet={`<HighlightedText tone="ember">30 minutos</HighlightedText>`}
              >
                <div className="flex flex-col gap-2" style={{ color: 'hsl(43 17% 93%)' }}>
                  <p className="text-base">
                    Economize{' '}
                    <HighlightedText tone="ember" size="md">30 minutos</HighlightedText>
                    {' '}por dia.
                  </p>
                  <p className="text-base">
                    <HighlightedText tone="petrol" size="sm">Controle total</HighlightedText>
                    {' '}do estoque.
                  </p>
                  <p className="text-base">
                    <HighlightedText tone="neutral" size="lg">Gratis</HighlightedText>
                    {' '}pra comecar.
                  </p>
                </div>
              </ComponentCard>

              <ComponentCard
                name="Stamp"
                description="Carimbo circular rotacionado. Opacidade 70%, borda ember/petrol."
                snippet={`<Stamp tone="ember" size="md">BETA</Stamp>`}
              >
                <div className="flex items-center gap-6">
                  <Stamp tone="ember"   size="sm">BETA</Stamp>
                  <Stamp tone="ember"   size="md">APROVADO</Stamp>
                  <Stamp tone="petrol"  size="md" rotate={8}>OK</Stamp>
                  <Stamp tone="neutral" size="lg" rotate={-12}>WIP</Stamp>
                </div>
              </ComponentCard>

              <ComponentCard
                name="GlowPetrol"
                description="Blob de luz com blur extremo. Decorativo de fundo em sections escuras."
                snippet={`<GlowPetrol tone="petrol" size="md" opacity={0.3} />`}
              >
                <div className="relative h-28 overflow-hidden rounded-lg" style={{ background: 'hsl(200 11% 9%)' }}>
                  <GlowPetrol tone="petrol" size="md" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" opacity={0.5} />
                  <GlowPetrol tone="ember"  size="sm" className="top-0 right-0"                                        opacity={0.4} />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs"
                    style={{ color: 'hsl(40 12% 71%)' }}
                  >
                    petrol + ember glow
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                name="RootSvg"
                description="SVG das raizes do logo Hayzer com animacao stroke-dasharray via Framer Motion."
                snippet={`<RootSvg size="md" tone="petrol" duration={1.8} />`}
              >
                <div className="flex items-end gap-6">
                  <RootSvg size="sm" tone="petrol" />
                  <RootSvg size="md" tone="ember"  />
                  <RootSvg size="lg" tone="neutral" static />
                  <span style={{ color: 'hsl(40 12% 71%)' }} className="self-center text-xs">
                    sm/md/lg, ultimo estatico
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                name="GrainOverlay"
                description="Ruido fotografico fixed sobre a pagina. pointer-events-none."
                snippet={`<GrainOverlay intensity="normal" zIndex={50} />`}
              >
                <div
                  className="relative h-20 overflow-hidden rounded-lg"
                  style={{ background: 'hsl(173 58% 28%)' }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                      opacity: 0.08,
                      mixBlendMode: 'overlay',
                    }}
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs"
                    style={{ color: 'hsl(43 17% 93%)' }}
                  >
                    grain intensity preview
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                name="LottiePlayer"
                description="Wrapper lottie-react tipado. Carrega JSON de public/assets/lottie/."
                snippet={`<LottiePlayer animationData={anim} loop autoplay className="w-16 h-16" />`}
              >
                <div
                  className="flex items-center justify-center h-20 rounded-lg"
                  style={{ background: 'rgba(31, 118, 105, 0.08)' }}
                >
                  <span style={{ color: 'hsl(40 12% 71%)' }} className="text-xs text-center px-4">
                    Adicione um .json em public/assets/lottie/ e use LottiePlayer com import estatico.
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                name="VideoBackground"
                description="Video autoplay muted loop object-cover. Suporte mp4+webm com poster fallback."
                snippet={`<VideoBackground srcMp4="/assets/videos/hero.mp4" srcWebm="/assets/videos/hero.webm" />`}
              >
                <div
                  className="flex items-center justify-center h-20 rounded-lg"
                  style={{ background: 'rgba(200, 11%, 9%, 0.5)', border: '1px dashed rgba(242,239,234,0.15)' }}
                >
                  <span style={{ color: 'hsl(40 12% 71%)' }} className="text-xs text-center px-4">
                    Adicione mp4/webm em public/assets/videos/ para ativar o preview.
                  </span>
                </div>
              </ComponentCard>

            </div>
          </section>
        )}

        {/* Assets */}
        {showAssets && (
          <section aria-label="Assets estaticos">
            <h2
              className="mb-6 text-xs font-mono uppercase tracking-widest"
              style={{ color: 'hsl(173 35% 60%)' }}
            >
              assets — public/assets/
            </h2>
            {assetSection}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t pt-8" style={{ borderColor: 'rgba(242,239,234,0.06)' }}>
          <p className="text-xs" style={{ color: 'hsl(38 7% 51%)' }}>
            Biblioteca interna Hayzer. Apenas admins tem acesso. Nao indexado por bots.
          </p>
        </footer>

      </div>
    </div>
  )
}
