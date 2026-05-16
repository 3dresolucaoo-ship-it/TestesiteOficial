# Sessão 15/05/2026 (noite) — Marca INPI HAYZER depositada (GRUs emitidas)

> Continuação da sessão maratona 14-15/05. Esta sessão focou em destravar a pendência prioritária #1: depósito da marca HAYZER no INPI.

## 🎯 Tema da sessão

Emitir as 2 GRUs do INPI pra depósito da marca HAYZER (classes 35 + 42) após validação de classes, verificação de colisão e definição de titular PF.

## ⏱️ Duração

~2h. Validação de classes via pesquisador externo → checagem de colisão HAYZER/HAIZER → discussão PF vs MEI (CEO em dúvida, várias rodadas) → cadastro e-INPI → emissão das 2 GRUs → conversa sobre runway/recuperação → documentação.

## ✅ Entregas

1. **Pesquisador externo validou classes 35 + 42** com 13 fontes oficiais (Legis Marcas, Move On, Regify, INPI gov.br, Icamp, etc). NCL 13 vigente desde 01/01/2026. Código 389 (pré-aprovado, R$ 440/classe) vs 394 (livre, R$ 860/classe).

2. **Verificação de colisão concluída**:
   - HAYZER (com Y) — limpo, sem registros encontrados
   - HAIZER (com I) — existe como marca de **baterias VRLA** do Grupo WG Trade (CNPJs 09.067.812/0001-29 etc), classe 9, distribuidor de várias marcas (HAIZER não é flagship)
   - HEYZER, RAYZER — limpas
   - Risco de oposição cross-class: ~10-15% (afinidade mercadológica bateria vs SaaS = zero)

3. **Análise da CNPJ MEI do CEO** (55.515.732/0001-06):
   - Nome: GABRIEL RIBEIRO NAZARETH (não Gabriel Vaz como aparecia em outros docs)
   - CNAE atual: 7319099 (publicidade), não permite operar SaaS
   - Decisão titular: **PF** (mais flexível, transfere depois se quiser)

4. **Cadastro completo no e-INPI** como Cliente PF brasileiro:
   - URL: `meu.inpi.gov.br/pag/cliente/form`
   - Pré-selecionei dropdowns seguros (Brasileiro, PF, Brasil, PR, Londrina)
   - CEO digitou dados pessoais (CPF, RG, senha, endereço, profissão)
   - Cadastro funcionou, redirect direto pra tela de gerar GRU

5. **2 GRUs emitidas** (código 389 pré-aprovado):
   - **GRU 1**: `29409172357319880` — classe 42 — R$ 440 — venc 13/06/2026
   - **GRU 2**: `29409172357319899` — classe 35 — R$ 440 — venc 13/06/2026
   - PDFs em `C:\Users\infin\Downloads\`
   - Banco: Banco do Brasil 001-9
   - Pagamento: PIX QR Code OU boleto

6. **Plano de recuperação financeira documentado**:
   - CEO investiu R$ 1.680 + ~1 mês full-time
   - Arquivo: `~/OneDrive/Documentos/Contextos Projetos/02 - Frentes ativas/5c - HAYZER - Investimento vs Recuperacao 2026-05-15.md`
   - Memory persistente: `project_runway_hayzer.md`
   - 5 estratégias de aceleração (Lifetime Deal, Curso, Calculadora Pro, Parcerias, otimização Claude Code)
   - Meta mínima mês 6: 5 clientes × R$ 50 = R$ 250/mês

7. **ADR-012 lavrado** (`decisions/012-marca-inpi-pf-classes-35-42.md`)

8. **CLAUDE.md raiz atualizado** com status atual (GRUs emitidas, aguardando pagamento)

## 🔴 Pendências

- **CEO paga as 2 GRUs amanhã via PIX** (sugerido até 20/05)
- **CEO manda planilha pessoal de gastos e receber** (próxima sessão → mini-council Helena+Marcos+Paulo)
- **Após pagamento confirmado**: depósito da marca em e-Marcas via Chrome MCP

## 📐 Decisões registradas

- **ADR-012** — Titular PF, classes 35+42, nominativa, prosseguir apesar HAIZER

## 📦 Commits

Nenhum commit nesta sessão — trabalho foi externo ao código (INPI + documentação).

## 🔐 Segurança a lembrar

Sem mudanças em prod ou env vars nesta sessão.

## 🚀 Próximas ações priorizadas

1. **CEO paga 2 GRUs** (R$ 440 cada via PIX) — janela 16/05-20/05 ideal, até 13/06 limite
2. **Depositar marca no e-Marcas** — após pagamento confirmar via Chrome MCP
3. **Receber planilha do CEO** → estruturar runway real → council Helena+Marcos+Paulo
4. **Rotacionar SUPABASE_SERVICE_ROLE_KEY** (pendência herdada — janela noturna)
5. **Pendência #2 herdada**: post de divulgação canais maker 3D (Marcos plano pronto)

## 👥 Agentes G7 envolvidos

- **external-researcher** — validação classes Nice + tabela INPI 2025-2026 + verificação NCL 13

## 🧠 Aprendizados técnicos

1. **INPI obriga 1 classe = 1 GRU** — sistema valida "intervalo de 1 a 1". Não dá pra unificar.
2. **Código 389 vs 394** — economiza R$ 420/classe usando termo pré-aprovado.
3. **gov.br ≠ e-INPI** — são cadastros separados. Primeiro acesso após login mostra "Usuário não cadastrado no e-INPI".
4. **Sistema INPI usa Select2/Chosen** — `select.value = x` direto não funciona, precisa disparar evento change + jQuery se houver.
5. **PDFs INPI baixam automaticamente** no Chrome em vez de abrir em aba.
6. **CNPJ MEI nome real** vem de Receita pública via BrasilAPI (gratuita, sem autenticação) — útil pra confirmar dados.

## 💬 Estado emocional do CEO (registro)

CEO expressou peso do investimento em meio à sessão. R$ 1.680 + 1 mês dedicado. Pediu análise honesta de recuperação. Após análise, **reposicionou** com mindset de investidor: "Claude Code virou uma arma na minha mão. Aceito o risco, quero ROI."

Esse mindset positivo está salvo na memory `project_runway_hayzer.md` pra próximas sessões pegarem o contexto.

---

## 📋 Pra continuar depois do /clear

Continuando trabalho em Hayzer. Marca INPI: **GRUs emitidas em 15/05** (2 × R$ 440 = R$ 880). Aguardando CEO pagar via PIX (vencimento 13/06/2026) e mandar planilha pessoal de gastos.

Próximas ações: (1) confirmar pagamento das GRUs `29409172357319880` (classe 42) + `29409172357319899` (classe 35), (2) depositar marca em e-Marcas via Chrome MCP, (3) receber planilha CEO → council Helena+Marcos+Paulo pra plano 90 dias.

Pendências paralelas: rotacionar SUPABASE_SERVICE_ROLE_KEY (janela noturna), post divulgação maker 3D (Marcos plano pronto, Carla copy).

Lê: `CLAUDE.md`, `decisions/012-marca-inpi-pf-classes-35-42.md`, `sessions/2026-05-15-2300-marca-inpi-gru-emitida.md`, `~/OneDrive/Documentos/Contextos Projetos/02 - Frentes ativas/5c - HAYZER - Investimento vs Recuperacao 2026-05-15.md`.
