import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import type { SearchParams } from 'next/dist/server/request/search-params'

export const metadata = {
  title: 'Calculadora Pro liberada · Hayzer',
  description: 'Compra confirmada. Verifique o email com as instruções de acesso.',
  robots: { index: false },
}

interface SuccessPageProps {
  searchParams: Promise<SearchParams>
}

export default async function CalculadoraProSucessoPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = typeof params.session_id === 'string' ? params.session_id : null

  return (
    <div className="grain bg-background text-foreground">
      <Header />
      <main>
        <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-6 py-20 text-center md:px-10">
          <div className="mx-auto max-w-[560px]">
            {/* Indicador visual simples, sem confetti, sem over-the-top */}
            <div
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: 'hsl(var(--petrol-500) / 0.14)',
                border: '1px solid hsl(var(--petrol-400) / 0.35)',
              }}
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--petrol-300))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1
              className="text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pronto! A Pro tá liberada.
            </h1>

            <p className="mx-auto mt-5 max-w-[480px] text-[16px] leading-[1.65] text-muted-foreground">
              Verifica o email. Mandamos as instruções de acesso em até 5min.
              Salva o link que vai chegar nos favoritos, é por ele que você entra de qualquer dispositivo.
            </p>

            {/* Próximos passos */}
            <div
              className="mx-auto mt-8 rounded-xl p-6 text-left"
              style={{
                background: 'hsl(var(--card) / 0.5)',
                border: '1px solid hsl(var(--fog-50) / 0.08)',
              }}
            >
              <p
                className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em]"
                style={{ color: 'hsl(var(--petrol-300))' }}
              >
                O que mudou
              </p>
              <ul className="space-y-3">
                {[
                  'Botão "Exportar PDF" agora funciona',
                  'Histórico salva cada cálculo no navegador',
                  'Dropdown de impressora aceita múltiplos perfis',
                  'Moeda inverte pra USD ou EUR quando precisar',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'hsl(var(--petrol-300))' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/calculadora"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[14px] font-medium text-foreground transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))]"
                style={{
                  background: 'hsl(var(--card) / 0.6)',
                  border: '1px solid hsl(var(--fog-50) / 0.12)',
                }}
                aria-label="Voltar para a calculadora"
              >
                Volta pra calculadora
              </Link>
            </div>

            {/* Fallback discreto se não tem session_id (acesso direto à URL) */}
            {!sessionId && (
              <p className="mt-6 text-[12px] text-muted-foreground/60">
                Dúvida sobre o acesso?{' '}
                <a
                  href="mailto:suporte@hayzer.com.br"
                  className="underline underline-offset-2"
                >
                  suporte@hayzer.com.br
                </a>
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
