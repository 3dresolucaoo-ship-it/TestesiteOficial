# PLAYBOOK — Depósito da marca HAYZER no e-Marcas (segunda 18/05/2026)

> Documento preparatório criado em 16/05/2026 (sábado).
> Trabalho silencioso enquanto CEO edita vídeos.
> Quando CEO pagar GRUs segunda e voltar, é só seguir este playbook passo a passo.

---

## 🎯 Objetivo

Depositar marca HAYZER no e-Marcas em 2 protocolos separados (1 por classe), usando as GRUs já emitidas em 15/05. Cada protocolo é 1 marca = 1 classe (regra INPI).

---

## 📋 Pré-requisitos (já cumpridos ou pendentes)

- [x] Cadastro no e-INPI ativo (`Gabriel882`)
- [x] GRU 1 emitida: `29409172357319880` (classe 42, R$ 440)
- [x] GRU 2 emitida: `29409172357319899` (classe 35, R$ 440)
- [x] PDFs em `C:\Users\infin\Downloads\`
- [ ] **GRUs pagas via PIX** (segunda 18/05 — pendente CEO)
- [ ] Comprovantes PIX guardados

---

## 🔗 URLs importantes

- **Sistema de depósito**: https://marcas.inpi.gov.br/emarcas/
- **Login**: pelo gov.br (mesma credencial do e-INPI)
- **Manual oficial**: https://manualdemarcas.inpi.gov.br/projects/manual/wiki/3%C2%B705_Peticionamento_eletr%C3%B4nico_pelo_e-Marcas

---

## ⏱️ Tempo estimado

- Depósito classe 42: ~15-20 min
- Depósito classe 35: ~15-20 min
- **Total: ~40 min** + 30 min de folga (sessão e-Marcas dura 30min cada)

---

## 🚨 Limites técnicos a respeitar

- Sessão e-Marcas: **30 minutos** por protocolo (timeout automático)
- Anexos: PDF, máx 2 MB cada
- Não precisa imagem (marca nominativa)
- Após "Protocolar" → **não dá pra alterar** (irreversível)

---

# DEPÓSITO 1 — Classe 42 (SaaS/software)

## Tela 1: Login + GRU
- Login no `marcas.inpi.gov.br/emarcas/` via gov.br
- Inserir **número da GRU**: `29409172357319880`
- Clicar **Avançar**

## Tela 2: Dados do requerente
- Sistema migra dados da GRU automaticamente
- Confirmar:
  - **Titular**: GABRIEL RIBEIRO NAZARETH
  - **CPF**: 13099225940
  - **Endereço**: Rua Alberto Jans, CEP 86084-140, Londrina/PR
  - **Procurador**: nenhum (deixar vazio)

## Tela 3: Apresentação e Natureza
- **Apresentação**: ☑ **Nominativa**
- **Natureza**: ☑ **Marca de Produto e/ou Serviço** (não é coletiva nem certificação)

## Tela 4: Elemento nominativo
- **Texto da marca**: `HAYZER`
- **Tradução do estrangeiro?** Não (HAYZER é nome inventado, sem tradução)

## Tela 5: Imagem
- **Pular** — marca nominativa não precisa de imagem

## Tela 6: Especificação de produtos/serviços (CRÍTICO)

### Como navegar:
1. Clicar **"Exibir lista de classes"**
2. Selecionar **Classe 42**
3. No campo "Digite um termo para filtrar", buscar UM POR UM os termos abaixo
4. Marcar os checkboxes e clicar **Salvar**

### Termos a selecionar (prioridade 1 → 3):

| Prioridade | Nº base | Texto a buscar | Cobre o quê |
|---|---|---|---|
| **1 ESSENCIAL** | 420220 | **Software como serviço [SaaS]** | Modelo de entrega central do Hayzer (acesso web por assinatura) |
| 2 ALTA | 420248 | Plataforma como serviço [PaaS] | Uso de plataforma + integrações futuras (Bambu Lab, Bling) |
| 3 MÉDIA | 420226 | Armazenamento eletrônico de dados | Dados de pedidos, estoque, CRM no Supabase |

**Se sistema só permitir 1**: usar **"Software como serviço [SaaS]"** (420220).

**ATENÇÃO**: se um termo NÃO aparecer como pré-aprovado no e-Marcas (INPI suprimiu alguns em 2025), PARAR e me avisar antes de continuar. Não trocar pra código 394 (livre) sem alinhar — custo dobra (R$ 860 em vez de R$ 440).

### ❌ Termos a EVITAR:
- "Marketplace" — atrai oposição Mercado Livre/Shopee
- "Vendas intermediadas" — mesmo risco
- Caput genérico sozinho — proteção difusa

## Tela 7: Declaração de atividade
- Marcar declaração de **"exercício efetivo e lícito da atividade"**
- Guardar contrato MEI (CNPJ 55.515.732/0001-06) pra eventual solicitação posterior do INPI

## Tela 8: Prioridade unionista
- **Pular** — não temos depósito anterior em outro país

## Tela 9: Classificação figurativa
- **Pular** — marca nominativa

## Tela 10: Requerentes adicionais
- **Pular** — só Gabriel é titular

## Tela 11: Anexos
- **Pular** — nominativa PF não precisa de anexos obrigatórios

## Tela 12: Envio
1. Marcar declaração de veracidade
2. Clicar **Avançar**
3. Revisar prévia do formulário (CONFERIR TUDO antes de continuar)
4. Confirmar GRU paga: **Sim**
5. Clicar **Protocolar**

## Tela 13: Confirmação
- Anotar **número do pedido** (9 dígitos)
- Baixar **recibo PDF**
- Salvar em `C:\Users\infin\Downloads\` com nome claro

---

# DEPÓSITO 2 — Classe 35 (gestão comercial)

> Repete o mesmo fluxo, com diferenças marcadas em **NEGRITO**:

## Tela 1: Login + GRU
- **GRU**: `29409172357319899`

## Tela 4: Elemento nominativo
- **Texto**: `HAYZER` (mesma marca)

## Tela 6: Especificação (CLASSE 35 — diferente)

### Termos a selecionar (prioridade 1 → 3):

| Prioridade | Nº base | Texto a buscar | Cobre o quê |
|---|---|---|---|
| **1 ESSENCIAL** | 350020 | **Gestão de negócios comerciais** | Camada de gestão do Hayzer (pedidos, metas, break-even) |
| 2 ALTA | 350061 | Gestão computadorizada de arquivos | CRM de clientes + estoque filamentos no sistema |
| 3 MÉDIA | 350080 | Compilação de informações em bancos de dados | Catálogo, histórico, dados de mercado |

**Se sistema só permitir 1**: usar **"Gestão de negócios comerciais"** (350020) — é o caput, mais amplo.

### ❌ Termos a EVITAR:
- Qualquer relacionado a "marketplace", "venda intermediada", "comércio eletrônico de terceiros" — atrai oposição grande

## Resto do fluxo: idêntico ao Depósito 1

---

# 📊 Resumo executivo (cola na primeira tela quando começar)

```
MARCA: HAYZER (nominativa)
TITULAR: GABRIEL RIBEIRO NAZARETH, CPF 13099225940
SEM PROCURADOR

GRU 1 → 29409172357319880 → Classe 42 → Software como serviço [SaaS]
GRU 2 → 29409172357319899 → Classe 35 → Gestão de negócios comerciais
```

---

# ⚠️ Pontos de atenção crítica

1. **30 min de timeout por sessão** — preencher direto, sem pausas longas
2. **Após protocolar = IRREVERSÍVEL** — revisar 3x antes de clicar
3. **Se termo não aparecer pré-aprovado** — parar, perguntar, NÃO mudar pra livre
4. **Cada protocolo gera 1 pedido** — total: 2 pedidos com 2 números diferentes (e 2 recibos PDF)
5. **Período de oposição**: 60 dias após publicação na RPI — monitorar especialmente WG Trade pela HAIZER
6. **Tempo de exame INPI**: 21-33 meses até decisão final, mas PRIORIDADE LEGAL começa no protocolo

---

# ✅ Checklist pós-depósito (após segunda)

- [ ] Anotar nº do pedido classe 42: `____________`
- [ ] Anotar nº do pedido classe 35: `____________`
- [ ] Salvar recibos PDF em `C:\Users\infin\Downloads\`
- [ ] Atualizar `decisions/012-marca-inpi-pf-classes-35-42.md` com números dos pedidos
- [ ] Atualizar `CLAUDE.md` raiz com status "marca depositada"
- [ ] Marcar pendência #1 como ✅ no CLAUDE.md
- [ ] Criar reminder pra checar RPI em 30-60 dias (publicação)
- [ ] Criar reminder pra monitorar oposição 60 dias após publicação

---

# 📚 Fontes consultadas (pra rastreabilidade)

- Manual de Marcas INPI, seção 3.05 (peticionamento e-Marcas)
- Manual de Marcas INPI, seção 5.04 (análise de especificação)
- Lista oficial NCL 13 2026 — INPI Brasil
- WIPO NCL 13 versão 2026 — números de base
- Análises de escritórios PI (Legis, Move On, Imperatus, A Marca Registrada)

---

**Última atualização**: 16/05/2026 (sábado de manhã)
**Próxima ação**: aguardar CEO pagar GRUs segunda 18/05 e voltar
