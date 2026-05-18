import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
export const metadata = {
  title: 'Calculadora Pro · PDF de orçamento, histórico e multi-impressora · Hayzer',
  description:
    'Calcula uma vez. Manda o orçamento bonito. Cliente fecha. R$ 37 pagamento único, sem mensalidade.',
}

const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CALC_PRO

export default function CalculadoraProPage() {
  return (
    <div className="grain bg-background text-foreground">
      <Header />
      <main>
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="mx-auto max-w-[860px] px-6 text-center md:px-10">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium tracking-wide"
              style={{
                background: 'hsl(var(--petrol-500) / 0.12)',
                border: '1px solid hsl(var(--petrol-400) / 0.3)',
                color: 'hsl(var(--petrol-300))',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'hsl(var(--petrol-300))' }}
              />
              Pagamento único · R$ 37 · sem mensalidade
            </div>

            <h1 className="display-h1 max-w-[700px] mx-auto text-[2.75rem] text-foreground sm:text-[3.5rem] md:text-[4rem]">
              Para de calcular preço{' '}
              <span
                className="italic-soft marker"
                style={{ boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
              >
                na cabeça, no Excel ou no zap
              </span>
              .
            </h1>

            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.6] text-muted-foreground">
              PDF pro cliente, histórico salvo, multi-impressora.
              R$&nbsp;37 pra sempre.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3">
              <CtaButton />
              <p className="text-[12px] text-muted-foreground">
                pagamento único · sem mensalidade · 7 dias pra pedir reembolso
              </p>
            </div>
          </div>
        </section>

        {/* ── FRASE ÂNCORA ──────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[860px] px-6 text-center md:px-10">
            <h2
              className="text-[2rem] font-bold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Calcula uma vez. Manda o orçamento bonito. Cliente fecha.
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.65] text-muted-foreground">
              A versão grátis resolve a conta. A Pro resolve o resto:
              o PDF que o cliente recebe, o histórico que você consulta semana que vem,
              e o perfil de cada impressora que você tem na bancada.
            </p>
          </div>
        </section>

        {/* ── 5 BENEFÍCIOS ──────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                O que você ganha
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BenefitCard
                number="01"
                title="PDF de orçamento pra mandar pro cliente"
                body="Você calcula, clica em &quot;Exportar PDF&quot;, manda no WhatsApp. Sai com seu nome, o item, o prazo e o preço final. Cliente recebe um documento, não um número solto na conversa."
              />
              <BenefitCard
                number="02"
                title="Histórico salvo no seu navegador"
                body="Cada cálculo fica gravado. Mês que vem o mesmo cliente pede a mesma peça? Abre o histórico, copia, envia. Acabou refazer conta do zero."
              />
              <BenefitCard
                number="03"
                title="Várias impressoras, cada uma com seu perfil"
                body="Tem uma Ender, uma Bambu e uma Anycubic? Cada uma com watt diferente, filamento diferente, custo diferente. Salva os perfis uma vez. Na hora de calcular, escolhe qual rodou, o resto entra automático."
              />
              <BenefitCard
                number="04"
                title="Cobra cliente de fora em dólar ou euro"
                body="Vendeu pra gringo? Inverte a moeda, ajusta o câmbio do dia, e o preço sai em USD ou EUR direto no PDF. Sem planilha auxiliar."
              />
              <BenefitCard
                number="05"
                title="Sem propaganda. Sem marca d'água."
                body="A versão grátis tem uma faixinha no rodapé do PDF. A Pro não tem. Seu orçamento, seu nome, sem ruído."
              />
            </div>
          </div>
        </section>

        {/* ── GRÁTIS vs PRO ─────────────────────────────────────────────── */}
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
                    continua grátis pra sempre
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Cálculo de custo (filamento + luz)',
                    'Preço sugerido com margem',
                    'Preço por canal (WhatsApp, ML, Shopee, Amazon, Americanas)',
                    'Slider visual de margem',
                    '1 impressora por cálculo',
                    'Marca d\'água "feito com Hayzer" no rodapé',
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
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: 'hsl(var(--petrol-300))' }}>
                    Versão Pro
                  </p>
                  <p className="mt-1 text-[13px] text-foreground font-semibold">
                    R$ 37 uma vez, pra sempre
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Tudo da Grátis',
                    'PDF profissional pra mandar pro cliente',
                    'Histórico de cálculos (volta no que você fez semana passada)',
                    'Múltiplas impressoras com perfis salvos',
                    'Suporte a USD e EUR (cliente gringo)',
                    'Sem marca d\'água',
                    'Acesso a feature nova sem pagar de novo',
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
                A gente sabe que R$ 37 não é trocado de bolso.
              </p>
              <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                Por isso o pagamento é único. Não tem mensalidade. Não tem renovação automática.
                Você paga uma vez, recebe o acesso pelo email, usa pra sempre.
              </p>
              <p className="mt-4 text-[15px] leading-[1.65] text-muted-foreground">
                Se em 7 dias você achar que não vale, devolve o dinheiro. Sem pergunta, sem formulário,
                sem &ldquo;deixa eu tentar te convencer&rdquo;. Manda email, eu estorno no mesmo dia.
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
                question="Isso é mensalidade?"
                answer="Não. Pagamento único de R$ 37. Você paga, recebe o acesso, usa pra sempre. Não tem cobrança no mês que vem, no ano que vem, em lugar nenhum."
              />
              <FaqItem
                question="E se sair feature nova depois?"
                answer="Vem junto, sem cobrar de novo. A Pro é uma única compra que vale pra todas as melhorias futuras da calculadora."
              />
              <FaqItem
                question="Funciona offline?"
                answer="A calculadora roda no seu navegador. Depois que carregou uma vez, faz cálculo sem internet. O histórico fica salvo localmente. PDF gera offline. (Câmbio USD/EUR precisa de internet pra atualizar a cotação do dia.)"
              />
              <FaqItem
                question="Posso pedir reembolso?"
                answer="Sim. Em até 7 dias depois da compra, manda um email pra suporte@hayzer.com.br pedindo o estorno. A gente devolve no mesmo dia, sem pergunta."
              />
              <FaqItem
                question="Como recebo o acesso?"
                answer="Você paga pelo Stripe (cartão ou PIX), e em alguns minutos cai um email com seu link de acesso. Salva o link nos favoritos, é por ali que você entra."
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
              Pronto pra mandar orçamento bonito?
            </h2>

            <div className="mt-8 flex flex-col items-center gap-3">
              <CtaButton />
              <p className="text-[12px] text-muted-foreground">
                pagamento único pelo Stripe · cartão ou PIX · 7 dias pra reembolso
              </p>
            </div>

            <p className="mt-8 text-[13px] text-muted-foreground">
              Dúvida?{' '}
              <a
                href="mailto:suporte@hayzer.com.br"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                suporte@hayzer.com.br
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// ── Componentes internos ─────────────────────────────────────────────────────

function CtaButton() {
  if (!stripeLink) {
    return (
      <div
        className="rounded-xl px-6 py-3 text-[14px] text-muted-foreground"
        style={{
          background: 'hsl(var(--card) / 0.5)',
          border: '1px solid hsl(var(--fog-50) / 0.08)',
        }}
        role="status"
        aria-live="polite"
      >
        Checkout temporariamente indisponível, volta em alguns minutos.
      </div>
    )
  }

  return (
    <a
      href={stripeLink}
      className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-[16px] font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-300))] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--petrol-400)) 0%, hsl(var(--petrol-500)) 100%)',
        color: 'hsl(var(--fog-50))',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 24px -8px hsl(var(--petrol-500) / 0.55)',
      }}
      aria-label="Comprar Calculadora Pro por R$ 37"
    >
      Quero a Pro · R$ 37
    </a>
  )
}

function BenefitCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'hsl(var(--card) / 0.5)',
        border: '1px solid hsl(var(--fog-50) / 0.08)',
      }}
    >
      <div
        className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
        style={{ color: 'hsl(var(--petrol-300))' }}
      >
        {number}
      </div>
      <h3 className="mb-3 text-[15px] font-semibold leading-[1.35] text-foreground">
        {title}
      </h3>
      <p
        className="text-[13.5px] leading-[1.6] text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: body }}
      />
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
