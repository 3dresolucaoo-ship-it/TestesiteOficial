# visual-library/ — Biblioteca Visual Hayzer

> O que mora aqui · status · convencoes · issues

## O que tem aqui

9 componentes decorativos da identidade Hayzer. Todos Client Components.
Referencia completa de uso (props, exemplos, quando usar): `README.md`.

| Componente | Arquivo | Proposito |
|---|---|---|
| `TapeBadge` | `TapeBadge.tsx` | Labels de status rotacionados (INTERNO, BETA, WIP) |
| `UnderlineMarker` | `UnderlineMarker.tsx` | Destaque de palavras em headlines |
| `HighlightedText` | `HighlightedText.tsx` | Fundo marca-texto em termos-chave |
| `Stamp` | `Stamp.tsx` | Carimbo circular (APROVADO, BETA, OK) |
| `GrainOverlay` | `GrainOverlay.tsx` | Textura grainy sobre sections/paginas |
| `GlowPetrol` | `GlowPetrol.tsx` | Blob de luz em fundo de sections escuras |
| `RootSvg` | `RootSvg.tsx` | SVG animado das raizes do logo Hayzer |
| `LottiePlayer` | `LottiePlayer.tsx` | Animacoes .json de `public/assets/lottie/` |
| `VideoBackground` | `VideoBackground.tsx` | Video em loop no fundo de sections |

Barrel export via `index.ts`. Sempre importar por `@/components/visual-library`.

## Status atual

- Todos os 9 componentes: funcionando em prod
- Showcase vivo: `/library` (admin only — `ADMIN_EMAILS` env var controla acesso)
- Dep nova instalada: `lottie-react`
- Catalogado por Diego em `design/visual-library-catalog.md` + `design/inspiration-extracts.md`
- `components/CLAUDE.md` tem resumo de status deste diretorio tambem

## Convencoes

- Nenhuma logica de negocio aqui. So visual/decorativo
- Todo componente com texto precisa contraste AA (4.5:1) no fundo onde for usado
- `GrainOverlay` e `GlowPetrol` sao `aria-hidden` por padrao (decorativos)
- Para tokens de cor em `style={}`: sempre usar tokens HSL de `app/globals.css`, nunca hex hardcoded
- O pai de `GlowPetrol` e `VideoBackground` precisa de `position: relative` + `overflow: hidden`
- Assets Lottie ficam em `public/assets/lottie/`. Convencoes de naming: `public/assets/README.md`

## Nao mexer sem avisar

- `index.ts`: barrel export. Adicionar novos componentes aqui ao criar
- `README.md`: documentacao de uso. Atualizar junto com qualquer mudanca de interface

## Como testar

Acessar `hayzer.com.br/library` logado com email admin.
Showcase exibe todos os componentes ao vivo com variantes.

## Relacionados

- `README.md` — referencia completa (props, exemplos, quando usar)
- `app/globals.css` — tokens HSL da paleta Hayzer
- `brand/BRIEF.md` — identidade visual completa
- `design/visual-library-catalog.md` — catalogo de elementos inspecionados
- `components/CLAUDE.md` — status geral da pasta components/

## Ultima atualizacao

2026-05-20 · lia-docs
