/**
 * Break-Even Engine — cálculo de ponto de equilíbrio, margem de contribuição e metas.
 *
 * Fórmulas:
 *   MC unitária    = Preço de Venda − Custo Variável Unitário
 *   MC %           = (MC / Preço) × 100
 *   PE_unidades    = Custo Fixo / MC unitária
 *   PE_reais       = Custo Fixo / (MC % / 100)
 *   Meta_unidades  = (Custo Fixo + Lucro Desejado) / MC unitária
 *
 * Funções stateless. Sem dependência de React, Supabase ou DB.
 */

import type { Product } from '@/core/products/types'
import type { InventoryItem } from '@/core/inventory/types'
import type { Transaction } from './types'
import { calcUnitCost } from '@/core/analytics/productionEngine'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductBreakEven {
  productId:          string
  productName:        string
  salePrice:          number
  variableCost:       number
  contributionMargin: number      // R$ por unidade
  contributionPct:    number      // % (0-100)
  unitsToBreakEven:   number      // arredondado pra cima
  unitsToReachGoal:   number      // arredondado pra cima (com lucro desejado)
}

export interface BreakEvenSummary {
  /** Custo fixo total mensal informado pelo usuário (R$) */
  fixedCost:           number
  /** Lucro desejado pelo usuário pra meta (R$) */
  profitGoal:          number
  /** MC% média ponderada por preço dos produtos (%) */
  avgContributionPct:  number
  /** Quanto vender em R$ pra cobrir custo fixo (lucro zero) */
  breakEvenRevenue:    number
  /** Quanto vender em R$ pra atingir lucro desejado */
  goalRevenue:         number
  /** Receita do mês atual (R$) — pra mostrar progresso */
  currentMonthRevenue: number
  /** Progresso atual em direção ao break-even (0-100+) */
  breakEvenProgress:   number
  /** Progresso atual em direção à meta (0-100+) */
  goalProgress:        number
  /** Por produto */
  products:            ProductBreakEven[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Custo variável de uma unidade do produto (filamento + energia + falha + suporte). */
function calcVariableCost(product: Product, inventory: InventoryItem[]): number {
  if (product.materialGrams <= 0 && product.printTimeHours <= 0) {
    // Produto sem dados de impressão — não dá pra inferir custo variável
    return 0
  }
  return calcUnitCost(product, inventory).totalCost
}

/** Receita do mês corrente a partir das transactions. */
function currentMonthRevenueFrom(transactions: Transaction[]): number {
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  return transactions
    .filter(t => t.type === 'income' && t.date.startsWith(month))
    .reduce((s, t) => s + Number(t.value), 0)
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Calcula break-even por produto.
 * Produtos sem MC positiva (preço <= custo) são incluídos com `unitsToBreakEven = Infinity`
 * pra deixar visível no UI que esse produto está no prejuízo unitário.
 */
export function calcProductBreakEven(
  product:      Product,
  inventory:    InventoryItem[],
  fixedCost:    number,
  profitGoal:   number,
): ProductBreakEven {
  const variableCost       = calcVariableCost(product, inventory)
  const contributionMargin = product.salePrice - variableCost
  const contributionPct    = product.salePrice > 0
    ? (contributionMargin / product.salePrice) * 100
    : 0

  const unitsToBreakEven = contributionMargin > 0
    ? Math.ceil(fixedCost / contributionMargin)
    : Infinity

  const unitsToReachGoal = contributionMargin > 0
    ? Math.ceil((fixedCost + profitGoal) / contributionMargin)
    : Infinity

  return {
    productId:          product.id,
    productName:        product.name,
    salePrice:          product.salePrice,
    variableCost,
    contributionMargin,
    contributionPct,
    unitsToBreakEven,
    unitsToReachGoal,
  }
}

/**
 * Calcula o resumo global de break-even.
 *
 * @param products       Produtos cadastrados (template de impressão)
 * @param inventory      Itens de estoque (filamento) — usado pro custo variável
 * @param transactions   Transactions financeiras — usado pra receita do mês
 * @param fixedCost      Custo fixo mensal total (R$)
 * @param profitGoal     Lucro desejado pra meta (R$)
 */
export function calcBreakEvenSummary(
  products:      Product[],
  inventory:     InventoryItem[],
  transactions:  Transaction[],
  fixedCost:     number,
  profitGoal:    number,
): BreakEvenSummary {
  const productBreakEvens = products
    .filter(p => p.salePrice > 0)
    .map(p => calcProductBreakEven(p, inventory, fixedCost, profitGoal))

  // MC% média ponderada por preço (cada produto contribui proporcional ao seu preço)
  const totalSalePrice = productBreakEvens.reduce((s, p) => s + p.salePrice, 0)
  const avgContributionPct = totalSalePrice > 0
    ? productBreakEvens.reduce((s, p) => s + p.contributionPct * p.salePrice, 0) / totalSalePrice
    : 0

  const breakEvenRevenue = avgContributionPct > 0
    ? fixedCost / (avgContributionPct / 100)
    : 0

  const goalRevenue = avgContributionPct > 0
    ? (fixedCost + profitGoal) / (avgContributionPct / 100)
    : 0

  const currentMonthRevenue = currentMonthRevenueFrom(transactions)

  const breakEvenProgress = breakEvenRevenue > 0
    ? (currentMonthRevenue / breakEvenRevenue) * 100
    : 0

  const goalProgress = goalRevenue > 0
    ? (currentMonthRevenue / goalRevenue) * 100
    : 0

  return {
    fixedCost,
    profitGoal,
    avgContributionPct,
    breakEvenRevenue,
    goalRevenue,
    currentMonthRevenue,
    breakEvenProgress,
    goalProgress,
    products: productBreakEvens,
  }
}

/**
 * Sugere preço de venda dado custo + margem desejada.
 * Útil pra "calculadora de precificação" futura.
 */
export function suggestSalePrice(
  variableCost:    number,
  fixedCostShare:  number,    // parcela do custo fixo alocada a esse produto (R$/un)
  desiredMarginPct: number,   // ex: 0.30 = 30%
): number {
  const totalCost = variableCost + fixedCostShare
  return totalCost * (1 + desiredMarginPct)
}
