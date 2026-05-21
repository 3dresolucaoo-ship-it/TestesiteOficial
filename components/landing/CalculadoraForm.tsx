'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calculator, ArrowRight, Copy, Check } from 'lucide-react'
import { track } from '@/lib/posthog'
import {
  Disc,           // rolo de filamento (3D look)
  Cube,           // peça 3D
  Hourglass,      // tempo de impressão
  Plug,           // consumo de energia
  TrendUp,        // margem
  WhatsappLogo,
  ShoppingCart,
  Storefront,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'

/**
 * Calculadora de custo de impressão 3D — lead magnet pré-launch.
 * Pública em /calculadora. Cálculo 100% client-side, sem backend.
 *
 * Build by G7 squad:
 * - Carla (copy): tom maker BR + frases "dá solução, não explicação"
 * - Diego (designer): ícones contextuais + presets chips + pulse + semáforo + iOS 16px fix
 * - Marcos (marketing): canais marketplace 2026 + red flag "lead magnet desconectado"
 * - Sofia (CS): empty states + helpers do leigo + microcopy zero-dúvida + copy-pro-cliente
 *
 * Diferencial vs concorrentes (Custos3D, MakerFlow, 3D Prime):
 * - Tabela "preço por canal" com gross-up correto preço/(1-comissão)
 * - Presets clicáveis que pré-preenchem cenário maker real
 * - Semáforo de margem (verde/âmbar/vermelho)
 * - Botão "Copiar pro cliente" que gera texto pronto pra WhatsApp
 */

// ─── Modelos de impressora 3D + consumo W (dropdown rápido pra leigo) ────
// Watts médios em modo de impressão (não em standby). Cobre 80% dos
// makers BR em 2026. "Outra" libera input manual.
const PRINTERS = [
  { label: 'Ender 3 V2',             watts: '80'  },
  { label: 'Ender 3 S1',             watts: '120' },
  { label: 'Bambu Lab A1 / A1 mini', watts: '100' },
  { label: 'Bambu Lab P1S',          watts: '150' },
  { label: 'Bambu Lab X1C',          watts: '250' },
  { label: 'Creality K1 / K1 Max',   watts: '200' },
  { label: 'Anycubic Kobra 2 Pro',   watts: '130' },
  { label: 'Prusa i3 MK4',           watts: '120' },
] as const

// ─── Canais marketplace (Marcos) ──────────────────────────────────────────
// Comissões médias 2026 BR. ML Clássico 11-14% (uso 12%). Shopee >R$100: 14%.
// Amazon Casa/Decoração ≤R$200: 15%. Americanas Hobbies: 16.5%.
const CHANNELS: ReadonlyArray<{
  name: string
  commission: number
  icon: PhosphorIcon
}> = [
  { name: 'WhatsApp / PIX',          commission: 0,    icon: WhatsappLogo },
  { name: 'Mercado Livre Clássico',  commission: 12,   icon: ShoppingCart },
  { name: 'Shopee',                  commission: 14,   icon: Storefront },
  { name: 'Amazon BR',               commission: 15,   icon: ShoppingCart },
  { name: 'Americanas',              commission: 16.5, icon: Storefront },
]

export function CalculadoraForm() {
  // State como string permite campo vazio + edição livre (não volta pra 0).
  const [precoFilamento, setPrecoFilamento] = useState('110')
  const [peso, setPeso] = useState('100')
  const [horas, setHoras] = useState('3')
  const [consumoW, setConsumoW] = useState('150')
  const [margem, setMargem] = useState('50')
  const [copied, setCopied] = useState(false)
  const precoEnergia = 0.85

  // ─── Analytics: calculadora_view (uma vez no mount) ─────────────────────
  const viewTracked = useRef(false)
  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    track('calculadora_view')
  }, [])

  // ─── Analytics: calculadora_calculated (debounced 1.5s apos ultima mudanca) ─
  // Dispara somente quando resultado valido (precoSugerido > 0, sem alerta critico).
  const calcDebounce = useRef<ReturnType<typeof setTimeout> | null>(null) // R$/kWh média BR 2026 (Aneel) — constante

  const { custoFilamento, custoLuz, custoTotal, lucro, precoSugerido, semaforo, alerta } = useMemo(() => {
    const filamentN = parseFloat(precoFilamento) || 0
    const pesoN     = parseFloat(peso)           || 0
    const horasN    = parseFloat(horas)          || 0
    const consumoN  = parseFloat(consumoW)       || 0
    const margemN   = parseFloat(margem)         || 0

    const custoFilamento = (pesoN / 1000) * filamentN
    const custoLuz       = horasN * (consumoN / 1000) * precoEnergia
    const custoTotal     = custoFilamento + custoLuz
    const precoSugerido  = custoTotal * (1 + margemN / 100)
    const lucro          = precoSugerido - custoTotal

    // Semáforo de margem (Diego): >=50 saudável, 20-49 apertada, <20 prejuízo
    const semaforo =
      margemN >= 50 ? { hsl: '--petrol-300',  bg: '--petrol-400', label: 'margem saudável' } :
      margemN >= 20 ? { hsl: '--ember-400',   bg: '--ember-400',  label: 'margem apertada' } :
                      { hsl: '--ember-500',   bg: '--ember-500',  label: 'está trabalhando de graça' }

    // Empty state alertas (Sofia): valor zerado ou absurdo
    let alerta: string | null = null
    if (filamentN === 0 || precoFilamento === '') alerta = 'Filamento zerado. Coloca o preço da bobina.'
    else if (pesoN === 0 || peso === '')          alerta = 'Peso zerado. Toda peça usa filamento.'
    else if (precoSugerido < 1)                   alerta = 'Esse preço cobre menos que uma coxinha. Confere o peso e o tempo.'

    return { custoFilamento, custoLuz, custoTotal, lucro, precoSugerido, semaforo, alerta }
  }, [precoFilamento, peso, horas, consumoW, margem])

  useEffect(() => {
    if (calcDebounce.current) clearTimeout(calcDebounce.current)
    if (precoSugerido <= 0 || alerta) return
    calcDebounce.current = setTimeout(() => {
      track('calculadora_calculated', {
        filamento_r_kg:  parseFloat(precoFilamento) || 0,
        peso_g:          parseFloat(peso) || 0,
        horas:           parseFloat(horas) || 0,
        consumo_w:       parseFloat(consumoW) || 0,
        margem_pct:      parseFloat(margem) || 0,
        preco_sugerido:  Math.round(precoSugerido * 100) / 100,
        semaforo:        semaforo.label,
      })
    }, 1500)
    return () => { if (calcDebounce.current) clearTimeout(calcDebounce.current) }
  }, [precoFilamento, peso, horas, consumoW, margem, precoSugerido, alerta, semaforo.label])

  function handleCopy() {
    // Só o valor formatado. Cliente não precisa ver o cálculo.
    navigator.clipboard.writeText(formatBRL(precoSugerido)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
      track('calculadora_result_copied', {
        preco_sugerido: Math.round(precoSugerido * 100) / 100,
      })
    })
  }

  return (
    <section className="grain grain-soft relative overflow-hidden pt-24 pb-24 md:pt-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        {/* Header */}
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
                  icon={Disc}
                  label="Preço do filamento"
                  helper="Não sabe? Deixa R$ 110, preço médio do PLA em 2026."
                  suffix="R$/kg"
                  value={precoFilamento}
                  onChange={setPrecoFilamento}
                  step="0.01"
                  min={0}
                />

                <Field
                  icon={Cube}
                  label="Peso da peça"
                  helper="Não sabe? Cabe na mão = 50g. Numa xícara = 150g. Maior = 300g+."
                  suffix="g"
                  value={peso}
                  onChange={setPeso}
                  step="1"
                  min={0}
                />

                <Field
                  icon={Hourglass}
                  label="Tempo de impressão"
                  helper="Slicer subestima. Acrescenta 20% por segurança. Pequena = 2h, média = 5h."
                  suffix="h"
                  value={horas}
                  onChange={setHoras}
                  step="0.1"
                  min={0}
                />

                {/* Consumo W: dropdown impressora (atalho leigo) + input manual */}
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--petrol-400)/0.10)] text-[hsl(var(--petrol-300))]">
                      <Plug size={20} weight="duotone" />
                    </div>
                    <label className="text-[13px] font-medium tracking-wide text-foreground">
                      Consumo da impressora
                    </label>
                  </div>

                  {/* Dropdown atalho — escolhe o modelo, preenche W */}
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) setConsumoW(e.target.value)
                    }}
                    className="mb-2 flex h-11 w-full appearance-none rounded-lg border border-[hsl(var(--fog-50)/0.12)] bg-[hsl(var(--card)/0.7)] px-4 pr-10 text-[14px] text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-400)/0.5)] bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23a1a1aa%22%3E%3Cpath%20d%3D%22M5.5%208l4.5%204.5L14.5%208z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat"
                  >
                    <option value="">Ou escolhe sua impressora...</option>
                    {PRINTERS.map(p => (
                      <option key={p.label} value={p.watts}>
                        {p.label} · {p.watts}W
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={consumoW}
                      onChange={e => setConsumoW(e.target.value)}
                      onFocus={e => e.target.select()}
                      step="1"
                      min={0}
                      placeholder="0"
                      className="flex h-12 w-full rounded-lg border border-[hsl(var(--fog-50)/0.12)] bg-[hsl(var(--card)/0.7)] px-4 pr-14 text-[16px] text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-400)/0.5)]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      W
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-[1.4] text-muted-foreground">
                    Não acha sua impressora? Deixa 150W ou digita manual.
                  </p>
                </div>

                {/* Margem: input + slider combo */}
                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--petrol-400)/0.10)] text-[hsl(var(--petrol-300))]">
                      <TrendUp size={20} weight="duotone" />
                    </div>
                    <label className="text-[13px] font-medium tracking-wide text-foreground">
                      Margem que quer ter
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    {/* Slider visual — usa accent-color do semáforo */}
                    <div className="flex flex-col justify-center px-1">
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={parseFloat(margem) || 0}
                        onChange={e => setMargem(e.target.value)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[hsl(var(--fog-50)/0.10)]"
                        style={{ accentColor: `hsl(var(${semaforo.bg}))` }}
                        aria-label="Margem em porcentagem (arraste para ajustar)"
                      />
                      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>0% prejuízo</span>
                        <span>50% saudável</span>
                        <span>200% premium</span>
                      </div>
                    </div>

                    {/* Input número — pra valor exato */}
                    <div className="relative md:w-32">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={margem}
                        onChange={e => setMargem(e.target.value)}
                        onFocus={e => e.target.select()}
                        step="1"
                        min={0}
                        placeholder="0"
                        className="flex h-12 w-full rounded-lg border border-[hsl(var(--fog-50)/0.12)] bg-[hsl(var(--card)/0.7)] px-4 pr-9 text-center text-[16px] font-semibold text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-400)/0.5)]"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-[1.4] text-muted-foreground">
                    50% é o mínimo. Abaixo, tu paga pra trabalhar. Acima de 80%, é premium.
                  </p>
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
              {/* Card principal: Preço sugerido (gradient petrol + pulse) */}
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

                {/* Pulse on change — key força remount, motion anima */}
                <motion.div
                  key={precoSugerido}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="font-[var(--font-serif)] text-[3rem] font-bold leading-none tracking-[-0.04em] text-foreground md:text-[3.75rem]"
                >
                  {formatBRL(precoSugerido)}
                </motion.div>

                {/* Semáforo de margem (Diego) */}
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1"
                  style={{ background: `hsl(var(${semaforo.bg}) / 0.12)` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: `hsl(var(${semaforo.bg}))` }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: `hsl(var(${semaforo.hsl}))` }}
                  >
                    {semaforo.label}
                  </span>
                </div>

                <p className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">
                  Seu chão de preço. Pode cobrar mais, nunca menos que isso.
                </p>

                {/* Empty state alerta (Sofia) — inline, não bloqueia cálculo */}
                {alerta && (
                  <div
                    className="mt-4 rounded-lg px-3 py-2 text-[12px] leading-[1.45]"
                    style={{
                      background: 'hsl(var(--ember-400) / 0.10)',
                      border: '1px solid hsl(var(--ember-400) / 0.25)',
                      color: 'hsl(var(--ember-300))',
                    }}
                  >
                    {alerta}
                  </div>
                )}

              {/* Botão "Copiar pro cliente" (Sofia + Marcos) — geração de viralização */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--fog-50)/0.15)] bg-[hsl(var(--card)/0.6)] px-3 py-2 text-[12.5px] font-medium text-foreground transition-all hover:border-[hsl(var(--petrol-400)/0.5)] hover:bg-[hsl(var(--petrol-400)/0.08)]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--petrol-300))]" strokeWidth={2.5} />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        Copiar para o cliente
                      </>
                    )}
                  </button>
                </div>
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
                    Mínimo que tu gasta. Cobrar abaixo é dar prejuízo.
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

                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'hsl(var(--card) / 0.55)',
                    border: '1px solid hsl(var(--ember-400) / 0.25)',
                    boxShadow:
                      '0 8px 32px -12px rgba(0,0,0,0.55), inset 0 1px 0 hsl(var(--ember-400) / 0.08)',
                  }}
                >
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Lucro
                  </div>
                  <div className="font-[var(--font-serif)] text-[1.6rem] font-semibold leading-none tracking-tight text-foreground md:text-[1.85rem]">
                    {formatBRL(lucro)}
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.45] text-muted-foreground">
                    O que entra no bolso depois de material e luz. Não inclui teu tempo.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="px-1 text-[12px] leading-[1.55] text-muted-foreground/80">
                <span className="italic-soft">Estimativa.</span> Cobre filamento e luz.
                Não entra desgaste de bico, falha de impressão, frete nem embalagem.
                Use como base, não como bíblia.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabela: Preço por canal de venda (diferencial — gross-up correto) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto mt-16 max-w-[820px]"
        >
          <div className="surface-strong rounded-2xl p-6 md:p-8">
            <div className="mb-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Por onde tu vende
              </div>
              <h3 className="display-h2 text-[20px] text-foreground md:text-[22px]">
                Cada marketplace come uma fatia.
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">
                A tabela ajusta o preço pra tu sair com o lucro de cima,
                líquido, não importa onde a peça vender.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[hsl(var(--fog-50)/0.06)]">
              {CHANNELS.map((channel, i) => {
                const isLast = i === CHANNELS.length - 1
                const isBest = channel.commission === 0
                // Gross-up correto: preço / (1 - comissão/100)
                const finalPrice = precoSugerido / (1 - channel.commission / 100)
                const Icon = channel.icon

                return (
                  <motion.div
                    key={channel.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                    className={`group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[hsl(var(--fog-50)/0.02)] md:px-5 ${
                      isLast ? '' : 'border-b border-[hsl(var(--fog-50)/0.06)]'
                    }`}
                    style={
                      isBest
                        ? { boxShadow: 'inset 2px 0 0 hsl(var(--petrol-400))' }
                        : undefined
                    }
                  >
                    <Icon
                      size={20}
                      weight="duotone"
                      className={`shrink-0 ${
                        isBest ? 'text-[hsl(var(--petrol-300))]' : 'text-muted-foreground'
                      }`}
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-foreground">
                          {channel.name}
                        </span>
                        {isBest && (
                          <span
                            className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
                            style={{ color: 'hsl(var(--petrol-300))' }}
                          >
                            melhor margem
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {channel.commission === 0
                          ? 'sem comissão'
                          : `${channel.commission}% de comissão`}
                      </span>
                    </div>

                    <div className="font-[var(--font-serif)] text-[1.4rem] font-semibold leading-none tracking-tight text-foreground tabular-nums md:text-[1.55rem]">
                      {formatBRL(finalPrice)}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-4 text-[11.5px] leading-[1.55] text-muted-foreground/80">
              <span className="italic-soft">Comissões médias 2026.</span> Varia por
              categoria, plano do seller e promoção da casa. Frete e taxa de saque
              ficam fora, soma à parte quando for fechar.
            </p>

            {/* Frase de conexão (Marcos red flag #7) — fecha o aha-moment com argumento de compra */}
            <p className="mt-4 text-[13px] leading-[1.55] text-foreground/90">
              Essa conta tu fez agora na mão. <span className="font-semibold text-foreground">No Hayzer, ela acontece sozinha</span> pra cada pedido que entra: filamento, luz, comissão, taxa de cartão. Tu só confere.
            </p>
          </div>
        </motion.div>

        {/* CTA Waitlist — ember container + ember solid button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative mt-16 md:mt-20"
        >
          <div
            aria-hidden
            className="watermark pointer-events-none absolute -top-6 right-0 hidden select-none leading-none md:block md:text-[7rem] lg:text-[10rem]"
          >
            preço<br />justo.
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-8 md:p-10"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--ember-500) / 0.18) 0%, hsl(var(--petrol-600) / 0.12) 100%)',
              border: '1px solid hsl(var(--ember-400) / 0.35)',
              boxShadow:
                '0 12px 40px -16px hsl(var(--ember-500) / 0.45), inset 0 1px 0 hsl(var(--fog-50) / 0.06)',
            }}
          >
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
                className="group inline-flex items-center justify-center gap-2 rounded-lg px-7 py-4 text-[15px] font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(180deg, hsl(var(--ember-400)) 0%, hsl(var(--ember-500)) 100%)',
                  color: 'hsl(var(--night-950))',
                  boxShadow:
                    '0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 24px -8px hsl(var(--ember-500) / 0.55), 0 0 40px -12px hsl(var(--ember-500) / 0.35)',
                }}
              >
                Quero o Hayzer antes
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
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
  icon: Icon,
  label,
  helper,
  suffix,
  value,
  onChange,
  step,
  min,
}: {
  icon: PhosphorIcon
  label: string
  helper: string
  suffix: string
  value: string
  onChange: (v: string) => void
  step: string
  min: number
}) {
  return (
    <div>
      {/* Ícone contextual + label — Phosphor duotone (mais realista, 2 cores) */}
      <div className="mb-2 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--petrol-400)/0.10)] text-[hsl(var(--petrol-300))]">
          <Icon size={20} weight="duotone" />
        </div>
        <label className="text-[13px] font-medium tracking-wide text-foreground">
          {label}
        </label>
      </div>

      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={e => e.target.select()}
          step={step}
          min={min}
          placeholder="0"
          // h-12 + text-[16px] — mata o bug iOS zoom em input <16px
          className="flex h-12 w-full rounded-lg border border-[hsl(var(--fog-50)/0.12)] bg-[hsl(var(--card)/0.7)] px-4 pr-14 text-[16px] text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--petrol-400)/0.5)]"
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
