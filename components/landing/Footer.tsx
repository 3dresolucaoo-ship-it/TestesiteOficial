import Link from 'next/link'
import { Logo } from './Logo'

/**
 * Footer v2 — 3 colunas: logo+descrição, produto, institucional.
 * Watermark "feito no brasil." gigante (200px Fraunces) embaixo.
 */
export function Footer() {
  return (
    <footer
      className="grain-soft grain relative border-t border-border/40"
      style={{ background: 'hsl(var(--night-950))' }}
    >
      <div className="container-warm relative mx-auto max-w-[1180px] px-6 py-16 md:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo size="sm" />
            <p className="mt-4 max-w-[320px] text-[13.5px] leading-[1.55] text-muted-foreground">
              O centro do seu negócio. Estoque, vendas, clientes, financeiro num só lugar.
            </p>
          </div>

          <div className="lg:col-span-3">
            <div className="tag tag-fog mb-3">produto</div>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  O que faz
                </a>
              </li>
              <li>
                <a
                  href="#por-que"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Por quê
                </a>
              </li>
              <li>
                <a
                  href="#waitlist"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Entrar na lista
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="tag tag-fog mb-3">institucional</div>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link
                  href="/privacidade"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Termos
                </Link>
              </li>
              <li>
                <a
                  href="mailto:ola@bvaz-hub.com"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Watermark tipográfica gigante — peso visual no encerramento */}
        <div className="mt-12 overflow-hidden">
          <div className="watermark whitespace-nowrap text-[7.5rem] leading-none md:text-[12.5rem]">
            feito no brasil.
          </div>
        </div>

        <div
          className="mt-6 flex items-center justify-between border-t pt-6 text-[12.5px]"
          style={{
            borderColor: 'hsl(var(--fog-50) / 0.06)',
            color: 'hsl(var(--fog-400))',
          }}
        >
          <span>© {new Date().getFullYear()} BVaz Hub.</span>
          <span style={{ fontFamily: 'ui-monospace, "Geist Mono", monospace' }}>v0.3 · waitlist</span>
        </div>
      </div>
    </footer>
  )
}
