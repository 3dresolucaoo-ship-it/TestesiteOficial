'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calculator, ArrowRight } from 'lucide-react'

/**
 * Calculadora de custo de impressão 3D — lead magnet pré-launch.
 * Pública em /calculadora. Cálculo 100% client-side, sem backend.
 *
 * Inputs: preço filamento R$/kg, peso peça g, tempo h, consumo W, margem %.
 * Outputs: custo total, lucro, preço sugerido. Atualiza em tempo real.
 *
 * Copy: Carla (G7). Visual: mesma paleta da landing (surface-strong, Fraunces, petrol).
 */
export function CalculadoraForm() {
  // Defaults sensatos pra maker BR 2026 — ao abrir, calc já mostra algo útil
  const [precoFilamento, setPrecoFilamento] = useState(110)
  const [peso, setPeso] = useState(100)
  const [horas, setHoras] = useState(3)
  const [consumoW, setConsumoW] = useState(150)
  const [margem, setMargem] = useState(50)
  const [precoEnergia] = useState(0.85) // R$/kWh média BR 2026 (Aneel)

  const { custoFilamento, custoLuz, custoTotal, lucro, precoSugerido } = useMemo(() => {
    const custoFilamento = (peso / 1000) * precoFilamento
    const custoLuz = horas * (consumoW / 1000) * precoEnergia
    const custoTotal = custoFilamento + custoLuz
    const precoSugerido = custoTotal * (1 + margem / 100)
    const lucro = precoSugerido - custoTotal
    return { custoFilamento, custoLuz, custoTotal, lucro, precoSugerido }
  }, [precoFilamento, peso, horas, consumoW, margem, precoEnergia])

  return (
    <section className="relative overflow-hidden pt-24 pb-24 md:pt-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        {/* Header com badge sticker + h1 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-12 text-center md:text-left"
        >
          <div className="sticker-amber mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium tracking-wide">
            <Calculator className="h-3 w-3" strokeWidth={2.5} />
            Grátis · sem cadastro
          </div>

          <h1 className="display-h1 max-w-[820px] text-[2.75rem] text-foreground sm:text-[3.5rem] md:text-[4.25rem]">
            Calcula o preço justo da sua{' '}
            <span className="marker">peça 3D</span>.
          </h1>

          <p className="mt-6 max-w-[640px] text-[17px] leading-[1.55] text-muted-foreground md:text-[18px]">
            Põe filamento, peso, tempo e margem. Sai o preço que cobre o custo
            e ainda deixa lucro. Sem chute.
          </p>
        </motion.div>

        {/* Grid: form esquerda + outputs direita */}
        <div className="grid gap-8 lg:grid-cols-12">

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="surface-strong rounded-2xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="display-h2 text-[22px] text-foreground">
                  Sua impressão
                </h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                  Ajusta os valores. O resultado atualiza ao vivo.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Preço do filamento"
                  helper="Olha na nota da última bobina. Padrão é PLA a R$ 110."
                  suffix="R$/kg"
                  value={precoFilamento}
                  onChange={setPrecoFilamento}
                  step="0.01"
                  min={0}
                />

                <Field
                  label="Peso da peça"
                  helper="O slicer mostra antes de fatiar. Cura, Bambu, Orca: todos cospem isso."
                  suffix="g"
                  value={peso}
                  onChange={setPeso}
                  step="1"
                  min={0}
                />

                <Field
                  label="Tempo de impressão"
                  helper="Também sai do slicer. Conta o tempo real, não o otimista."
                  suffix="h"
                  value={horas}
                  onChange={setHoras}
                  step="0.1"
                  min={0}
                />

                <Field
                  label="Consumo da impressora"
                  helper="Vem na etiqueta atrás dela. Ender, Bambu e a maioria fica perto de 150W."
                  suffix="W"
                  value={consumoW}
                  onChange={setConsumoW}
                  step="1"
                  min={0}
                />

                <div className="md:col-span-2">
                  <Field
                    label="Margem que quer ter"
                    helper="Quanto você quer ganhar em cima do custo. Maker que cobra menos de 50% tá trabalhando de graça."
                    suffix="%"
                    value={margem}
                    onChange={setMargem}
                    step="1"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* OUTPUTS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="space-y-4 lg:sticky lg:top-24">
              {/* Card principal: Preço sugerido (destaque petrol) */}
              <div
                className="relative overflow-hidden rounded-2xl border p-6 md:p-7"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--petrol-400) / 0.18) 0%, hsl(var(--petrol-600) / 0.08) 100%)',
                  borderColor: 'hsl(var(--petrol-400) / 0.35)',
                  boxShadow:
                    '0 12px 40px -16px hsl(var(--petrol-400) / 0.5), inset 0 1px 0 hsl(var(--fog-50) / 0.06)',
                }}
              >
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[hsl(var(--petrol-300))]">
                  Preço sugerido
                </div>
                <div className="font-[var(--font-serif)] text-[3rem] font-semibold leading-none tracking-tight text-foreground md:text-[3.5rem]">
                  {formatBRL(precoSugerido)}
                </div>
                <p className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
                  É o número que você cobra do cliente. Custo + sua margem.
                </p>
              </div>

              {/* Custo + Lucro lado a lado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="surface-strong rounded-xl p-5">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Custo
                  </div>
                  <div className="font-[var(--font-serif)] text-[1.6rem] font-semibold leading-none tracking-tight text-foreground md:text-[1.85rem]">
                    {formatBRL(custoTotal)}
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.45] text-muted-foreground">
                    Filamento + luz.
                  </p>
                  <div className="mt-3 space-y-1 border-t border-[hsl(var(--fog-50)/0.08)] pt-3 text-[11.5px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Filamento</span>
                      <span className="font-mono">{formatBRL(custoFilamento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Luz</span>
                      <span className="font-mono">{formatBRL(custoLuz)}</span>
                    </div>
                  </div>
                </div>

                <div className="surface-strong rounded-xl p-5">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[hsl(var(--ember-400))]">
                    Lucro
                  </div>
                  <div className="font-[var(--font-serif)] text-[1.6rem] font-semibold leading-none tracking-tight text-foreground md:text-[1.85rem]">
                    {formatBRL(lucro)}
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.45] text-muted-foreground">
                    O que sobra pra você.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="px-1 text-[12px] leading-[1.55] text-muted-foreground/80">
                <span className="italic-soft">Estimativa.</span> Cobre filamento e luz.
                Não entra desgaste de bico, falha de impressão, frete, embalagem nem
                comissão de marketplace. Use como base, não como bíblia.
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-16 md:mt-20"
        >
          <div className="surface-strong relative overflow-hidden rounded-2xl p-8 md:p-10">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="display-h2 text-[24px] text-foreground md:text-[28px]">
                  Quer parar de calcular peça por peça?
                </h3>
                <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-muted-foreground">
                  No Hayzer o custo real sai direto do seu fluxo de produção.
                  Filamento, hora de máquina, comissão de marketplace, taxa de cartão.
                  Tudo num lugar só.
                </p>
              </div>
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-[14.5px] font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Entrar na waitlist
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function Field({
  label,
  helper,
  suffix,
  value,
  onChange,
  step,
  min,
}: {
  label: string
  helper: string
  suffix: string
  value: number
  onChange: (v: number) => void
  step: string
  min: number
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium tracking-wide text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => {
            const v = parseFloat(e.target.value)
            onChange(isNaN(v) ? 0 : v)
          }}
          step={step}
          min={min}
          className="flex h-11 w-full rounded-lg border border-[hsl(var(--fog-50)/0.12)] bg-[hsl(var(--card)/0.7)] px-4 pr-14 text-[15px] text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-400)/0.5)]"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {suffix}
        </span>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-[1.4] text-muted-foreground">
        {helper}
      </p>
    </div>
  )
}

function formatBRL(n: number): string {
  if (!isFinite(n)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(n)
}
