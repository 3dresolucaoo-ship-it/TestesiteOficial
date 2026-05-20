'use client'

/**
 * V4ThemeProvider.tsx — Aplica data-theme no <html> para rotas fora do DashboardLayout.
 *
 * Problema: globals-v4.css escopa tokens sob :root[data-theme="dark"].
 * Apenas /dashboard seta esse atributo (via DashboardLayout.useEffect).
 * Nas rotas /orders /crm /finance /production o ModuleShell fica sem tokens,
 * virando texto plano.
 *
 * Solucao: montar este componente no topo de cada page migrada. Ele le o
 * localStorage e aplica o atributo. Guard evita conflito com DashboardLayout
 * quando ambos rodarem na mesma sessao de navegacao.
 *
 * Renderiza null — zero JSX, zero custo visual.
 */

import { useEffect } from 'react'

export function V4ThemeProvider() {
  useEffect(() => {
    // Guard: se DashboardLayout ja setou, nao sobrescreve.
    if (document.documentElement.hasAttribute('data-theme')) return

    const stored = localStorage.getItem('hayzer-theme')
    const theme  = stored === 'light' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return null
}
