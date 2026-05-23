# Dashboard Waitlist Hayzer
> Digest diario automatico. Append-only. Manter ultimos 30 registros.

---

## 23/05/2026

Hoje: 1 lead (1 completou perfil = 100% | 0 confirmaram email = 0%)
Acumulado: 3 leads totais
Crescimento 7d: +100% (2 esta semana vs 1 semana anterior)

UTM source (24h):
- direct: 1 (100%)
- linkedin: 0
- whatsapp: 0
- organic: 0

UTM source (acumulado):
- direct: 3 (100%) -- todos sem UTM capturado

Tendencia: alta vs media 7d (+1 lead ontem vs media 0.28/dia)

Acoes recomendadas:
- UTM tracking nao esta sendo capturado (100% aparece como "direct"). Verificar se parametros utm_* estao chegando na API de cadastro /api/waitlist. Sem isso, nao tem dado de canal.
- Email confirmation: 0 de 3 leads confirmaram email. Verificar se trigger de envio esta ativo no Supabase ou se rota de confirmacao esta quebrada.
- Volume baixo (3 total): metricas percentuais nao sao estatisticamente relevantes ainda. Foco no crescimento absoluto por agora.

---
