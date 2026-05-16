# ADR 012 — Depósito de marca HAYZER no INPI (PF, classes 35 + 42)

> **Data**: 15/05/2026
> **Status**: Aceito — GRUs emitidas, aguardando pagamento
> **Decisor**: Gabriel (CEO)
> **Custo de reversão**: ALTO — taxa INPI não-reembolsável (R$ 880 já comprometido em GRUs com vencimento 13/06/2026)

---

## Contexto

Hayzer precisa de proteção legal da marca antes do launch público (04/07/2026) pra evitar cybersquatter ou concorrente registrar HAYZER nas classes que importam. Domínio `hayzer.com.br` já público + waitlist no ar = janela de exposição existe.

Pesquisa externa (15/05) confirmou via 13 fontes oficiais:
- **NCL 13 vigente** desde 01/01/2026 — não muda classes corretas
- **Código GRU 389** (R$ 440/classe pré-aprovado) vs 394 (R$ 860 livre)
- **Taxa unificada** desde set/2025 — cobre depósito + concessão + 10 anos
- **Desconto MEI/PF**: 50% (caiu de 60% na tabela nova)

---

## Decisões tomadas

### 1. Titular: Pessoa Física (Gabriel Ribeiro Nazareth, CPF 13099225940)

**Justificativa**:
- MEI atual (CNPJ 55.515.732/0001-06) tem CNAE 7319099 (publicidade), não permite operar SaaS legalmente
- Estrutura empresarial vai mudar nos próximos 6-12 meses (MEI → ME quando faturar)
- PF é mais flexível — marca é dele pessoal, transfere depois pra PJ via averbação (R$ 250) se necessário
- Risco zero de "perda" se MEI for fechado ou desenquadrado

**Alternativa descartada**: MEI/PJ — comprometeria a marca a estrutura empresarial que pode mudar.

### 2. Classes Nice: 35 + 42 (não só 42)

**Classe 42** (SaaS/software/desenvolvimento) — núcleo do produto. Obrigatória.
**Classe 35** (gestão comercial, publicidade, administração) — **pertinente, não só defensiva**. Hayzer inclui CRM, catálogo com checkout (marketplace), gestão de negócios pra terceiros. Sem 35, concorrente poderia registrar HAYZER em "gestão comercial" e bloquear expansão.

**Alternativa descartada**: só classe 42 — deixaria flanco aberto em classe 35.

### 3. Tipo: Nominativa (palavra HAYZER, sem logo)

**Justificativa**: marca nominativa é mais ampla — protege a palavra em qualquer estilização gráfica futura. Logo pode evoluir, palavra é fixa.

**Alternativa descartada**: marca mista (nome + logo) — mais restrita, só protege conjunto.

### 4. Prosseguir mesmo com HAIZER (baterias) existindo

Verificação de colisão (mavip, busca pública, Google):
- **HAYZER**: limpo, sem registros
- **HAIZER**: existe — marca de baterias VRLA pra moto/jet ski (Grupo WG Trade, distribuidor de várias marcas, HAIZER não é flagship)
- Outras variantes (HEYZER, RAYZER): limpas

**Análise de risco**:
- HAIZER em classe 9 (baterias elétricas)
- HAYZER em classes 35 + 42
- Afinidade mercadológica entre bateria física e SaaS de gestão pra maker 3D = praticamente zero
- WG Trade não tem incentivo comercial pra opor (não atua em software)
- Probabilidade de bloqueio: ~10-15%

**Plano de mitigação** caso oposição venha:
- Defesa administrativa apontando afinidade zero (forte argumento)
- Custo de recurso administrativo: ~R$ 500 + tempo
- Pior caso: rebrand custaria R$ 5-15k (muito mais que recurso)

**Conclusão**: risco aceitável, prosseguir.

### 5. Estratégia de emissão: 2 GRUs separadas (não 1 unificada)

**Razão**: sistema INPI obriga (validação retornou erro "intervalo de 1 a 1" quando tentei 2 classes em 1 GRU). Cada classe = 1 GRU separada.

---

## GRUs emitidas (15/05/2026)

| # | Nº GRU | Classe | Valor | Vencimento |
|---|---|---|---|---|
| 1 | `29409172357319880` | 42 (SaaS/software) | R$ 440,00 | 13/06/2026 |
| 2 | `29409172357319899` | 35 (gestão comercial) | R$ 440,00 | 13/06/2026 |
| | | **TOTAL** | **R$ 880,00** | |

PDFs baixados em `C:\Users\infin\Downloads\`:
- `gru_00029409172357319880 (1).pdf`
- `gru_00029409172357319899.pdf`

**Banco**: Banco do Brasil (001-9)
**Forma de pagamento**: PIX (QR Code no PDF) ou boleto em qualquer banco
**Beneficiário**: INSTITUTO NACIONAL DA PROPRIEDADE INDUST — CNPJ 42.521.088/0001-37

---

## Próximos passos

1. **CEO paga via PIX as 2 GRUs** (sugerido até 20/05 — quanto antes melhor pro protocolo)
2. **Depositar marca em e-Marcas** (`marcas.inpi.gov.br/emarcas/`) via Chrome MCP:
   - Login no e-INPI
   - Novo pedido de marca → nominativa HAYZER
   - Selecionar classe 42, vincular GRU `29409172357319880`
   - Selecionar especificação pré-aprovada (sugerido: "fornecimento de plataforma de software como serviço (SaaS)" ou similar pré-aprovado da NCL 13)
   - Repetir processo pra classe 35 com GRU `29409172357319899` (especificação sugerida: "gestão de negócios", "administração de negócios comerciais" ou similar pré-aprovado)
3. **Aguardar publicação** na Revista da Propriedade Industrial (RPI) — ~30-60 dias
4. **Monitorar oposição** nos 60 dias após publicação (especialmente WG Trade pela HAIZER)
5. **Exame de mérito INPI**: 21-33 meses até decisão final

**Prioridade legal já se inicia no momento do depósito** — não precisa esperar o registro final.

---

## Cadastro e-INPI (15/05/2026)

- Login criado como **Cliente — Pessoa Física**
- Modalidade: Brasileiro
- Usuário: Gabriel882
- Dados confirmados pelo sistema: GABRIEL RIBEIRO NAZARETH, Rua Alberto Jans, CEP 86084-140, Londrina/PR
- Profissão selecionada pelo CEO durante cadastro (não confirmada por mim)

---

## Relacionados

- `decisions/009-naming-hayzer.md` — escolha do nome HAYZER
- `decisions/010-foco-vertical-maker-3d.md` — posicionamento pra maker 3D
- `decisions/011-rls-returning-anon.md` — fix do waitlist em prod
- `~/OneDrive/Documentos/Contextos Projetos/02 - Frentes ativas/5c - HAYZER - Investimento vs Recuperacao 2026-05-15.md` — análise financeira CEO

---

## Lições aprendidas

1. **INPI usa fluxo separado por classe** — não dá pra unificar GRU. Sistema valida 1-a-1.
2. **Código 389 (pré-aprovado) é metade do 394 (livre)** — usar termos da lista pré-aprovada economiza R$ 420/classe.
3. **Cadastro gov.br ≠ cadastro e-INPI** — são logins separados, complemento obrigatório.
4. **PDF da GRU vence em 30 dias** (último dia útil do mês seguinte ao depósito).
5. **Verificação de colisão antes de pagar é regra de ouro** — R$ 880 sem checagem = risco real.
