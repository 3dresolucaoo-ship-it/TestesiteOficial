---
description: "Valida configuração PWA do BVaz Hub: manifest.json, service worker, ícones, Lighthouse PWA score. Use após configurar PWA na semana 6 ou ao mudar shell do app."
allowed-tools: Task, Read, Glob, Grep, Bash
---

# /pwa:test — Auditoria PWA

Valida que o BVaz Hub está corretamente configurado como Progressive Web App.

## Fluxo

### 1. Felipe — Verifica config PWA
Chama **felipe-frontend** com brief:
"Verifica configuração PWA do projeto BVaz.

Cheque cada item:

### Manifest (public/manifest.json ou app/manifest.ts)
- [ ] `name`: 'BVaz Hub'
- [ ] `short_name`: até 12 chars
- [ ] `description`
- [ ] `start_url`: '/'
- [ ] `display`: 'standalone' (sem barra do navegador)
- [ ] `theme_color`: combina com brand
- [ ] `background_color`
- [ ] `orientation`: 'portrait-primary' (mobile)
- [ ] `icons`: pelo menos 192x192 e 512x512 (maskable)
- [ ] `lang`: 'pt-BR'

### Service Worker
- [ ] SW registrado em `app/layout.tsx` ou similar
- [ ] Estratégia de cache definida (network-first pra API, cache-first pra assets)
- [ ] Offline fallback page existe (app/offline/page.tsx)
- [ ] Versionamento de cache funciona (sw evolui sem quebrar)

### Ícones
- [ ] 192x192 (mínimo)
- [ ] 512x512 (recomendado)
- [ ] Maskable (com safe area)
- [ ] favicon.ico
- [ ] apple-touch-icon (iOS)

### Meta tags
- [ ] viewport meta tag
- [ ] theme-color meta tag
- [ ] apple-mobile-web-app-capable
- [ ] apple-mobile-web-app-title

### Instalação
- [ ] Banner de instalação aparece (manualmente: Chrome menu → Instalar)
- [ ] Funciona em Chrome (Android + Desktop)
- [ ] Funciona em Safari iOS 16.4+ (Add to Home Screen)

Liste arquivos relevantes e o status de cada item."

### 2. Júlia — Teste manual
Chama **julia-qa** com brief:
"Teste manualmente o PWA do BVaz:

1. Abrir em Chrome desktop:
   - F12 → Lighthouse → PWA audit
   - Score esperado: ≥90

2. Abrir em mobile (Chrome Android):
   - Menu → Add to Home Screen aparece?
   - Ícone na tela inicial corresponde?
   - Abre sem barra do navegador (display: standalone)?

3. Teste offline:
   - DevTools → Application → Service Workers → Offline
   - Página carrega cache?
   - Mostra fallback decente?

Reporta resultados."

## Saída final
```
## PWA Audit — BVaz Hub

### Manifest
- ✅ name, short_name, description
- ✅ start_url, display, theme_color
- 🟡 icons: falta 512x512 maskable
- ✅ lang: pt-BR

### Service Worker
- ✅ Registrado
- 🟡 Falta offline fallback

### Ícones
<status>

### Meta tags
<status>

### Lighthouse PWA Score
<score>/100

### Teste mobile
<reproduções e resultados>

### 🚦 Veredito
- 🟢 PWA pronto pra produção
- 🟡 Funciona mas tem melhorias
- 🔴 Não tá funcionando — ações:

### Próximas ações
1. <ação>
```
