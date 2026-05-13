---
description: "Relatório de status semanal do projeto BVaz. Helena consolida: o que foi feito, o que travou, próxima semana. Use toda segunda-feira pra alinhar prioridades."
allowed-tools: Task, Read, Glob, Grep, Bash
---

# /team:status — Status Semanal

Helena gera relatório de status da semana.

## Fluxo

### 1. Helena coleta dados objetivos
Lê e analisa:
- `git log --since="1 week ago"` (commits da semana)
- `ROADMAP.md` (items marcados [x] ou novos abertos)
- `decisions/` (ADRs criados na semana)
- `audits/` (auditorias rodadas)
- `brand/BRIEF.md` (mudanças)
- CLAUDE.md de pastas modificadas

### 2. Gera relatório

```
# Status Semanal — BVaz Hub
> Semana <YYYY-WXX> · gerado por Helena · <data>

## 🎯 Foco da semana
<o que foi a prioridade>

## ✅ Entregue
- <feature/correção> · commit: <hash>
- <feature/correção> · commit: <hash>

## 🚧 Em construção
- <feature> · status: <%> · responsável: <squad>

## 🚫 Travado / Bloqueado
- <item> · motivo: <X> · destrava com: <Y>

## 🐛 Bugs abertos críticos
- <bug> · do ROADMAP

## 🆕 Decisões tomadas
- ADR <NNN>: <título>

## 📅 Próxima semana — prioridades
1. <item> — responsável: <squad>
2. <item> — responsável: <squad>
3. <item> — responsável: <squad>

## 📊 Métricas (se aplicável)
- Waitlist atual: <N> emails
- Dias até launch 04/07: <X>
- Sessões Claude usadas: ~<%> do limite semanal

## 🚦 Saúde do projeto
- 🟢 No prazo
- 🟡 Apertado mas factível
- 🔴 Em risco — precisa decisão

## 💭 Aprendizados da semana
- <aprendizado>

## ❓ Decisões pendentes do CEO
- <decisão a tomar>

## 🎯 Recomendação Helena
<o que priorizar pra próxima semana, com justificativa curta>
```

### 3. Salva o relatório
Em `rituals/YYYY-WXX-status.md` (cria pasta `rituals/` se não existir)

## Quando rodar
- Toda **segunda-feira de manhã** (ritual)
- Ou sempre que o CEO pedir "como estamos?"

## Como o CEO consome
Lê o relatório em 2-3 minutos. Decisões pendentes destacadas. Não precisa abrir 10 abas.
