# Status Semanal — 2026-W23

> **Sexta 05/06/2026 17h BRT**
> Preparado por: Helena (Diretora de Estratégia G7)
> **8 dias pro soft launch (13/06)** · 22 dias pro launch público (27/06)
> Pilar médio atual: **8.0/10** · Meta 30d: 8.5

---

## 1. Progresso da semana (01-05/06)

### Volume

50 commits em 5 dias. Maior densidade de commits do projeto até agora. Quase toda a equipe técnica em modo burndown.

### Semana 4 do ROADMAP (03-09/06) — 0 de 5 itens entregues

O roadmap previa começar `/customers` esta semana. Não aconteceu. A equipe priorizou débitos técnicos pré-launch em vez do roadmap de feature, o que foi a decisão correta dado ADR-029 ("soltar o que ficar pronto"). `/customers` vai pra Bloco 5 ou pós-launch.

### O que foi entregue (classificado)

#### Features novas (18 commits)
| Commit | Entrega | Impacto |
|---|---|---|
| `7a21b82/2bc8f9e/0e81da4/871c70f` | Server Actions writes: inventory/finance/production/products | Todos os CRUDs críticos via cookie-based auth — workaround estrutural pro bug auth-js |
| `d48f462` | CRUD completo Server Actions leads e pedidos (UPDATE/DELETE) | Fecha golden path #1 completamente |
| `9164f8a` | Drag-and-drop kanban no CRM (@dnd-kit) | UX + Server Action updateLeadStatus |
| `4a74a74` | SSR initialState puxa 5 core (ADR 030 Onda A) | F5 não some mais dados — era regression visível |
| `acf4cb1` | Email sequence D+1/D+3/D+7 + cron Vercel | Retenção mínima pós-cadastro |
| `a77c19b` | Reset password + signup público | Fluxo auth completo para makers |
| `b7ed1f7` | OG image dinâmica `/catalogo/[slug]` | Share bonito no WhatsApp/Instagram |
| `da28881` | Skeleton V4 em 6 rotas (inventory/products/production/decisions/content/settings) | Percepção de performance |
| `17c3632` | withSentryConfig aplicado + /api/sentry-test | Error tracking ativo em código |
| `8a8abc3/72387b4` | /decisions e /content migrados pra ModuleShell V4 | Últimas 2 rotas legacy eliminadas |
| `02a0087` | ProductEmptyState com 3 variantes | Empty state faltante em /products |
| `7a1eae2` | PostHog event supabase_sync_error | Observabilidade de rollback |

#### Bugs corrigidos (14 commits)
| Commit | Bug | Gravidade |
|---|---|---|
| `cbefed7/89d2f71` | auth boot non-blocking: getSession local first, revalida em background | P0 — unblocks app load |
| `386ceb6` | golden path WRITES destravados via Server Actions | P0 |
| `94b1849/220fd5f` | Landing em branco em prod (framer-motion stuck) — hotfix CSS | P0 prod |
| `31a1439` | SW: bump CACHE_VERSION + network-first em assets (root cause parcial — ver alertas) | P0 |
| `985966b` | KPIs mobile espremidas em 4 colunas (inline style sobrescrevia media queries) | P1 mobile |
| `c0959ec/ec9f7ea` | Timeout hydration 15s→3s (splash eterno eliminado) | P1 |
| `743ceaf` | CRM handleAdvance via Server Action (botão "Avançar" também) | P1 |
| `c3b5171` | Dashboard usa createServerClient direto (resolves "??" no V4Shell) | P2 |
| `7375c80` | /api/cron público pra Vercel Cron funcionar | P1 |

#### Docs/Decisões (6 commits)
- ADR 032: débitos Bloco 5 consolidados
- ADR 033: root cause + catch-22 do Service Worker
- CLAUDE.md raiz atualizado com status 03/06
- Commit `17d0829`: datas de lançamento removidas do conteúdo público (decisão correta — data muda, copy não deve)

#### Infra/chore (3 commits)
- Pin `@supabase/supabase-js` 2.106.0 exato
- Monitoring error-scan 05/06
- `c54ef0a`: error-scan rodou (sinal de que VERCEL_API_TOKEN está funcionando hoje — mas issue #23 continua aberta)

---

## 2. Pilares — estado atual

| Pilar | Score | Status semana |
|---|---|---|
| Design (UI/UX) | 9.0 | Estável |
| Anti-IA | 9.3 | Estável |
| Segurança | 9.3 | Sentry integrado (+infra) |
| Performance | 7.5 | Non-blocking auth boot melhora LCP percebido |
| Acessibilidade | 7.0 | Sem commits específicos esta semana |
| Mobile | 7.5 | Fix KPIs mobile; QA real ainda zero |
| Conversão | 6.8 | Email sequence entregue; funil real não medido |
| **Retenção** | **5.5** | **ALERTA — 2+ semanas sem ação concreta em prod** |
| Pagamento | 8.5 | Server Actions cobrem todos os CRUDs |
| Documentação | 8.5 | ADRs 032/033 completos |
| Backend | 8.0 | Server Actions migration concluída |
| Estratégia | 8.3 | Estável |

Pilar abaixo de 6.0: **Retenção**. Email D+1/D+3/D+7 entregue em código esta semana — se o cron disparar corretamente pós-soft launch, isso destranca o início da subida. Score só sobe quando houver maker real recebendo email.

---

## 3. Blockers

### B1 — Service Worker catch-22 (CRÍTICO — prod afeta usuários existentes)
**O que**: SW v1 (desde 16/05) cachou o próprio `sw.js`. Commit `31a1439` com SW v2 está no CDN, mas ZERO usuário que visitou hayzer.com.br desde 16/05 vai receber o update automaticamente. Landing pode aparecer em branco pra esses usuários.
**Mitigação atual**: hotfix CSS `!important` (commit `94b1849`) garante que a landing renderiza mesmo com SW v1 ativo. Defesa real.
**O que falta**: Camada B do ADR-033 — renomear `public/sw.js` para `public/sw-v2.js` + atualizar `ServiceWorkerRegister.tsx`. Decisão: atacar antes ou após soft launch?
**Impacto**: se soft launch trouxer makers que já visitaram o site antes (de campanhas do CEO), eles podem ver landing em branco. Com hotfix CSS isso não acontece — mas o hotfix remove a animação de entrada do Hero.

### B2 — Auth getSession 20s (P0 — parcialmente resolvido)
**O que**: `[Auth] getSession timed out — unblocking UI` aparecia 5x antes da hidratação (confirmado 03/06 via Chrome MCP). Commits `cbefed7/89d2f71` implementaram non-blocking boot (getSession local first + revalida em background).
**Status atual**: workaround estrutural aplicado. Non-blocking elimina o travamento visível. O timeout de 20s na revalidação em background ainda ocorre, mas sem bloquear UI.
**Risco residual**: se `getUser` em background falhar e invalidar sessão válida, user é deslogado indevidamente. `cbefed7` trata isso (só derruba em 401/403, mantém sessão local em erro transiente).
**Bloqueador real restante**: Lighthouse em rotas internas ainda não foi feito (CEO precisa extrair `LIGHTHOUSE_SESSION_COOKIE`).

### B3 — VERCEL_API_TOKEN (14 dias, issue #23)
**O que**: token ausente ou expirado desde 22/05. Error scan falhou por 14 dias consecutivos. Error scan de 05/06 rodou (commit `c54ef0a` existe) — verificar se produziu arquivo válido ou reportou erro novamente.
**Ação**: CEO renova token em vercel.com/account/tokens (10 min).

### B4 — QA mobile real: zero (CRÍTICO pré-soft launch)
**O que**: nenhum teste em device físico foi feito nos 14 módulos V4. ADR-032 confirmou que Chrome MCP NÃO emula mobile. CEO precisa fazer pessoalmente no iPhone + Android.
**Deadline**: antes de 13/06 (8 dias).
**Risco**: makers beta acessando no celular encontram bugs que o CEO não viu.

### B5 — Stripe Connect sandbox não testado (CRÍTICO pré-soft launch)
**O que**: Stripe Connect implementado, mas CEO ainda não validou o fluxo em sandbox. É o bloqueador do bloco de pagamento pra makers beta.
**Ação**: CEO executa fluxo "Conectar com Stripe" em Settings → sandbox. Estimativa: 20-30 min.

### B6 — INPI GRU R$ 880: deadline 13/06 (8 dias)
**O que**: pagamento das GRUs classe 35+42 vence em 13/06. `decisions/pending-inpi-busca-profunda-pre-pagamento.md` lista checklist de reverificação que o CEO pediu antes de pagar.
**Ação imediata**: convocar external-researcher pra reverificação pePI (45-60 min) + CEO bate o PIX se OK. Não dá pra adiar.

---

## 4. Plano próxima semana (06-12/06)

Foco único: **soft launch em 13/06 funcional e sem P0 em prod**.

1. **CEO faz QA mobile hoje/amanhã** — iPhone + Android, rotas: /dashboard /crm /orders /production /inventory /finance. Reportar bugs no thread do WhatsApp Beta.
2. **CEO testa Stripe Connect sandbox** — fluxo completo "Conectar → criar pedido de teste → webhook disparado". Fecha Bloco 1 a 100%.
3. **INPI: reverificação + pagamento GRU** — convocar external-researcher (1h), CEO paga se verde. Deadline duro: 13/06.
4. **CEO renova VERCEL_API_TOKEN** — 10 min, fecha issue #23 que está aberta há 14 dias.
5. **SW Camada B** (ADR-033) — renomear `sw.js` para `sw-v2.js` e atualizar `ServiceWorkerRegister.tsx`. Baixo risco técnico, alto impacto pra usuários existentes.

O que NÃO está no plano desta semana: `/customers`, Wave 1, qualquer feature nova. Foco é cheklist pré-soft launch.

---

## 5. Decisões pendentes para o CEO

| # | Decisão | Deadline | Risco se atrasar |
|---|---|---|---|
| D1 | Pagar GRU INPI R$ 880 (classe 35+42) | **13/06 — 8 dias** | Marca "Hayzer" sem proteção no lançamento público |
| D2 | Confirmar busca profunda INPI antes do pagamento | Antes de D1 | Pagar sem saber se existe colisão registrada desde 16/05 |
| D3 | CNPJ MEI→ME (desenquadrar antes 1ª venda) | Pré-cobrança | Receita de assinatura em MEI pode gerar autuação |
| D4 | Modelo de cobrança Hayzer Beauty (R$ 197 único vs tiers vs combo) | Antes 05/07 | Beauty sem pricing definido no launch de julho |
| D5 | MP OAuth: reconfigurar agora ou manter Stripe como default até MRR estável | Pós-soft launch | Se maker perguntar por MP, sem resposta clara |

---

## 6. Alertas

### ALERTA 1 — Bug crítico em aberto >5 dias: auth-js getSession

Confirmado em prod 03/06. Fix de 04/06 (`cbefed7/89d2f71`) implementou non-blocking boot como workaround estrutural. Score de risco caiu significativamente. Mas o bug do `supabase-auth-js 2.106.0` em si não foi corrigido — nós contornamos. Qualquer regressão nesse workaround em prod volta a travar o app.

**Monitorar**: se error-scan de 05/06 capturou `[Auth] getSession timed out` em prod logs, significa que o workaround não está cobrindo 100% dos casos.

### ALERTA 2 — Retenção 5.5: único pilar abaixo de 6.0

Issue #97 aberta há 4 dias. Email sequence foi entregue em código esta semana (`acf4cb1`), mas ainda não disparou pra nenhum maker real (cron só roda pós-cadastro). `/customers` V4 + LTV (Felipe) ainda em branch, não merged. Score só sobe com evidência em prod.

**Ação**: garantir que o cron de email funciona manualmente antes do soft launch (CEO envia 1 teste pra próprio email simulando D+1).

### ALERTA 3 — Issue #23 (VERCEL_API_TOKEN): 14 dias sem monitoring real

O error-scan de hoje rodou e gerou commit. Mas o issue continua aberto — a produção de um arquivo de scan não significa que o token é válido (pode ser o script de monitoramento que detectou o erro e reportou). CEO precisa verificar o conteúdo de `monitoring/error-scan-2026-06-05.md` e confirmar se o token está funcionando ou se o scan reportou erro novamente.

---

## 7. Nota de Helena

Esta semana entregou o que precisava ser entregue: Server Actions em todos os módulos críticos, auth non-blocking, email sequence, Sentry ativo, migrações V4 concluídas nos últimos 2 módulos legacy. O produto está tecnicamente mais sólido do que estava 7 dias atrás. Isso é real.

O problema é que chegamos a 8 dias do soft launch com 3 bloqueadores que dependem inteiramente do CEO fazer ações manuais: QA mobile, Stripe sandbox, INPI. Esses não são débitos técnicos, são itens que nenhum agente G7 pode resolver por você. Se os 3 não acontecerem antes de 13/06, o soft launch vai para frente de qualquer forma (ADR-029), mas com risco de bug P0 encontrado ao vivo por maker beta.

O ritmo técnico está alto. O gargalo real desta semana é operacional, não de código.

---

_Próxima revisão semanal: segunda 09/06 9h (CEO + Helena). Score Retenção em pauta obrigatória._
