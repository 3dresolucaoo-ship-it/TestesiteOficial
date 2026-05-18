# Pendência — Busca profunda INPI antes de pagar GRUs HAYZER

> **Status**: ⚠️ AÇÃO PENDENTE antes de pagar PIX das GRUs (R$ 880)
> **Deadline GRUs**: 13/06/2026
> **Risco bloqueante**: pagar e descobrir colisão registrada que invalide o pedido
> **Anotado**: 2026-05-18 · **Origem**: CEO Gabriel quer reduzir risco financeiro

---

## Por que isso é pendente

CEO vai pagar R$ 880 (R$ 440 classe 35 + R$ 440 classe 42) via PIX antes de 13/06/2026. Já fizemos busca em 16/05 que confirmou:
- HAYZER limpo em ambas as classes
- HAIZER existe em classe 9 (WG Trade, baterias) com perfil passivo, risco recalibrado pra 8-10%
- Variantes AYZER/AIZER: só QUAIZER (mista cl42 IA) e ANALAYZER (mista cl42 análise água) em vigor, especificações distintas

Mas a busca foi feita em 16/05. O CEO quer **reverificar uma última vez antes de pagar** pra:
1. Confirmar que ninguém entrou com pedido HAYZER no intervalo (16/05 a data de pagamento)
2. Recalcular probabilidade real de aprovação INPI
3. Mapear plano B caso seja indeferido (textos backup pra código 394 já existem)

---

## Checklist a executar antes do pagamento

### 1. Reverificação ao vivo no pePI INPI (15min)
- [ ] Acessar busca.inpi.gov.br/pePI
- [ ] Buscar "HAYZER" exato em todas as classes
- [ ] Buscar "HAIZER" pra checar se WG Trade adicionou novas classes
- [ ] Buscar variantes: HAIZAR, HAYZAR, HAIZER, HEYZER, HEYZAR
- [ ] Buscar nome inteiro + parte do nome
- [ ] Buscar em status "em análise" também (não só vigentes)

### 2. Recálculo probabilístico de aprovação
- [ ] Pesquisar no Google Acadêmico: taxa de indeferimento INPI BR 2024-2026 por classe 35/42
- [ ] Verificar tempo médio de análise INPI (8-15 meses tipicamente)
- [ ] Listar fatores que aumentam chance de aprovação:
  - Nominativa pura (sem mistura visual) → +risco baixo
  - Classes técnicas (35 gestão / 42 SaaS) → bem definidas
  - Código 389 pré-aprovado → reduz objeção formal
- [ ] Listar fatores de risco específico:
  - WG Trade pode opor mesmo sendo passiva (60 dias após publicação)
  - INPI examinador pode indicar alteração de produto/serviço

### 3. Plano B financeiro
- [ ] Se indeferido: GRU é perdida (R$ 880 não retornam)
- [ ] Plano B textos código 394 já estão prontos no arquivo do external-researcher
- [ ] Caso oposição WG Trade: contestar via advogado especializado em PI (~R$ 1.500-3.000)
- [ ] Caso indeferimento INPI: nova GRU + textos alternativos = R$ 880 segunda tentativa

### 4. Verificação de dados PF (titular)
- [ ] Confirmar CPF Gabriel: 13099225940 ✅ (já confirmado em ADR-012)
- [ ] Confirmar endereço cadastrado no INPI
- [ ] Confirmar email pra notificações INPI (precisa ser ativo, INPI manda exigências por email)

### 5. Documentação após pagamento
- [ ] Salvar comprovantes PIX em arquivo
- [ ] Anexar comprovantes nas GRUs no e-Marcas
- [ ] Atualizar ADR-012 com data de pagamento real
- [ ] Marcar próxima etapa: depósito de marca via Chrome MCP no e-Marcas

---

## Como executar

**Quem faz**: external-researcher (G7) faz a parte 1 e 2 (~1h). CEO valida resultado e bate o PIX se OK.

**Quando**: 1-3 dias antes da data de pagamento que CEO escolher (sugestão CEO: 20/05 originalmente).

**Comando sugerido**: `/council` chamando só o external-researcher pra rodar a parte 1 e 2 em modo "Rodada Profunda", retornar parecer com 3 cenários (verde/amarelo/vermelho) e custo esperado de cada.

---

## Decisão final

Após relatório do external-researcher, CEO decide:
- 🟢 **Procede pagamento**: risco aceitável, GRUs pagas, depósito agendado
- 🟡 **Procede com ressalva**: paga mas com plano B contratado em paralelo (advogado standby)
- 🔴 **Adia / muda nome**: risco alto, melhor reavaliar marca antes de gastar R$ 880

---

## Histórico

- **16/05/2026**: primeira verificação pePI INPI (HAYZER limpo, HAIZER WG Trade risco baixo)
- **18/05/2026**: pendência criada por solicitação CEO
- **TBD**: reverificação profunda (próxima)
- **TBD**: pagamento GRUs (limite 13/06)
- **TBD**: depósito da marca no e-Marcas
