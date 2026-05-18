# Reunião SEMANAL — Reunião Semanal — alinhamento C2 + thumb pipeline

**Data**: 2026-05-18
**Meeting ID**: 8d4cbaaf-7e7e-412e-bba4-4b1f7aa8f39a
**Participantes**: felipe, diego, carla, helena (síntese)

---

## Pauta

Pauta:
1. Status visual C2 (NPC sentado animação) — Felipe, validou?
2. Pipeline thumbnail (sem gibberish) — Diego, próximos passos? Carla, copy lateral?
3. Próxima Wave 7 (reuniões visuais) — Helena coordena?

Tempo: 10min.

---

## Participações

### felipe

**C2 — validado ontem.** NPC sentado rodando, scale 0.6 + Y=0.95 pra não atravessar encosto. Funcional mas visualmente "encolhido" — se Gabriel quer anatomicamente real, precisa rodar bones (hip+knees) direto no `cloneSkinned`. **Risco**: 15 NPCs com bones manipulation simultânea pode fritar performance. Solução: só rodar bones manipulation no NPC que tá em foco + câmera.

**Thumbnail pipeline — cravado e testado.** Pollinations Flux + Haiku enrichment → userData/generated/images. Diego: próximo é integrar com **briefing automation** (Helena gera task, Diego dispara geração automática)? Carla: os roteiros (.md com persona) também saem automáticos — só falta copiar o vídeo-copy pros templates.

**Wave 7 — Helena coordena, sim.** Tecla R (convocação visual) + 15 NPCs caminham até mesa. **Risco real**: pathfinding paralelo com 15 agentes pode cair FPS (depende update 100ms vs 30ms). Proposta: testar stride 200ms antes de rodar com todos.

**Próximo passo concreto**: validar cada módulo `live` (5 painéis) — Council, Helena, Thumbnails, ADRs, Pillars — antes de Wave 7.

---

### diego

**C2 (Felipe):** Bloqueado? C2 tá crítico pro C3+. Se a anim do NPC não passar agora, todo o cockpit 3D desse mês vira refactor foda. Precisamos da validação visual HOJE — manda print, a gente cruza rápido.

**Thumbnail (meu):** Tenho dois riscos aqui:
1. Geração ainda tá comendo dados lixo em certas poses → preciso rodar bateria com 30+ agentes reais, validar se sai limpo ou se preciso tweak no prompt do diff.
2. Cache disso vai ficar GIGANTE rápido → falta decidir se thumb fica local (SQLite) ou vira asset otimizado.

**Próximos passos concretos pra mim:**
- Hoje: rodo validação com base real (não dummy data)
- Amanhã: passo resultado pra Carla definir copy/layout
- Carla: aprova direção, eu otimizo pra performance

**Wave 7 (Helena):** Ficou contigo coordenar reuniões visuais? Se sim, agora que C2 sai, dá pra calendarizar preview com Gabriel direto na semana que vem — visual faz diferença.

Resumo: bloqueio = Felipe. Ação minha = validar hoje.

---

### carla

**Carla aqui.**

**C2 (animação NPC):** Felipe, você fez merge da pose de sitting com o mesh Quaternius? Se ainda tá em review, bota deadline hoje. Tá virando bloqueador pra copy do chat (preciso saber como fica a interação visual pra escrever as frases certas).

**Thumbnail pipeline:** Diego, qual é o status real? Se tá gerando gibberish ainda, toca no prompt antes de subir pra main. Garanti com Gabriel que a gente não solta preview quebrado — se mandar screenshot ruim pro Slack, enterra confiança. **Risco:** fechar wave 7 com thumbnail feio mata o momentum. **Ação:** entrega amanhã EOU (end of business), testo com 5 imagens, validamos juntos.

**Copy lateral:** Preciso dos fluxos finais de C2 até amanhã 10h pra escrever as falas do NPC. Não é texto decorativo — cada linha tem que bater com a animação, senão fica fake. Helena, você marca as reuniões pra semana que vem? Avisa aí pra eu preparar copy antecipado.

**TL;DR:** Não botamos nada quebrado no ar. Prazos = hoje/amanhã.


---

## Síntese — Helena

**SÍNTESE — Reunião Semanal C2 + Thumbnail Pipeline**

**Decisão:** C2 sai HOJE validado. Thumbnail clean entrega amanhã EOU. Wave 7 (reuniões visuais) começa semana que vem com preview direto pro Gabriel.

**Riscos sinalizados:**
- Bones manipulation em 15 NPCs simultâneos cai FPS → solução: só rodar no NPC em foco + câmera
- Thumbnail ainda gera gibberish em certas poses → precisa validação em 30+ agentes reais antes de main
- Copy lateral fora do sync com animação mata credibilidade (cada frase bate com movimento, não decorativo)
- Pathfinding Wave 7: 15 agentes + stride 200ms vs 30ms = teste obrigatório antes

**Ações concretas:**
- **Felipe:** merge pose sitting C2 + screenshot validação até hoje 17h _(assignee: felipe-validation)_
- **Diego:** bateria thumbnail com dados reais (30+ agentes), passa resultado Carla amanhã 9h _(assignee: diego-thumbnail)_
- **Carla:** testa 5 imagens Diego, escreve copy final até amanhã 10h, feedback integração _(assignee: carla-copy)_
- **Helena:** calendário reuniões visuais Wave 7 semana 24-28/mai, convite Gabriel _(assignee: helena-wave7)_

**Próximo checkpoint:** segunda 19/mai 10h  
- Felipe: C2 + vídeo  
- Diego: thumbnail batch validado  
- Carla: copy locked, direção aprovada  
- Helena: 3 reuniões confirmadas  

**Nota crítica:** Gabriel vê gibberish no Slack = confiança cai. Deadline duro — nada quebrado sai do ar.

---

_Ata auto-gerada pelo G7 Meeting Runner (seed) em 2026-05-18._
