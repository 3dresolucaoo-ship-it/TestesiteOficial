# Diagnóstico 21/05 madrugada — 4 opções pro CEO

> Sessão hardwork autônoma. Investigação técnica completa sobre bloqueador A.3 vs A.4.
> **CORREÇÃO 14h38**: módulos NÃO ficam em loading infinito. Renderizam após **20-25 segundos**.
> Tem DOIS problemas distintos:
> 1. **Loading lento** (AuthContext bloqueia UI 20-25s) — afeta TODA rota AppShell
> 2. **Visual quebrado** dos 4 módulos V4 (KPIs em texto cru + botões grudados) — decisão A.3 vs A.4 vs A.5
>
> Datado: 2026-05-21 ~14h30-14h40
> Estado em prod: commit `9c33723` READY · /dashboard funcional · /orders /crm /finance /production lentos+visual feio · /inventory /products /settings idem

---

## ⚡ TL;DR

| Opção | Tempo | Resolve o quê | Risco | Recomendação |
|---|---|---|---|---|
| **A.6** (NOVA — descoberta 14h38) | 15-30min | **Loading lento 20-25s → <3s** (fix `AuthContext` await loadProfile sem timeout) | Baixo | ✅ **APLICAR ANTES** de qualquer outra opção |
| **A.3** (Helena) | 2-3h | Visual quebrado (reverte módulos pro AppShell antigo) | Baixo | ✅ Segura pré-launch 11/06 |
| **A.4 v1** (Felipe original) | 45-60min | Visual quebrado (extrai CSS do mockup pro globals-v4.css) | Médio | ⚠️ Resultado híbrido (KPIs V4 + sidebar legada) |
| **A.5 / A.4 v2** | 30-90min | Visual quebrado (recupera commit `f0a2700` V4Shell + adiciona paths em V4_PATHS) | Médio-alto (motivo do revert original desconhecido) | ⚠️ Mais arrumado mas mais arriscado |

---

## 🔬 Evidence visual (Chrome MCP em prod 14h28-14h38)

| URL | Após 6s | Após 20-25s |
|---|---|---|
| https://hayzer.com.br/dashboard | ✅ V4 completo | ✅ idem |
| https://hayzer.com.br/orders | ❌ logo H pulsando | ⚠️ renderiza com sidebar legada + KPIs texto cru + botões "Exportar CSVNovo Pedido" grudados |
| https://hayzer.com.br/crm | ❌ logo H | ⚠️ mesmo padrão |
| https://hayzer.com.br/finance | ❌ logo H | ⚠️ mesmo padrão |
| https://hayzer.com.br/production | ❌ logo H | ⚠️ mesmo padrão |
| https://hayzer.com.br/inventory | ❌ logo H | (não testei 20s, presumivelmente mesmo padrão) |
| https://hayzer.com.br/products | ❌ logo H | (idem) |
| https://hayzer.com.br/settings | ❌ logo H | (idem) |

Console em 4 visitas distintas:
```
[14:28:49] [Auth] getSession timed out — unblocking UI (no session confirmed)
[14:29:18] [Auth] getSession timed out — unblocking UI (no session confirmed)
[14:35:27] [Auth] getSession timed out — unblocking UI (no session confirmed)
[14:37:37] [Auth] getSession timed out — unblocking UI (no session confirmed)
```

Safety timer dispara consistentemente. Sempre demora.

---

## 🧠 Root Cause (descoberto via leitura do código)

### Cadeia técnica completa

1. **`components/LayoutSwitch.tsx:14`** define `V4_PATHS = ['/dashboard', '/library']`
   - Apenas essas 2 rotas escapam do AppShell legado
   - Recebem children direto dentro do AuthProvider

2. **/orders /crm /finance /production** caem na branch default → `<AppShell>{children}</AppShell>`

3. **`components/AppShell.tsx:144`** se `loading=true`, mostra `<LoadingScreen />` (logo H pulsando)

4. **`context/AuthContext.tsx:95`** `setLoading(false)` SÓ DEPOIS de `await loadProfile()` resolver

5. **`services/profiles.ts:17`** `profilesService.get()` faz `.from('profiles').select().eq('id', userId).maybeSingle()`
   - Se demora >12s = safety timer chuta loading=false MAS user fica null
   - AppShell linha 144: loading=false → tenta renderizar shell completo
   - Mas então `setRole('user')` + StoreProvider tenta hidratar + alguma cadeia trava

6. **/dashboard escapa** porque NÃO PASSA pelo AppShell. Vai direto pro DashboardLayout V4 que tem sidebar+topbar próprio + hidratação SSR-friendly.

### Por que isso ficou assim?

Sequência de commits 20/05 noite → 21/05 madrugada:

- `63980e1 fix(v4): add V4ThemeProvider to set data-theme on modules migrated to V4 shell`
- `f0a2700 feat(v4): extract generic V4Shell from DashboardLayout (onda 3c.1)` ← extraiu V4Shell genérico
- `e63125e Revert "feat(v4): extract generic V4Shell from DashboardLayout (onda 3c.1)"` ← revertido **4 minutos depois** (13:45→13:49)
- `85bad59 fix(appshell): trust middleware instead of returning null on getSession timeout` ← tentou destravar tela preta
- `284fa2c fix(css): import globals-v4.css in root layout so V4 classes work on all routes` ← tentou consertar CSS

O revert do V4Shell deixou os 4 módulos no limbo:
- Pages já tinham sido refatoradas pra usar ModuleShell (que assume V4 environment)
- Mas o WRAPPER V4 (sidebar+topbar+ambient) foi removido
- E elas continuaram no V4_PATHS = ['/dashboard', '/library'] (não foram adicionadas)

**ModuleShell NÃO tem sidebar/topbar.** Só tem PageHeader + KpiRow + FilterBar + children. Quem fornece nav é o wrapper externo (V4Shell que foi revertido OU AppShell legado).

---

## 🎯 As 4 opções em detalhe

### Opção A.6 — Fix AuthContext loading lento (NOVA, RECOMENDO APLICAR ANTES)

**O que fazer:**
Modificar `context/AuthContext.tsx` linha 70-101:

Opção 6a (mais conservadora): adicionar timeout ao `loadProfile`:
```diff
   if (validUser) {
     const { data: { session } } = await supabase.auth.getSession()
     setSession(session)
     setUser(validUser)
-    await loadProfile(validUser.id)
+    await Promise.race([
+      loadProfile(validUser.id),
+      new Promise(resolve => setTimeout(resolve, 2500)),
+    ])
   } else {
     setSession(null)
     setUser(null)
   }
   setLoading(false)
```

Opção 6b (mais arrojada): mover `setLoading(false)` ANTES de `loadProfile`, deixar profile carregar async:
```diff
   if (validUser) {
     const { data: { session } } = await supabase.auth.getSession()
     setSession(session)
     setUser(validUser)
-    await loadProfile(validUser.id)
   } else {
     setSession(null)
     setUser(null)
   }
   setLoading(false)
+  if (validUser) {
+    void loadProfile(validUser.id)  // fire and forget — role pode chegar depois sem bloquear UI
+  }
```

**Tempo:** 15-30min (mudança + testar local + push + validar Vercel)

**Pros:**
- Resolve loading lento (20-25s → <3s) em TODAS as rotas AppShell
- Não toca em visual nem shell
- Reversível 100%
- Independente das opções A.3/A.4/A.5

**Cons:**
- Role do user pode chegar com delay (mas defaultRole='user' já cobre)
- Não resolve KPIs em texto cru / botões grudados (mas isso é problema visual separado)

**Risco:** Baixo. Vou aplicar agora em branch e CEO valida antes de push.

---

### Opção A.3 — Reverter (Helena, conservador)

**O que fazer:**
1. Reverter migrações ModuleShell em /orders /crm /finance /production
2. Restaurar versões pre-V4 dessas pages (commits antes de 18-20/05)
3. Manter /dashboard V4 (funcional)
4. V4 migration entra como "Onda 2 pós-launch 27/06"

**Tempo:** 2-3h (Felipe pra 4 reverts + verificar regressão)

**Pros:**
- Resolve loading infinito em definitivo
- Pre-launch seguro: sidebar legada já era usada em produção há meses
- Felipe livre depois pra golden path (3 integrações Sofia mapeou)
- Reduz superfície de bug pré-soft launch 11/06

**Cons:**
- Perde trabalho V4 desses 4 módulos (commit `09a2adc` production, `593e45d` finance, etc — tudo vira branch parking)
- /dashboard V4 vs outros módulos legacy = visual inconsistente

**Risco:** Baixo. Volta pra estado que funcionou semanas.

---

### Opção A.4 v1 — Extrair CSS do mockup (Felipe original) **VOLTOU A SER VIÁVEL**

**O que é:**
Extrair CSS V4 do mockup `mockups/orders-v4-tom-novo.html` linhas 556-790 + 1195-1213 pro `app/globals-v4.css`.

**Status atualizado:**
Com a descoberta de que módulos RENDERIZAM (só demora 20-25s), CSS extract agora FAZ SENTIDO. Os KPIs em texto cru ("FATURADO R$ 90 TICKET R$ 90 ORCAMENTOS 0") viram cards V4 estilizados depois da extração.

**Tempo:** 45-60min (Felipe)

**Pros:**
- Mantém trabalho V4 dos 4 módulos
- Resolve visual quebrado (KPIs viram cards V4)
- Reversível (branch isolada)

**Cons:**
- Resultado HÍBRIDO: KPIs V4 + sidebar legada (GLOBAL/VITRINE/SISTEMA)
- Helena alertou: isso NÃO é o "/dashboard espalhado por todos" que CEO queria.
- Se aplicar A.6 + A.4, módulos ficam "razoáveis" mas não "showcase V4 completo"

---

### Opção A.5 (A.4 v2) — Recuperar V4Shell + mover paths

**O que fazer:**
1. Cherry-pick `f0a2700` (V4Shell genérico)
2. Adicionar `/orders /crm /finance /production` em `V4_PATHS` no `LayoutSwitch.tsx:14`
3. Envolver pages em `<V4Shell>` (provavelmente layout.tsx por rota OU dentro da page direto)
4. Testar local com `npm run build` + visualmente em dev server
5. Se passou, push e validar em deploy Vercel

**Tempo:** 30-90min dependendo de quão clean o cherry-pick fica

**Pros:**
- Mantém trabalho V4 dos 4 módulos
- Visual unificado com /dashboard
- V4Shell era código limpo (514 linhas, sidebar+topbar+ambient+streak)
- Resolve definitivamente o loading infinito (V4_PATHS escapa do AppShell)

**Cons:**
- **NÃO sabemos por que foi revertido originalmente.** Revert ocorreu 4 minutos após o commit. Provavelmente CEO viu algo quebrar em prod e mandou voltar. Sem comentário no commit de revert pra dar pista.
- Possíveis razões do revert (especulação):
  - Build quebrou
  - Hydration mismatch
  - DashboardLayout virou wrapper magro mas algum prop quebrou
  - Visual em alguma rota especifica regrediu
- Pré-launch arriscado se não conseguirmos reproduzir a razão original

**Risco:** Médio-alto. Mitigação: testar EXAUSTIVAMENTE em dev server antes de push.

---

## 📋 Recomendação combinada (descoberta 14h38)

**Eu (Claude, hardwork) inclino pra combo:**

1. **A.6 imediato** — fix AuthContext loading lento. 15-30min. Aplica antes de qualquer outra opção. Branche pronta pra teu GO.

2. **A.4 v1 depois** — Felipe extrai CSS do mockup. Resolve visual quebrado dos 4 módulos. Resultado híbrido (sidebar legada + KPIs V4) é OK pré-launch.

3. **A.5 fica pra Onda 2 pós-27/06** — mais tempo pra investigar motivo do revert original, testar exaustivo, planejar migração ordenada dos 11 módulos restantes.

**A.3 vira plano B** se A.6+A.4 não fechar visual aceitável até 11/06.

Razões da mudança:
1. Soft launch em 21 dias. A.6 (15min) destrava experiência de TODOS usuários (não só os 4 módulos V4 — /inventory /products /settings também aceleram).
2. A.4 v1 + A.6 = baixo risco, alto retorno visual.
3. A.5 tem risco alto (motivo revert desconhecido). Não vale apostar pré-launch.
4. /dashboard continua como showcase V4 completo. Outros módulos ficam "boa qualidade" sem ser perfeitos.

Mas é decisão CEO. Bruna ainda rodando golden path — independente.

---

## 🎬 Próxima ação esperada

CEO confirma combo **A.6 + A.4 v1** OU escolhe alternativa (A.3 ou A.5).

Se A.6+A.4 (recomendação):
1. Aplico A.6 agora em branch `feature/auth-loading-fast`. Não pusho. Reporto diff pra CEO.
2. CEO valida visualmente (eu testo local + chrome em dev server) → CEO dá GO → push.
3. Depois despacho Felipe pra A.4 v1 (extrair CSS).
4. Onda 2 pós-launch: A.5 (V4Shell recovery) com tempo pra testar exaustivo.

Se A.3 (Helena conservador):
1. Despacho Felipe pra reverter 4 módulos pro AppShell antigo (2-3h).
2. /dashboard fica V4. Outros voltam ao visual de semanas atrás.
3. A.6 ainda válido (loading lento afeta TODA rota AppShell, inclusive depois do revert).

Se A.5 (V4Shell):
1. Cherry-pick `f0a2700` em branch nova.
2. Testo local exaustivo.
3. Investigo motivo do revert original (não documentado).
4. Reporto antes de qualquer push.

---

## 📦 Bonus: trabalho rodando em paralelo (não bloqueado por A.3/A.5)

- ✅ Sofia — audit empty states completo (relatório em `sessions/2026-05-21-empty-states-audit-sofia.md`)
- ✅ Lia — docs atualizadas (`audits/_rolling.md`)
- 🟡 Bruna — golden path filamento débito automático (rodando)
- ⏳ Próximos: golden path #1 (lead→pedido manual) + golden path #3 (/finance hidratar store)
