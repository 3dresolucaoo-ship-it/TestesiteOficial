# ADR 033 — Bug landing em branco em prod: Service Worker servindo cache stale

**Data**: 2026-06-04
**Status**: Aceito (fix em deploy)
**Autor**: Claude Opus 4.7 + CEO

## Contexto

Em 03-04/06/2026, durante sessão de burndown de débitos pré soft-launch 13/06, foi descoberto que a landing pública (`hayzer.com.br/`) estava **renderizando em branco** em produção. Apenas o header aparecia; sections do hero, features, CTA, etc. ficavam invisíveis.

### Diagnóstico inicial (via Chrome MCP)

- DOM tinha 10 sections, h1 "Seu negócio, sem caos" presente
- `getComputedStyle(h1).opacity === '0'` (framer-motion initial state congelado)
- Inline style: `opacity:0;transform:translateY(12px)` (motion.div initial)
- Forçando `opacity:1` via JS → conteúdo aparece (textLen 14 → 4561, scrollHeight 686 → 10850)
- **Testado em 4 production SHAs** (`c3b5171`, `9ab096f`, `17c3632`, `17d0829`): todos bugados
- **Mesmos SHAs em preview deploys** (`bvaz-hub-git-*-vercel.app`): funcionam perfeito
- Console: zero erros JS, apenas warning `[Hayzer SW] falha ao registrar` (irrelevante)

### Falsa hipótese: framer-motion não anima em prod target

Inicialmente diagnosticado como bug de framer-motion `animate` não disparando em production target. Aplicado **hotfix CSS** (commits `220fd5f` v1 + `94b1849` v2) com `!important` em `globals.css` mascarando o sintoma.

### Root cause real

`navigator.serviceWorker.controller` revelou **Service Worker ativo em hayzer.com.br** com cache `hayzer-v1-2026-05-16` — versão de **3 semanas atrás**.

```js
// public/sw.js (versão antiga, linha 108-123)
event.respondWith((async () => {
  const cached = await caches.match(request)
  if (cached) return cached    // ← serve cache stale
  // ...fetch fresh only on cache miss
})())
```

A estratégia **cache-first em assets estáticos** servia JS chunks cacheados de versões antigas (ex: `_next/static/chunks/0c07l24tbk5q4.js`), mesmo após deploy novo gerar chunks com hash diferente. O HTML servia network-first (sempre fresh, referenciando chunks novos), MAS o SW interceptava as requests dos chunks novos e às vezes encontrava match em cache (URL antiga ainda cachada), servindo bytecode JS antigo onde framer-motion estava num estado quebrado ou inicializava de forma diferente.

Mais grave: o **arquivo `sw.js` em si não mudava** entre deploys (mesmo conteúdo, mesmos bytes). Browsers só detectam SW novo quando o byte-conteúdo do sw.js muda. Logo o SW antigo persistia indefinidamente em todos os browsers que visitaram hayzer.com.br desde 16/05.

**Por que preview funcionava**: cada preview deploy do Vercel é um origin diferente (`bvaz-hub-git-*.vercel.app`). Service Workers são scope-bound por origin. Preview origins nunca tiveram SW registrado, logo serviam diretamente do Vercel CDN sempre fresh.

### Validação do diagnóstico

Via Chrome MCP em `hayzer.com.br/`:

```js
await navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
await caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
location.reload()
```

Resultado: landing renderizou perfeito sem hotfix CSS. ROOT CAUSE confirmado.

## Decisão

Fix em duas camadas:

### Camada 1: bump CACHE_VERSION (browsers detectam SW novo)

```diff
- const CACHE_VERSION = 'hayzer-v1-2026-05-16'
+ const CACHE_VERSION = 'hayzer-v2-2026-06-04'
```

Byte-diff do sw.js faz browsers detectarem SW novo na próxima navegação. O handler `activate` já limpava caches antigos (`k !== CACHE_VERSION`).

### Camada 2: network-first em todos assets

```diff
- // Assets estáticos — cache-first
- event.respondWith((async () => {
-   const cached = await caches.match(request)
-   if (cached) return cached
-   // ...fresh on miss
- })())
+ // Assets estáticos — NETWORK-FIRST
+ event.respondWith((async () => {
+   try {
+     const fresh = await fetch(request)
+     if (fresh.ok && fresh.type === 'basic') {
+       const cache = await caches.open(CACHE_VERSION)
+       cache.put(request, fresh.clone()).catch(() => {})
+     }
+     return fresh
+   } catch {
+     const cached = await caches.match(request)
+     if (cached) return cached
+     return new Response('Offline', { status: 503 })
+   }
+ })())
```

Sempre tenta fresh primeiro; cache só como fallback offline. Mesma estratégia já usada pra HTML.

### Camada 3: hotfix CSS mantido (transitório)

O hotfix CSS `!important` em `globals.css` (commit `94b1849`) é mantido **temporariamente** até confirmar que o SW v2 propagou pra todos os users que já visitaram o site. Browsers verificam SW updates apenas em navegação — usuários que não voltam continuam com SW antigo até a próxima visita.

**Remoção do hotfix CSS**: prevista pra sessão futura (>7 dias após este deploy) quando dashboard analytics confirmar zero usuários com SW v1 ativo.

## Trade-offs aceitos

**Prós:**
- Root cause resolvido (não maquiagem)
- Network-first em assets garante que deploys novos sempre chegam imediatos
- Activate handler limpa caches antigos automaticamente
- Hotfix CSS pode ser removido futuramente, recuperando animação de entrada do Hero

**Contras:**
- Network-first em assets aumenta latência percebida em conexões lentas (paga round-trip a cada asset). Mitigação: HTTP cache headers do Vercel CDN já cobrem (Vercel serve com `Cache-Control: public, max-age=31536000, immutable` em chunks Next.js).
- Usuários offline com primeiro acesso perdem assets — fallback responde 503. Aceitável: SW objetivo é PWA-installable, não offline-first.

## Alternativas consideradas

1. **Remover SW completamente**: descartado. PWA installable continua sendo objetivo. SW v2 corrigido é melhor que zero SW.
2. **Bump version sem mudar fetch strategy**: descartado. Mesmo com cache cleanup no activate, próximo asset cache-first poderia repetir o bug se algum chunk antigo for cacheado por engano.
3. **Implementar background sync de cache invalidation**: over-engineering pra MVP. Network-first resolve.

## Aprendizados

1. **Sempre versionar SW por byte-diff**, não só por constante interna. Próxima vez que mudar SW, garantir que o arquivo bytes mudem (não só comentário).
2. **Cache-first em assets com hash é traiçoeiro**. Hash garante URL única, mas browser ainda usa SW como intermediário. Network-first é mais previsível.
3. **Bug em prod target mas preview funciona = diff de origin/ambiente**, não de código. Olhar SW, cookies, env vars antes de assumir regressão de commit.
4. **Validação prod deve incluir viewport pública deslogada** em cada deploy. Esse bug ficou 24h+ no ar porque eu só validava /dashboard logado. Lição registrada em [[feedback-validar-viewport-publica-toda-sessao]].
5. **Hotfix mascara, root cause resolve.** Inicial 30min em CSS `!important` foi necessário (urgência: prod em branco), mas só foi a metade do trabalho. Investigar profundo no /rcs imediato foi crítico.

## Refs

- Memória: [[hayzer-framer-motion-prod-stuck]]
- Memória: [[feedback-validar-viewport-publica-toda-sessao]]
- Session: `sessions/2026-06-04-madrugada-hotfix-landing-prod.md`
- Commits envolvidos: `220fd5f` (hotfix CSS v1), `94b1849` (hotfix CSS v2), `31a1439` (fix SW root cause)
