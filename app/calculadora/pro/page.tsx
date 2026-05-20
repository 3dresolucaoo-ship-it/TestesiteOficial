import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Logo } from '@/components/landing/Logo'
import { CalcProHeroTracker } from './_components/CalcProHeroTracker'
import { CalcProCtaButton } from './_components/CalcProCtaButton'

export const metadata = {
  title: 'Calculadora Pro · Sem limite, PDF e histórico · Hayzer',
  description:
    'Calc grátis tem cap de 5/dia. Pro libera tudo: sem limite diário, PDF pro cliente e histórico do mês. R$ 19/mês, cancela quando quiser.',
}

const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO
const proPrice = process.env.NEXT_PUBLIC_CALC_PRO_PRICE_MONTHLY ?? '19'

export default function CalculadoraProPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      {/* Rastreia visualização do pitch Pro (PostHog: calc_pro_pitch_view) */}
      <CalcProHeroTracker />

      <main>
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="vignette grain relative overflow-hidden">
          {/* Glows ambientes: petrol esquerda, ember direita */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[110px]"
            style={{ background: 'hsl(var(--petrol-500) / 0.22)', zIndex: 0 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-40 -right-40 h-[460px] w-[460px] rounded-full blur-[120px]"
            style={{ background: 'hsl(var(--ember-500) / 0.16)', zIndex: 0 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-160px] left-1/3 h-[380px] w-[380px] rounded-full blur-[110px]"
            style={{ background: 'hsl(var(--petrol-400) / 0.12)', zIndex: 0 }}
          />

          <div className="container-warm relative mx-auto max-w-[1000px] px-6 pt-20 pb-24 text-center md:px-10 md:pt-28 md:pb-32">
            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <Logo size="lg" pulse />
            </div>

            {/* Badge Pro com preco */}
            <div className="mb-8 flex justify-center">
              <span className="sticker-amber inline-flex -rotate-1 items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em]">
                Pro · R${proPrice}/mes · sem limite + PDF + historico
              </span>
            </div>

            <h1 className="display-h1 mx-auto max-w-[820px] text-[3rem] text-foreground sm:text-[3.75rem] md:text-[4.75rem] lg:text-[5.25rem]">
              Calcula sem limite.{' '}
              <span
                className="italic-soft marker"
                style={{ boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
              >
                Manda orcamento sério
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[580px] text-[17px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Cap de 5/dia da grátis te trava no pico das vendas.
              Pro libera tudo: sem limite diário, PDF pro cliente e histórico do mês.
            </p>

            {/* Tags "para makers que" */}
            <div className="mx-auto mt-10 flex max-w-[680px] flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px]">
              <span className="tag tag-fog">para quem</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                manda orcamento pelo WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                tem pico de pedidos no fim de semana
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'hsl(var(--petrol-400))' }} />
                vende em marketplace
              </span>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <CalcProCtaButton stripeLink={stripeLink} proPrice={proPrice} />
              <p className="text-[12px] text-muted-foreground">
                Cancela a qualquer hora. Sem fidelidade.
              </p>
            </div>
          </div>
        </section>

        {/* ── FRASE ANCORA ──────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[860px] px-6 text-center md:px-10">
            <h2
              className="text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Calcula uma vez. Manda o orcamento bonito. Cliente fecha.
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-muted-foreground">
              A versão grátis resolve a conta de hoje.
              A Pro resolve o resto: o PDF que o cliente recebe,
              o histórico que você consulta semana que vem
              e o perfil de cada impressora na bancada.
            </p>
          </div>
        </section>

        {/* ── 3 FEATURES PRINCIPAIS ─────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                O que você ganha
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                number="01"
                title="Sem limite diário"
                vs="vs 5/dia grátis"
                body="Sem cap. Teu pico de sábado não te trava mais no meio do orçamento. Calcula quanto precisar, quando precisar."
              />
              <FeatureCard
                number="02"
                title="PDF pro cliente"
                vs="orcamento bonito assinado"
                body='Você calcula, clica "Exportar PDF", manda no WhatsApp. Sai com seu nome, o item, o prazo e o preço final. Cliente recebe um documento, não um número solto na conversa.'
              />
              <FeatureCard
                number="03"
                title="Histórico do mês"
                vs="todo calculo salvo"
                body="Cada cálculo fica gravado. Mês que vem o mesmo cliente pede a mesma peça? Abre o histórico, copia, envia. Acabou refazer conta do zero."
              />
            </div>
          </div>
        </section>

        {/* ── GRATIS vs PRO ─────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[820px] px-6 md:px-10">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Grátis */}
              <div
                className="rounded-2xl p-7"
                style={{
                  background: 'hsl(var(--card) / 0.5)',
                  border: '1px solid hsl(var(--fog-50) / 0.08)',
                }}
              >
                <div className="mb-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Versão Grátis
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    5 cálculos por dia · sem cadastro
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Cálculo de custo (filamento + luz)',
                    'Preço sugerido com margem',
                    'Preço por canal (WhatsApp, ML, Shopee, Amazon, Americanas)',
                    'Slider visual de margem',
                    '1 impressora por cálculo',
                    'Marca d\'água "feito com Hayzer" no rodapé do PDF',
                    '5 cálculos por dia (reseta meia-noite)',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: 'hsl(var(--fog-200))' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div
                className="rounded-2xl p-7"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--petrol-500) / 0.14) 0%, hsl(var(--petrol-700) / 0.06) 100%)',
                  border: '1px solid hsl(var(--petrol-400) / 0.35)',
                  boxShadow: '0 12px 40px -16px hsl(var(--petrol-500) / 0.4)',
                }}
              >
                <div className="mb-5">
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: 'hsl(var(--petrol-300))' }}
                  >
                    Versão Pro
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground">
                    R${proPrice}/mês · cancela quando quiser
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Tudo da Grátis',
                    'Sem limite diário de cálculos',
                    'PDF profissional pra mandar pro cliente',
                    'Histórico de cálculos (volta no que você fez semana passada)',
                    'Múltiplas impressoras com perfis salvos',
                    'Suporte a USD e EUR (cliente gringo)',
                    'Sem marca d\'água',
                    'Novas features sem custo extra',
                  ].map((item, i) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: i === 0 ? 'hsl(var(--fog-200))' : 'hsl(var(--petrol-300))' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HONESTIDADE ───────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[640px] px-6 text-center md:px-10">
            <div
              className="rounded-2xl p-8 md:p-10"
              style={{
                background: 'hsl(var(--ember-500) / 0.07)',
                border: '1px solid hsl(var(--ember-400) / 0.2)',
              }}
            >
              <p className="text-[18px] font-semibold leading-[1.45] text-foreground md:text-[20px]">
                Sem fidelidade, sem pegadinha.
              </p>
              <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                Você assina mês a mês. Se em qualquer momento achar que não vale,
                cancela pelo painel Stripe, sem pergunta, sem formulário.
                A cobrança para no fim do ciclo.
              </p>
              <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                Dúvida?{' '}
                <a
                  href="mailto:suporte@hayzer.com.br"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  suporte@hayzer.com.br
                </a>
                . Respondo no mesmo dia.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[720px] px-6 md:px-10">
            <div className="mb-10 text-center">
              <h2
                className="text-[1.75rem] font-bold leading-[1.2] tracking-[-0.03em] text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Dúvidas frequentes
              </h2>
            </div>

            <div className="space-y-4">
              <FaqItem
                question="É mensalidade mesmo?"
                answer={`Sim. R$ ${proPrice}/mês. Cancela quando quiser pelo painel Stripe, sem ligar pra ninguém. Não tem multa, não tem fidelidade mínima.`}
              />
              <FaqItem
                question="O que acontece com meu histórico se eu cancelar?"
                answer="Você continua com acesso até o fim do ciclo que já pagou. Depois cai pra versão grátis (cap 5/dia). Histórico fica no seu navegador, você não perde nada."
              />
              <FaqItem
                question="O limite de 5/dia é por dispositivo?"
                answer="Sim, por navegador. Se você usa no celular e no notebook, cada um tem seu próprio contador. O cap reseta todo dia à meia-noite."
              />
              <FaqItem
                question="Funciona offline?"
                answer="A calculadora roda no navegador. Depois que carregou uma vez, faz cálculo sem internet. O histórico fica salvo localmente. PDF gera offline. (Câmbio USD/EUR precisa de internet pra atualizar cotação.)"
              />
              <FaqItem
                question="Como recebo o acesso Pro?"
                answer="Você paga pelo Stripe (cartão ou PIX) e em alguns minutos cai um email com seu link de acesso. Salva o link nos favoritos."
              />
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
        <section className="py-16 pb-28 md:py-20 md:pb-36">
          <div className="mx-auto max-w-[700px] px-6 text-center md:px-10">
            <h2
              className="text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Pronto pra calcular sem trava e mandar orcamento bonito?
            </h2>

            <div className="mt-8 flex flex-col items-center gap-3">
              <CalcProCtaButton stripeLink={stripeLink} proPrice={proPrice} />
              <p className="text-[12px] text-muted-foreground">
                pagamento pelo Stripe · cartão ou PIX · cancela a qualquer hora
              </p>
            </div>

            <div className="mt-6">
              <a
                href="/calculadora"
                className="text-[13px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Voltar pra calculadora grátis
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// ── Componentes internos ─────────────────────────────────────────────────────

function FeatureCard({
  number,
  title,
  vs,
  body,
}: {
  number: string
  title: string
  vs: string
  body: string
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'hsl(var(--card) / 0.5)',
        border: '1px solid hsl(var(--fog-50) / 0.08)',
      }}
    >
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--petrol-300))' }}>
        {number}
      </div>
      <h3 className="mb-0.5 text-[15px] font-semibold leading-[1.35] text-foreground">
        {title}
      </h3>
      <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground/70">
        {vs}
      </p>
      <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
        {body}
      </p>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      className="rounded-xl p-5 md:p-6"
      style={{
        background: 'hsl(var(--card) / 0.5)',
        border: '1px solid hsl(var(--fog-50) / 0.08)',
      }}
    >
      <p className="text-[15px] font-semibold text-foreground">{question}</p>
      <p className="mt-2 text-[14px] leading-[1.65] text-muted-foreground">{answer}</p>
    </div>
  )
}
