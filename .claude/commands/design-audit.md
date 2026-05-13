---
description: "Audita visual de uma página/componente. Diego checa: contraste, tipografia, espaçamento, mobile, dark mode, anti-IA. Sofia checa: empty states, fluxo, mensagens. Júlia: QA mobile + edge cases."
allowed-tools: Task, Read, Glob, Grep, Bash
---

# /design:audit — Auditoria Visual

Você ativou auditoria visual de uma página/componente.

## O que auditar
$ARGUMENTS

## Fluxo

### 1. Diego — Auditoria de Design
Chama **diego-designer** com brief:
"Audita visualmente: $ARGUMENTS

Verifica:
- [ ] Contraste WCAG AA (4.5:1 texto normal)
- [ ] Sistema de espaçamento 4/8/16/24/32/48
- [ ] Hierarquia tipográfica (3-4 níveis máx)
- [ ] Estados (hover, focus, active, disabled, loading)
- [ ] Dark mode funciona
- [ ] Mobile (320-768px)
- [ ] Auditoria anti-IA: sem gradiente roxo, sem layout centralizado clichê, sem cantos arredondados demais

Reporta problemas com prioridade (crítico/importante/menor)."

### 2. Sofia — Auditoria de UX
Chama **sofia-cs** com brief:
"Audita experiência do usuário em: $ARGUMENTS

Verifica:
- [ ] Empty states existem e educam
- [ ] First-time experience é clara
- [ ] Mensagens de erro são humanas (não 'Error 500')
- [ ] Tooltips/ajuda contextual no momento certo
- [ ] Cancelamento (se aplicável) é sem fricção

Imagina o Rafael (cliente alvo) no celular. Reporta fricção."

### 3. Júlia — QA Mobile + Edge Cases
Chama **julia-qa** com brief:
"Testa: $ARGUMENTS

Checklist:
- Golden path
- Edge cases (input vazio, longo, especial)
- Mobile 320-768px
- Dark mode
- Estados de loading/erro
- Performance (LCP, layout shift)

Reporta bugs com reprodução."

## Saída final pro CEO
```
## Auditoria de <página/componente>

### 🎨 Design (Diego)
- 🔴 Crítico: <problemas>
- 🟡 Importante: <problemas>
- ✅ OK: <items>

### 🤝 UX (Sofia)
- 🔴 Fricção crítica: <pontos>
- 🟡 Melhorias: <pontos>

### 🧪 QA (Júlia)
- 🔴 Bugs: <lista>
- 🟡 Issues: <lista>

### 🚦 Veredito consolidado
- 🟢 Aprovado
- 🟡 Aprovado com correções (corrigir antes do launch)
- 🔴 Reprovado (não lançar)

### Próximas ações priorizadas
1. <ação>
2. <ação>
```
