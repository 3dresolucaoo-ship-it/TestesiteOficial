# 02 · Empty State · Impressora 3D criando muda

## Onde usar
- `/orders` quando nenhum pedido criado ainda
- `/products` quando catálogo vazio
- `/inventory` quando sem filamento cadastrado
- Substituindo ícone genérico em `<EmptyState>` da `components/visual-library`

## Mood
Mostra que Hayzer é maker 3D BR. Impressora criando algo simbólico: filamento verde virando muda. Mensagem visual: "começa daqui, vai crescer".

## Prompt EN (pra colar na IA de vídeo)

```
3D render of a small clay-textured 3D printer slowly extruding a single emerald filament thread into the air, the thread curling and forming a tiny seedling shape, soft studio lighting, isometric angle, deep petrol-teal background, hyperrealistic detail on the nozzle and filament texture, slow motion, looping seamlessly, 5 second loop, no text, no logo
```

## Variações pra testar

**Variação A — frontal:**
```
Front view of miniature 3D printer extruding emerald filament that morphs into a seedling, slow motion, petrol-teal void, soft light from above
```

**Variação B — close-up nozzle:**
```
Extreme close-up macro of 3D printer nozzle extruding glowing emerald filament drop by drop, hyperreal liquid texture, dramatic side light, petrol void background
```

## Formato alvo
- `.webm` com alpha (transparente, pra sobrepor em UI)
- 720x720 (quadrado, cabe em card)
- Peso: 500 KB máx
- Duração: 4-5 segundos loop

## Critérios de aprovação
- [ ] Impressora reconhecível (Bambu Lab / Ender / Prusa style)
- [ ] Filamento verde esmeralda
- [ ] Muda emerge do filamento (sem CGI artificial demais)
- [ ] Background neutro ou transparente
- [ ] Sem brand de impressora visível (evitar problema de copyright)

## Onde anotar resultados
Ver [iteracoes.md](./iteracoes.md)
