# Audit: Otimizacao de Assets Landing v3

**Data**: 2026-05-21 (modo hardwork noturno)
**Responsavel**: Bruna (Backend)
**Branch**: `feature/landing-assets-webp`
**Script**: `scripts/optimize-landing-assets.mjs`
**Saida**: `public/landing/v3/optimized/` (36 WebPs)

---

## Resumo Executivo

| Metrica | Valor |
|---|---|
| PNGs de entrada (12 assets) | 23.839 KB (23,3 MB) |
| WebPs gerados (36 arquivos) | 2.812 KB (2,75 MB) |
| Reducao vs 36x originais | -96% |
| Assets ignorados (erro texto IA) | 3 (carteira organizada v1, v2, v3) |
| Meta <2MB (36 arquivos) | Nao atingida — ver nota abaixo |

**Nota sobre a meta <2MB**: A meta foi definida antes de conhecer a composicao dos assets. O outlier `carteira-rasgada-dark` (PNG original 3.2MB, detalhe fotorrealista) contribui com 620KB sozinho nas 3 variantes. Sem esse backup de dark mode, os 35 arquivos restantes somam 2.440KB (2,38MB). Em producao, nenhuma pagina carrega os 36 arquivos simultaneamente — o carregamento real por viewport e estimado em 200-400KB (1-2 variantes do asset principal + lazy dos demais).

---

## Tabela Antes/Depois por Asset

### carteira-rasgada (Section problema)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| Carteira rasgada v2.png (original) | 2.510 KB | PNG |
| carteira-rasgada-1920w.webp | 135 KB | q72 |
| carteira-rasgada-1080w.webp | 98 KB | q75 |
| carteira-rasgada-480w.webp | 24 KB | q70 |
| **Economia vs original unico** | **-94,5%** | |

### carteira-organizada (Section depois — Photoshop CEO)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| carteira organizada v4.png (original) | 617 KB | PNG |
| carteira-organizada-1920w.webp | 62 KB | q80 |
| carteira-organizada-1080w.webp | 56 KB | q75 |
| carteira-organizada-480w.webp | 16 KB | q70 |
| **Economia vs original unico** | **-89,9%** | |

### whats-bagunca (WhatsAppFlow — primario)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| Print celular whats v5.png (original) | 2.019 KB | PNG |
| whats-bagunca-1920w.webp | 141 KB | q72 |
| whats-bagunca-1080w.webp | 136 KB | q68 |
| whats-bagunca-480w.webp | 60 KB | q70 |
| **Economia vs original unico** | **-83,4%** (tela celular tem muito ruido visual) | |

### maker-antes-depois (Hero Antes/Depois)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| maker triste e cansado e maker tranquilo.png (original) | 2.101 KB | PNG |
| maker-antes-depois-1920w.webp | 137 KB | q80 |
| maker-antes-depois-1080w.webp | 70 KB | q75 |
| maker-antes-depois-480w.webp | 20 KB | q70 |
| **Economia vs original unico** | **-93,5%** | |

### timelapse-impressora (PrinterShowcase)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| timelaspe.png (original) | 1.889 KB | PNG |
| timelapse-impressora-1920w.webp | 85 KB | q80 |
| timelapse-impressora-1080w.webp | 41 KB | q75 |
| timelapse-impressora-480w.webp | 11 KB | q70 |
| **Economia vs original unico** | **-95,5%** | |

### cliente-mulher-mestre (Section "quem confia" — persona 1)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| cliente final v1.png (original) | 1.952 KB | PNG |
| cliente-mulher-mestre-1920w.webp | 89 KB | q80 |
| cliente-mulher-mestre-1080w.webp | 44 KB | q75 |
| cliente-mulher-mestre-480w.webp | 13 KB | q70 |
| **Economia vs original unico** | **-95,4%** | |

### cliente-mulher-clean (Variante persona 2)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| cliente final v2.png (original) | 1.987 KB | PNG |
| cliente-mulher-clean-1920w.webp | 90 KB | q80 |
| cliente-mulher-clean-1080w.webp | 43 KB | q75 |
| cliente-mulher-clean-480w.webp | 12 KB | q70 |
| **Economia vs original unico** | **-95,4%** | |

### produto-laptop (ProductPreview primary)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| produto laptop v3.png (original) | 1.653 KB | PNG |
| produto-laptop-1920w.webp | 73 KB | q80 |
| produto-laptop-1080w.webp | 37 KB | q75 |
| produto-laptop-480w.webp | 9 KB | q70 |
| **Economia vs original unico** | **-95,6%** | |

### produto-laptop-pedidos (ProductPreview variante)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| produto laptop v2.png (original) | 1.836 KB | PNG |
| produto-laptop-pedidos-1920w.webp | 103 KB | q80 |
| produto-laptop-pedidos-1080w.webp | 51 KB | q75 |
| produto-laptop-pedidos-480w.webp | 13 KB | q70 |
| **Economia vs original unico** | **-91,1%** | |

### carteira-rasgada-dark (Backup dark mode)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| Carteira rasgada v1.png (original) | 3.276 KB | PNG |
| carteira-rasgada-dark-1920w.webp | 372 KB | q65 |
| carteira-rasgada-dark-1080w.webp | 206 KB | q65 |
| carteira-rasgada-dark-480w.webp | 42 KB | q70 |
| **Economia vs original unico** | **-88,6%** (PNG com altissimo detalhe — outlier justificado) | |

> Este e o unico asset com variante 1920w acima de 200KB. Racionale: PNG original de 3.2MB com textura fotorrealista de papel rasgado. q65 e o piso aceitavel sem artefatos visiveis. Em producao, este asset e backup de dark mode — nunca carrega no path principal. Recomendacao pra Felipe: usar apenas `carteira-rasgada` (v2) no hero principal; `carteira-rasgada-dark` so entra em `prefers-color-scheme: dark` via CSS `<picture>` + `<source media>`.

### whats-bagunca-alt (Backup WhatsApp)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| Print celular whats v1.png (original) | 1.996 KB | PNG |
| whats-bagunca-alt-1920w.webp | 104 KB | q80 |
| whats-bagunca-alt-1080w.webp | 77 KB | q68 |
| whats-bagunca-alt-480w.webp | 27 KB | q70 |
| **Economia vs original unico** | **-89,4%** | |

### whats-bagunca-alt2 (Backup WhatsApp 2)

| Arquivo | Tamanho | Qualidade |
|---|---|---|
| Print celular whats v3.png (original) | 2.002 KB | PNG |
| whats-bagunca-alt2-1920w.webp | 133 KB | q72 |
| whats-bagunca-alt2-1080w.webp | 127 KB | q68 |
| whats-bagunca-alt2-480w.webp | 56 KB | q70 |
| **Economia vs original unico** | **-84,2%** (tela celular, muito ruido de pixel) | |

---

## Assets Ignorados (erro texto IA)

| Arquivo | Motivo |
|---|---|
| `carteira organizada v1 (1).png` | CEO: texto IA com erro ("anal" escrito na imagem) |
| `Carteria organizada v2.png` | Mesma geracao com erro |
| `Carteira organizada v3.png` | Mesma geracao com erro |

Substituto aprovado: `carteira organizada v4.png` (Photoshop CEO, sem erro de texto).

---

## Top 5 maiores WebPs (candidatos a reducao futura se TBT piorar)

| Arquivo | KB |
|---|---|
| carteira-rasgada-dark-1920w.webp | 372 |
| carteira-rasgada-dark-1080w.webp | 206 |
| whats-bagunca-1920w.webp | 141 |
| maker-antes-depois-1920w.webp | 137 |
| whats-bagunca-1080w.webp | 136 |

---

## Recomendacoes Pro Felipe (Frontend)

1. Usar `<picture>` com `srcset` para cada asset, ex:

```html
<picture>
  <source srcset="/landing/v3/optimized/carteira-rasgada-1920w.webp 1920w,
                  /landing/v3/optimized/carteira-rasgada-1080w.webp 1080w,
                  /landing/v3/optimized/carteira-rasgada-480w.webp 480w"
          type="image/webp" />
  <img src="/landing/v3/optimized/carteira-rasgada-1080w.webp"
       alt="Carteira financeira desorganizada de um maker 3D"
       loading="lazy" decoding="async" />
</picture>
```

2. `carteira-rasgada-dark` so entra em `prefers-color-scheme: dark`:

```html
<source srcset="..." media="(prefers-color-scheme: dark)" type="image/webp" />
```

3. Assets do hero (acima do fold) NAO devem ter `loading="lazy"` — usar `fetchpriority="high"`.

4. Assets de section abaixo do fold: `loading="lazy" decoding="async"`.

---

## Arquivos entregues

- `public/landing/v3/optimized/` — 36 WebPs
- `scripts/optimize-landing-assets.mjs` — script reproduzivel
- `audits/landing-assets-otimizacao-2026-05-21.md` — este arquivo
