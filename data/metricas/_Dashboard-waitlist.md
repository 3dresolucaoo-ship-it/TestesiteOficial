# Dashboard Waitlist Hayzer
> Arquivo append-only. Manter ultimos 30 dias. Gerado automaticamente pelo digest diario.

---

## 25/05/2026

**Hoje:** 0 leads novos (0 completaram etapa 2 = n/a%)
**Acumulado:** 3 leads totais
**Crescimento 7d:** +100% vs semana anterior (1 -> 2 leads, base pequena)

**UTM source (acumulado):**
- direct: 3 (100%) -- UTM tracking nao capturando parametros

**Qualidade:**
- Step 2 (whatsapp preenchido): 3/3 = 100%
- Email confirmado: 0/3 = 0%
- Score medio: 0 (scoring nao populando)
- Convertidos: 0/3

**Tendencia:** Alta (crescimento semana a semana), mas base muito pequena para ser significativa

**Acoes recomendadas:**
- CRITICO: UTM nao esta sendo capturado. Verificar se os parametros utm_source/utm_medium chegam ao formulario de cadastro. Todos os 3 leads vieram como "direct" -- impossivel saber de onde vieram.
- CRITICO: Logica de scoring retornando 0 para todos os leads. Verificar services/waitlist.
- ATENCAO: 0% de email confirmados. Verificar se o email de confirmacao esta sendo enviado (SMTP / Supabase Auth email).
- INFO: 0 leads nas ultimas 24h -- produto em fase pré-launch (soft launch 11/06), trafego ainda nao ativado.

---
