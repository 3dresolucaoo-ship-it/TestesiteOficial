# Hayzer · Banco de prompts de vídeo IA

> Sistema organizado pra cada ideia de vídeo cinematográfico 3D do Hayzer. CEO gera com IA (Sora, Kling, Runway, Veo, Luma, Hailuo), anota o resultado, aprovado vai pra `final/`, descartado pra `descartados/` (não joga fora, aprende).
>
> **Criado**: 2026-05-18 · **Dono**: CEO Gabriel cria, Carla revisa copy, Diego revisa visual, Felipe integra no site

---

## Como usar este banco

### Pra você (CEO)
1. Escolhe uma das 7 ideias abaixo
2. Abre `prompt.md` da ideia
3. Copia o prompt EN no input da IA de vídeo
4. Gera (Sora, Kling, Runway, Veo 3, Luma Dream Machine, Hailuo MiniMax)
5. **Anota em `iteracoes.md`** o resultado em 1 linha: "Sora v1: muito escuro, ajustei iluminação"
6. Quando aprovar: salva `.mp4` + `.webm` em `final/`
7. Não aprovado: salva em `descartados/` com motivo (aprendizado serve)
8. Me avisa "tem vídeo aprovado pra X" e Felipe integra no site

### Pra mim (Claude)
1. Não posso GERAR vídeo (nenhum LLM pode hoje)
2. Posso REFINAR prompts baseado no resultado que você anotou
3. Posso INTEGRAR `.mp4`/`.webm` aprovado nos componentes `VideoBackground` da `components/visual-library/`
4. Acompanho `iteracoes.md` toda sessão e refino o prompt se a IA tá errando

---

## Catálogo das 7 ideias

| # | Pasta | Onde usaria | Status |
|---|---|---|---|
| 01 | `01-hero-roots-seedling/` | Hero da landing OU dashboard | 🔵 pendente |
| 02 | `02-empty-state-printer/` | Empty states `/orders`, `/products` | 🔵 pendente |
| 03 | `03-loader-liquid-h/` | Transições, loading states | 🔵 pendente |
| 04 | `04-meta-batida-celebration/` | Notificação celebratória (meta financeira batida) | 🔵 pendente |
| 05 | `05-login-roots-system/` | Tela de login / hero principal | 🔵 pendente |
| 06 | `06-background-ambient/` | Fundo do dashboard, opacity 20% | 🔵 pendente |
| 07 | `07-product-360-rotation/` | Cards de produto no catálogo público | 🔵 pendente |

**Legenda status**:
- 🔵 pendente (nenhuma versão gerada ainda)
- 🟡 testando (1+ versão gerada, ajustando)
- 🟢 aprovado (final/ tem arquivo, pronto pra integrar)
- 🔴 abandonado (não vale o esforço)

---

## Formatos ideais por uso (Felipe integra fácil)

| Uso | Formato | Peso máx | Resolução |
|---|---|---|---|
| Hero/fundo página inteira | `.webm` ou `.mp4 H.264` | 2-3 MB | 1920x1080 |
| Elemento decorativo card | `.webm` com alpha | 500 KB | 720x720 |
| Loader pequeno | `.json` Lottie | 50 KB | qualquer |
| Empty state ilustração | `.webm` ou `.gif` curto | 300 KB | 600x600 |

Se a IA exporta só `.mp4`, eu converto pra `.webm` via FFmpeg quando você me passar.

---

## Onde os arquivos finais entram no projeto

Após aprovar:
- Copio o `.mp4`/`.webm` pra `public/assets/videos/<nome-da-ideia>.mp4`
- Felipe wraps no componente `<VideoBackground src="/assets/videos/X" />` da `components/visual-library/`
- Aplica no lugar combinado (hero, empty state, etc)

Lottie segue mesma lógica mas pasta `public/assets/lottie/` e wrapper `<LottiePlayer src="/assets/lottie/X.json" />`.

---

## IAs de vídeo recomendadas (você escolhe pela qualidade)

| IA | Forte em | Preço |
|---|---|---|
| **Sora** (OpenAI) | Cinematográfico, físico real | Pago |
| **Kling 2.0** | Render 3D limpo | Free tier generoso |
| **Runway Gen-3** | Motion design | Pago |
| **Veo 3** (Google) | Realismo brutal | Pago |
| **Luma Dream Machine** | Câmera estilizada | Free tier |
| **Hailuo MiniMax** | 3D abstrato | Free |

---

## Histórico

- **2026-05-18**: banco criado a partir do brainstorm CEO+Claude. 7 ideias estruturadas. Aguardando primeiras gerações.
