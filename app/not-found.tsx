/**
 * 404 global da aplicacao.
 *
 * Padrao Next.js App Router: app/not-found.tsx vira pagina 404 global.
 * Renderiza quando notFound() e chamado em qualquer rota OU URL nao matched.
 *
 * Visual segue paleta Hayzer (night/petrol/ember). Headline editorial sem
 * ponto final (regra fixada 20/05/2026).
 *
 * Server Component: sem state, sem framer-motion (TBT-conscious).
 *
 * Reescrita 20/05/2026: versao anterior usava bg-[#7c3aed] (purple),
 * cor banida na identidade Hayzer (anti-IA), e linkava "Voltar ao
 * Dashboard" pra usuario nao logado (redirect /login = experiencia ruim).
 */

import Link from 'next/link'

export const metadata = {
  title: '404',
  description: 'A pagina que tu procurou nao existe ou foi movida.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="mx-auto max-w-[520px] text-center">
        {/* Codigo 404 grande em Fraunces */}
        <div
          className="mb-6"
          style={{
            fontSize: 'clamp(5rem, 12vw, 9rem)',
            lineHeight: 1,
            color: 'hsl(var(--petrol-400))',
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          404
        </div>

        {/* Tag eyebrow */}
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
          style={{
            borderColor: 'hsl(var(--ember-500) / 0.35)',
            color: 'hsl(var(--ember-400))',
            fontFamily: 'ui-monospace, "Geist Mono", monospace',
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'hsl(var(--ember-400))' }}
          />
          pagina nao encontrada
        </div>

        {/* Headline editorial sem ponto final */}
        <h1
          className="display-h2 mb-5 text-foreground"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            lineHeight: 1.2,
          }}
        >
          Essa rota nao existe por aqui
        </h1>

        {/* Sub explicativo */}
        <p
          className="mb-10 leading-[1.55]"
          style={{ color: 'hsl(var(--fog-400))', fontSize: '15px' }}
        >
          Pode ser um link antigo, um typo na URL ou alguma coisa que ja saiu
          do ar. Volta pro inicio e a gente te leva pra onde tu queria ir.
        </p>

        {/* Acoes */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              background: 'hsl(var(--petrol-600))',
              color: 'hsl(var(--fog-50))',
            }}
          >
            Voltar pro inicio
          </Link>

          <Link
            href="/calculadora"
            className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              borderColor: 'hsl(var(--fog-50) / 0.15)',
              color: 'hsl(var(--fog-200))',
            }}
          >
            Testar calculadora gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
