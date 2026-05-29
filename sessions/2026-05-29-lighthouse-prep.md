# Lighthouse Prep -- Bloco 3

> Gerado por: Ana (Analytics) . 2026-05-29
> Contexto: pre-launch 13/06 . versao prod confirmada . TBT baseline 3.6s (landing, audit 21/05)
> Protocolo base: audits/lighthouse/protocolo-2026-05-21.md

---

## Status prod (verificado 29/05)

| Item | Resultado |
|---|---|
| hayzer.com.br HTTP status | 200 OK |
| Tempo de resposta HEAD (curl) | 3.1s (cold, sem cache) |
| SSL | OK (Vercel) |
| URL preview ember | INVALIDA -- DNS nao resolve (curl 000). Hipoteses: (1) branch sem push recente disparando preview build; (2) projeto renomeado no Vercel (bvaz-hub > hayzer) e slug mudou. Verificar: Vercel dashboard > Deployments > filtrar branch feature/ember-destaque-fotos-reais. |

---

## 10 rotas para auditar

| N | Rota | URL completa | Prioridade | Tipo |
|---|---|---|---|---|
| 1 | / | https://hayzer.com.br/ | P0 | Publica |
| 2 | /calculadora | https://hayzer.com.br/calculadora | P0 | Publica |
| 3 | /orders | https://hayzer.com.br/orders | P1 | Autenticada |
| 4 | /products | https://hayzer.com.br/products | P1 | Autenticada |
| 5 | /customers | https://hayzer.com.br/customers | P1 | Autenticada |
| 6 | /crm | https://hayzer.com.br/crm | P1 | Autenticada |
| 7 | /finance | https://hayzer.com.br/finance | P2 | Autenticada |
| 8 | /inventory | https://hayzer.com.br/inventory | P2 | Autenticada |
| 9 | /production | https://hayzer.com.br/production | P2 | Autenticada |
| 10 | /settings | https://hayzer.com.br/settings | P3 | Autenticada |

---

## Metas por tipo de rota

### Publicas (/ e /calculadora)

| Metrica | Alvo Good | Limite OK | Critico |
|---|---|---|---|
| TBT | < 300ms | < 600ms | > 600ms (bloqueia deploy) |
| LCP | < 2.5s | < 4.0s | > 4.0s |
| CLS | < 0.10 | < 0.25 | > 0.25 |
| FCP | < 1.8s | < 3.0s | > 3.0s |
| Score Lighthouse mobile | > 90 | > 75 | < 75 |

Baseline atual /: TBT 3.6s medido (audit 21/05).
Alvo Bloco 3: TBT landing < 2.5s (reducao minima 30%). Score > 75 em todas as rotas internas.

### Autenticadas internas

| Metrica | Alvo Good | Limite OK | Investigar |
|---|---|---|---|
| TBT | < 400ms | < 800ms | > 800ms (ticket Bruna) |
| LCP | < 3.0s | < 5.0s | > 5.0s |
| CLS | < 0.10 | < 0.25 | > 0.25 |
| Score Lighthouse mobile | > 75 | > 60 | < 60 |

---

## Prerequisitos antes de rodar

### 1. Instalar Lighthouse CLI (se nao instalado)

    npm install -g lighthouse
    lighthouse --version

### 2. Cookie de sessao (rotas autenticadas)

Rotas autenticadas redirecionam para /login sem sessao valida.

1. Login em hayzer.com.br no Chrome
2. DevTools (F12) > Application > Cookies > hayzer.com.br
3. Copiar o par sb-*-auth-token (nome completo + valor)
4. Criar .env.lighthouse.local na raiz (nao commitar -- ja em .gitignore):

    LIGHTHOUSE_SESSION_COOKIE=sb-<ref>-auth-token=<valor-devtools>

JWT expira em ~1h. Renovar antes de cada rodada completa.

---

## Comando CEO para rodar tudo

Na pasta raiz do hayzer (PowerShell):

    .\audits\lighthouse-runner.ps1

Para apenas rotas publicas (sem cookie):

    .\audits\lighthouse-runner.ps1 -PublicOnly

JSONs salvos em: audits/lighthouse/runs/<timestamp>-<rota>.json

---

## Comandos individuais por rota (referencia)

Flags mobile BR realista (padrao em todas as medicoes):
    --form-factor=mobile
    --throttling-method=simulate
    --throttling.rttMs=40
    --throttling.throughputKbps=10240
    --throttling.cpuSlowdownMultiplier=4
    --output=json

### / (publica)
npx lighthouse https://hayzer.com.br/ --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-root.json --chrome-flags=--headless

### /calculadora (publica)
npx lighthouse https://hayzer.com.br/calculadora --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-calculadora.json --chrome-flags=--headless

### /orders (autenticada -- substituir SEU_COOKIE_AQUI)
npx lighthouse https://hayzer.com.br/orders --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-orders.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /products (autenticada)
npx lighthouse https://hayzer.com.br/products --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-products.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /customers (autenticada)
npx lighthouse https://hayzer.com.br/customers --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-customers.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /crm (autenticada)
npx lighthouse https://hayzer.com.br/crm --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-crm.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /finance (autenticada)
npx lighthouse https://hayzer.com.br/finance --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-finance.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /inventory (autenticada)
npx lighthouse https://hayzer.com.br/inventory --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-inventory.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /production (autenticada)
npx lighthouse https://hayzer.com.br/production --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-production.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

### /settings (autenticada)
npx lighthouse https://hayzer.com.br/settings --form-factor=mobile --throttling-method=simulate --throttling.rttMs=40 --throttling.throughputKbps=10240 --throttling.cpuSlowdownMultiplier=4 --output=json --output-path=audits/lighthouse/runs/lighthouse-settings.json --extra-headers={Cookie:SEU_COOKIE_AQUI} --chrome-flags=--headless

NOTA: no runner.ps1 os headers sao injetados corretamente com aspas. Os comandos acima omitem aspas
para compatibilidade de copia no terminal -- use o script .ps1 para rodada completa.

---

## Output esperado dos JSONs

Campos que Ana le para montar tabela pos-rodada:

| Campo JSON | Metrica | Unidade |
|---|---|---|
| categories.performance.score | Score Lighthouse | 0-1 (x100 = score) |
| audits.total-blocking-time.numericValue | TBT | ms |
| audits.largest-contentful-paint.numericValue | LCP | ms |
| audits.cumulative-layout-shift.numericValue | CLS | decimal |
| audits.first-contentful-paint.numericValue | FCP | ms |

Pos-rodada: mandar os 10 JSONs pra Ana. Ela entrega tabela + insight + acao.
