# Dashboard Waitlist Hayzer
> Digest diario automatico. Max 30 entradas. Mais recente no topo.

---

## WAITLIST DIGEST 22/05/2026

Hoje: 0 leads novos nas ultimas 24h
Acumulado: 2 leads (1 real + 1 teste QA)
Ultimo lead real: Gabriel, 15/05 (via direct, desktop)
Crescimento 7d: +2 leads vs semana anterior (que teve 0)
Media diaria 7d: 0.3 leads/dia

UTM source (24h): sem dados
UTM source (acumulado):
- direct: 2 (100%) -- nenhum UTM capturado

Qualificacao:
- Whatsapp preenchido: 2/2 (100%)
- Email confirmado: 0/2 (0%) -- ALERTA
- Segmento preenchido: 0/2 (0%)

Tendencia: insuficiente -- base muito pequena, landing ainda nao em trafego real

ALERTAS TECNICOS:
1. UTM ausente em 100% dos leads -- form da landing nao esta gravando utm_source no Supabase. Corrigir antes de qualquer campanha paga.
2. email_confirmed = false para todos -- fluxo de confirmacao de email (Resend?) nao esta funcionando ou nao foi configurado.
3. Lead de teste QA no banco (audit-1779246218969@hayzer-test.local) -- filtrar @hayzer-test.local nas queries de metricas.

Acao recomendada:
- Prioridade 1: verificar captura de UTMs no form (app/waitlist ou services/waitlistService.ts)
- Prioridade 2: verificar envio de email de confirmacao
- Sem acao de marketing ate corrigir rastreamento

---
