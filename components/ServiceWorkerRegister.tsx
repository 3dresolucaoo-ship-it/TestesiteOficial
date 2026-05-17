'use client'

import { useEffect } from 'react'

/**
 * Registra o Service Worker no client após hidratação.
 *
 * Roda 1x por sessão de navegador. Browser cuida de updates automaticamente
 * (download em background, ativa no próximo navegação ou via skipWaiting()).
 *
 * Por que client-side (não SSR)?
 *   - `navigator.serviceWorker` só existe no browser.
 *   - SW precisa do contexto window/navigator.
 *
 * Criado em 2026-05-16 — Frente 4 (PWA setup).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Bail se browser não suporta (Safari iOS < 16, alguns enterprise)
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Bail em dev pra não confundir HMR
    if (process.env.NODE_ENV !== 'production') return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        // Listener pra detectar atualização disponível
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              // Versão nova disponível — vai ativar na próxima navegação
              console.info('[Hayzer SW] versão nova instalada, ativa na próxima navegação')
            }
          })
        })
      } catch (err) {
        console.warn('[Hayzer SW] falha ao registrar:', err)
      }
    }

    // Registra após page load completo pra não competir com critical path
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
