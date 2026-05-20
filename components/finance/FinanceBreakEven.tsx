'use client'

import Link from 'next/link'
import { AlertCircle, Info, Target } from 'lucide-react'
import type { FixedCost } from '@/lib/types'
import type { BreakEvenSummary } from '@/core/finance/breakEvenEngine'
import { fmt } from './types'
import { FinanceFixedCosts } from './FinanceFixedCosts'
import { ProgressBar } from './FinanceFixedCosts'

// ─── Break-even section ───────────────────────────────────────────────────────

interface BreakEvenSectionProps {
  summary:             BreakEvenSummary
  projects:            { id: string; name: string }[]
  selectedProjectId:   string
  onSelectProject:     (id: string) => void
  fixedCosts:          FixedCost[]
  profitGoal:          number
  totalFixedCost:      number
  onAddFixedCost:      (label: string, amount: number) => Promise<void>
  onUpdateFixedCost:   (cost: FixedCost) => Promise<void>
  onDeleteFixedCost:   (id: string) => Promise<void>
  onProfitGoalChange:  (v: number) => void
  hasProducts:         boolean
  loading:             boolean
}

export function BreakEvenSection({
  summary,
  projects,
  selectedProjectId,
  onSelectProject,
  fixedCosts,
  profitGoal,
  totalFixedCost,
  onAddFixedCost,
  onUpdateFixedCost,
  onDeleteFixedCost,
  onProfitGoalChange,
  hasProducts,
  loading,
}: BreakEvenSectionProps) {
  const noFixedCost = totalFixedCost <= 0
  const noProducts  = !hasProducts || summary.products.length === 0
  const noProject   = !selectedProjectId

  return (
    <div className="space-y-5">

      {/* Educational header */}
      <div className="bg-[rgba(124,58,237,0.05)] border border-[#7c3aed33] rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-[#a78bfa] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#888888] leading-relaxed">
          <p className="text-[#f0f0f5] font-medium mb-1">O que e Ponto de Equilibrio?</p>
          <p>
            E quanto voce precisa{' '}
            <strong className="text-[#a78bfa]">vender por mes</strong> pra{' '}
            <strong>nao ter prejuizo</strong>.
            Calculado a partir dos seus{' '}
            <strong>custos fixos</strong> (aluguel, DAS-MEI, internet...) divididos pela{' '}
            <strong> margem de contribuicao</strong> (preco menos custo variavel) de cada produto.
          </p>
        </div>
      </div>

      {/* Project selector */}
      <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <label
          htmlFor="be-project-select"
          className="text-[#555555] text-xs uppercase tracking-wide font-medium"
        >
          Projeto
        </label>
        <select
          id="be-project-select"
          value={selectedProjectId}
          onChange={e => onSelectProject(e.target.value)}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] cursor-pointer flex-1 min-w-[200px]"
        >
          {projects.length === 0 && <option value="">Sem projetos</option>}
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="text-[#444455] text-[11px]">Custos e meta sao por projeto.</span>
      </div>

      {noProject && (
        <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-[#f59e0b]">
            Crie um projeto em{' '}
            <Link href="/projects" className="underline">
              /projects
            </Link>{' '}
            pra cadastrar custos fixos.
          </p>
        </div>
      )}

      {!noProject && (
        <>
          <FinanceFixedCosts
            fixedCosts={fixedCosts}
            totalFixedCost={totalFixedCost}
            loading={loading}
            onAdd={onAddFixedCost}
            onUpdate={onUpdateFixedCost}
            onDelete={onDeleteFixedCost}
          />

          {/* Profit goal */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <label
              htmlFor="profit-goal-input"
              className="text-[#555555] text-xs uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5"
            >
              <Target size={12} aria-hidden="true" />
              Meta de lucro mensal (R$)
            </label>
            <input
              id="profit-goal-input"
              type="number"
              min="0"
              step="0.01"
              value={profitGoal || ''}
              onChange={e => onProfitGoalChange(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 3000"
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f5] text-lg font-semibold rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] tabular-nums"
            />
            <p className="text-[#444455] text-[11px] mt-2">
              Quanto voce quer levar pra casa por mes depois de pagar tudo. Salva automaticamente.
            </p>
          </div>

          {noFixedCost && (
            <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-[#f59e0b]">
                Informe seu <strong>custo fixo mensal</strong> acima pra calcular o ponto de equiilibrio.
              </p>
            </div>
          )}

          {noProducts && !noFixedCost && (
            <div className="bg-[#f59e0b1a] border border-[#f59e0b33] rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-[#f59e0b]">
                Voce precisa cadastrar{' '}
                <strong>produtos</strong> com preco de venda em{' '}
                <Link href="/products" className="underline">
                  /products
                </Link>{' '}
                pra calcular margem por unidade.
              </p>
            </div>
          )}

          {!noFixedCost && !noProducts && (
            <>
              {/* Result cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-[#7c3aed1a] to-[#7c3aed05] border border-[#7c3aed33] rounded-xl p-5">
                  <p className="text-[#a78bfa] text-[11px] uppercase tracking-wide font-semibold mb-2">
                    Ponto de Equilibrio
                  </p>
                  <p className="text-[#f0f0f5] text-3xl font-bold tabular-nums mb-1">
                    {fmt(summary.breakEvenRevenue)}
                  </p>
                  <p className="text-[#888888] text-xs mb-4">
                    precisa vender esse mes pra nao ter prejuizo
                  </p>
                  <ProgressBar
                    value={summary.breakEvenProgress}
                    colorActive="#a78bfa"
                    colorBg="#7c3aed22"
                  />
                  <p className="text-[#555555] text-[11px] mt-2">
                    Hoje:{' '}
                    <span className="text-[#a78bfa] font-medium tabular-nums">
                      {fmt(summary.currentMonthRevenue)}
                    </span>{' '}
                    ({summary.breakEvenProgress.toFixed(0)}%)
                  </p>
                </div>

                {profitGoal > 0 && (
                  <div className="bg-gradient-to-br from-[#10b9811a] to-[#10b98105] border border-[#10b98133] rounded-xl p-5">
                    <p className="text-[#10b981] text-[11px] uppercase tracking-wide font-semibold mb-2">
                      Meta de Lucro {fmt(profitGoal)}
                    </p>
                    <p className="text-[#f0f0f5] text-3xl font-bold tabular-nums mb-1">
                      {fmt(summary.goalRevenue)}
                    </p>
                    <p className="text-[#888888] text-xs mb-4">
                      precisa vender pra atingir a meta
                    </p>
                    <ProgressBar
                      value={summary.goalProgress}
                      colorActive="#10b981"
                      colorBg="#10b98122"
                    />
                    <p className="text-[#555555] text-[11px] mt-2">
                      Hoje:{' '}
                      <span className="text-[#10b981] font-medium tabular-nums">
                        {fmt(summary.currentMonthRevenue)}
                      </span>{' '}
                      ({summary.goalProgress.toFixed(0)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Average MC% */}
              <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[#555555] text-[11px] uppercase tracking-wide font-medium">
                    Margem de Contribuicao Media
                  </p>
                  <p className="text-[#f0f0f5] text-2xl font-bold tabular-nums">
                    {summary.avgContributionPct.toFixed(1)}%
                  </p>
                </div>
                <div className="text-[#888888] text-xs max-w-md">
                  Ponderada pelo preco dos seus {summary.products.length} produto(s). Quanto maior,
                  menos unidades voce precisa vender pra cobrir o custo fixo.
                </div>
              </div>

              {/* Per-product breakdown */}
              <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                  <p className="text-[#f0f0f5] text-sm font-medium">Por Produto</p>
                  <p className="text-[#444455] text-[11px]">
                    unidades necessarias pra break-even / meta
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.05)]">
                        {(['Produto', 'Preco', 'Custo Var.', 'MC un.', 'MC %', 'Break-even', ...(profitGoal > 0 ? ['Meta'] : [])] as const).map(
                          h => (
                            <th
                              key={h}
                              className="text-left py-2.5 px-4 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.products.map(p => {
                        const isLoss = p.contributionMargin <= 0
                        return (
                          <tr
                            key={p.productId}
                            className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                          >
                            <td className="py-3 px-4 first:pl-5 text-[#f0f0f5] text-xs">
                              {p.productName}
                            </td>
                            <td className="py-3 px-4 text-[#10b981] text-xs tabular-nums">
                              {fmt(p.salePrice)}
                            </td>
                            <td className="py-3 px-4 text-[#ef4444] text-xs tabular-nums">
                              {fmt(p.variableCost)}
                            </td>
                            <td
                              className={`py-3 px-4 text-xs font-semibold tabular-nums ${
                                isLoss ? 'text-[#ef4444]' : 'text-[#a78bfa]'
                              }`}
                            >
                              {fmt(p.contributionMargin)}
                            </td>
                            <td
                              className={`py-3 px-4 text-xs font-medium ${
                                p.contributionPct >= 30
                                  ? 'text-[#10b981]'
                                  : p.contributionPct >= 15
                                  ? 'text-[#f59e0b]'
                                  : 'text-[#ef4444]'
                              }`}
                            >
                              {p.contributionPct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-[#f0f0f5] text-xs font-semibold tabular-nums">
                              {isFinite(p.unitsToBreakEven) ? `${p.unitsToBreakEven} un` : 'prejuizo'}
                            </td>
                            {profitGoal > 0 && (
                              <td className="py-3 px-4 last:pr-5 text-[#10b981] text-xs font-semibold tabular-nums">
                                {isFinite(p.unitsToReachGoal) ? `${p.unitsToReachGoal} un` : '---'}
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Educational footer */}
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 text-xs text-[#666666] space-y-2">
                <p>
                  <strong className="text-[#888888]">Formulas usadas:</strong>
                </p>
                <p>
                  <span className="text-[#a78bfa]">Margem de Contribuicao</span> = Preco de Venda
                  menos Custo Variavel (filamento + energia + falha)
                </p>
                <p>
                  <span className="text-[#a78bfa]">Ponto de Equilibrio (un.)</span> = Custo Fixo
                  dividido por MC Unitaria
                </p>
                <p>
                  <span className="text-[#a78bfa]">Meta (un.)</span> = (Custo Fixo + Lucro
                  Desejado) dividido por MC Unitaria
                </p>
                <p className="pt-1 text-[#555555]">
                  Custos fixos e meta agora ficam salvos no banco por projeto. Trocar de
                  browser/dispositivo nao perde os dados.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
