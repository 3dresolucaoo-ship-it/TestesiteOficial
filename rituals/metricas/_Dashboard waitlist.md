# Dashboard Waitlist Hayzer
> Append diario automatico. Manter ultimos 30 dias. Fonte: Supabase `waitlist_leads`.
> Nota: arquivo original em `Contextos Projetos/07 - Metricas/` (OneDrive) nao acessivel neste ambiente. Esta copia serve como espelho no repo.

---

## 08/06/2026

**Hoje:** 0 leads (0 completaram etapa 2 = n/a)
**Acumulado:** 3 leads totais
**Crescimento 7d:** 0 leads (sem variacao -- funil parado ha 16 dias)
**Score medio:** 0.0 | **Email confirmados:** 0 (0%)

**UTM source (acumulado):**
- direct: 3 (100%) -- nenhum link com UTM rastreado ate agora

**Tendencia:** baixa -- 0 leads nos ultimos 7 dias, ultimo lead em 23/05

**Alertas:**
- CRITICO: Funil parado ha 16 dias. Soft launch em 5 dias (13/06). Acao imediata necessaria.
- ALTO: Step 2 = 0% de conclusao. Verificar se o formulario de qualificacao esta ativo e funcionando em prod.
- ALTO: 0 emails confirmados. Testar fluxo de confirmacao (Resend + Supabase Auth).
- MEDIO: UTM 100% direct. Nenhuma campanha ativa com link rastreado.

**Acoes recomendadas:**
1. Postar no WhatsApp Beta + LinkedIn com link UTM configurado (`?utm_source=whatsapp&utm_campaign=soft-launch`)
2. Testar fluxo completo da waitlist em prod: step 1 -> step 2 -> email confirmacao
3. Verificar logs de email (Resend dashboard) -- possivel falha silenciosa no envio

---

<!-- proximo append: 09/06/2026 -->
