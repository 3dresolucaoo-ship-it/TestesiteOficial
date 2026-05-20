/**
 * helpers.ts — utilitários de formatação compartilhados entre componentes de produtos.
 *
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

/** Formata número como moeda BRL. Ex: 12.5 → "R$ 12,50" */
export function fmt(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Formata número como porcentagem com 1 casa decimal. Ex: 34.5 → "34.5%" */
export function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`
}

/** Arredonda para 2 casas decimais. */
export function r2(v: number): number {
  return Math.round(v * 100) / 100
}
