/**
 * Hayzer — Service Worker simples
 *
 * Estratégia (2026-06-04, v2 pós-bug crítico):
 *   - Network-first pra HTML E assets estáticos (sempre tenta fresh, cache só
 *     como fallback offline). MUDOU de cache-first pra assets pra evitar o bug
 *     descoberto 04/06: SW servindo JS bundle cacheado antigo de versões mais
 *     antigas, framer-motion travado em prod target. Ver memoria
 *     [[hayzer-framer-motion-prod-stuck]] + session 2026-06-04-madrugada-hotfix.
 *   - Bypass total pra /api/* e /mockups/* (nunca cachear — dados dinâmicos)
 *
 * Sem dependências externas. Sem Workbox. Sem next-pwa.
 *
 * Versionamento: bump CACHE_VERSION sempre que mudar o SW pra forçar update.
 *
 * Criado em 2026-05-16 — Frente 4 (PWA setup).
 * v2 em 2026-06-04 — fix bug landing em branco em prod.
 */

const CACHE_VERSION = 'hayzer-v2-2026-06-04'
const OFFLINE_FALLBACK = '/offline.html'

// Shell mínima que faz sentido cachear no install
const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon',
  '/apple-icon',
]

// Install — pré-cacheia shell + offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION)
      try {
        await cache.addAll(SHELL_ASSETS)
      } catch (err) {
        // Não bloqueia instalação se algum asset falhar (graceful)
        console.warn('[sw] addAll falhou:', err)
      }
      // Ativa SW novo imediatamente sem esperar tabs antigas fecharem
      self.skipWaiting()
    })()
  )
})

// Activate — limpa caches de versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
      // Toma controle de tabs já abertas
      await self.clients.claim()
    })()
  )
})

// Fetch — estratégia por tipo
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Só GET (POSTs e mutations sempre online)
  if (request.method !== 'GET') return

  // Cross-origin (Google Fonts, CDNs) — deixa o browser lidar
  if (url.origin !== location.origin) return

  // Bypass: nunca cachear rotas dinâmicas/privadas
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/mockups') ||
    url.pathname.startsWith('/admin')
  ) {
    return
  }

  // HTML — network-first com fallback offline
  const isHtmlRequest =
    request.headers.get('accept')?.includes('text/html') ?? false

  if (isHtmlRequest) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          // Atualiza cache em background sem bloquear resposta
          const cache = await caches.open(CACHE_VERSION)
          cache.put(request, fresh.clone()).catch(() => {})
          return fresh
        } catch {
          // Offline — tenta cache, depois offline fallback
          const cached = await caches.match(request)
          if (cached) return cached
          const fallback = await caches.match(OFFLINE_FALLBACK)
          if (fallback) return fallback
          return new Response('Offline', { status: 503 })
        }
      })()
    )
    return
  }

  // Assets estáticos — NETWORK-FIRST (mudou em 04/06).
  // Antes era cache-first, mas SW estava servindo JS chunks cacheados de
  // versões antigas, congelando framer-motion. Agora sempre tenta fresh
  // primeiro; cache so como fallback offline.
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request)
        if (fresh.ok && fresh.type === 'basic') {
          const cache = await caches.open(CACHE_VERSION)
          cache.put(request, fresh.clone()).catch(() => {})
        }
        return fresh
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        return new Response('Offline', { status: 503 })
      }
    })()
  )
})
