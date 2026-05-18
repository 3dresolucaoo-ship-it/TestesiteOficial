# public/assets — Biblioteca de Assets Hayzer

Pasta central de assets estáticos que alimentam os componentes de `components/visual-library/`.

---

## Estrutura

### `videos/`
Fundos cinematograficos em loop para VideoBackground.tsx.

Formatos aceitos: `.mp4` (H.264, fallback universal) + `.webm` (VP9, menor tamanho).
Sempre fornecer os dois formatos para o mesmo conteudo: `nome.mp4` + `nome.webm`.

Naming convention: `[contexto]-[descricao]-[resolucao].ext`
Exemplos: `hero-roots-organic-1080p.mp4`, `dashboard-particles-720p.webm`

Tamanho maximo recomendado: 5 MB por arquivo (videos em loop curto, 3-8s).
Compressao sugerida: HandBrake CRF 28 (mp4) / VP9 CQ 35 (webm).

### `lottie/`
Animacoes JSON exportadas do LottieFiles / After Effects (plugin Bodymovin).

Naming convention: `[categoria]-[nome].json`
Exemplos: `loader-dots.json`, `icon-check.json`, `bg-roots-growing.json`

Tamanho maximo: 150 KB por arquivo (preferir shapes simples, sem assets embutidos em base64).
Use LottiePlayer.tsx para renderizar.

### `png/`
Imagens decorativas, ilustrativas ou de produto.

Naming convention: `[tipo]-[descricao]-[tamanho].png`
Exemplos: `decor-grain-overlay-512.png`, `product-mockup-dashboard-800.png`

Preferir imagens com fundo transparente (PNG-32) quando decorativas.
Tamanho maximo recomendado: 500 KB. Para fotos/mockups maiores, usar Next.js Image com otimizacao automatica.

### `illustrations/`
Ilustracoes SVG maiores (cenas, onboarding, estados vazios).

Naming convention: `[contexto]-[descricao].svg`
Exemplos: `onboarding-welcome.svg`, `empty-orders.svg`, `brand-roots-pattern.svg`

SVGs devem ser limpos (sem IDs duplicados, sem estilos inline desnecessarios).
Para animacao em SVG, usar RootSvg.tsx (Framer Motion stroke-dasharray).

---

## Regras gerais

1. Nunca colocar assets com dados sensiveis ou WIP de marca nao protocolado
2. Otimizar ANTES de commitar (squoosh.app para PNG, svgo para SVG)
3. Todo asset usado em producao precisa de referencia no README do componente que o usa
4. Assets experimentais vao em `mockups/` (nao aqui)
