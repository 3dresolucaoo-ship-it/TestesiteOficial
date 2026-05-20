# public/landing/v3/ — Assets pra animação concorrentes + landing premium

> Onde você joga arquivos. Não precisa nomear bonito. Eu renomeio + uso.

## 📁 Estrutura

### `concorrentes/` — logos PNG dos concorrentes do maker BR

**Pra que serve**: animação marquee/carteira mostrando "tudo isso o maker paga hoje"

**Formato ideal**:
- PNG fundo transparente
- Quadrado (~80×80 ou maior, vou fazer downscale)
- Nome do arquivo: `bling.png`, `tiny.png`, `conta-azul.png`, etc (kebab-case)

**Lista que CEO mencionou (preencha conforme conseguir)**:
- [ ] `bling.png` (ERP comum maker BR)
- [ ] `tiny.png` (Tiny ERP)
- [ ] `conta-azul.png` (Conta Azul)
- [ ] `ilove3d.png` (calculadora 3D)
- [ ] `manomano.png`
- [ ] `trello.png` (gestão tarefa)
- [ ] `notion.png`
- [ ] `google-sheets.png` (logo Google Sheets oficial)
- [ ] `whatsapp-business.png`

**Bonus** (se conseguir, eleva impacto): cada logo com preço médio mensal R$ ao lado num CSV simples — eu uso no comparativo.

---

### `timelapses/` — vídeos curtos do Bambu A1 imprimindo

**Pra que serve**:
- Background sutil do Hero (com mask preto pra texto legível)
- OU section "How it works" (vídeo 1 + texto ao lado)
- OU loop curto na waitlist

**Formato ideal**:
- MP4 H.264, sem áudio
- 5-15s
- 1080p (otimizo pra web depois)
- Nome: `bambu-imprimindo-1.mp4`, `peca-saindo-3.mp4`

**Como gravar**:
- Celular fixo (tripé, livro, qualquer base)
- Apontado pra base da impressão
- Luz natural ou luz LED branca
- Velocidade 4-8x (timelapse celular faz nativamente)

---

### `fotos-maker/` — fotos do CEO + bancada + peças

**Pra que serve**:
- Section "feito por maker pra maker"
- Foto perfil sobre/contato
- Variações de bancada pra rotacionar Hero

**Formato ideal**:
- JPG 1920×1080 ou mais
- Iluminação natural ou ring light
- Composição: você + Bambu + 3-4 peças impressas visíveis

**Sugestões de tomada**:
- Você sentado na bancada com Bambu A1 funcionando atrás
- Mão segurando peça recém-impressa próxima à câmera (Bambu blur fundo)
- Top-down de 5-6 peças coloridas espalhadas + Bambu no canto

---

### `ai-generated/` — animações IA (Sora, Veo, Pika, Runway)

**Pra que serve**:
- Animação "quebra de carteira" pro pitch comparativo
- Loops abstratos pro Hero secundário
- Efeitos visuais pontuais

**Formato ideal**:
- MP4 4-8s
- Alpha channel se possível (fundo transparente)
- Nome: `carteira-quebra-1.mp4`, `dinheiro-saindo-1.mp4`

**Prompts úteis** (se tu mandar pra IA gerar):
- "Wallet exploding into bills flying away, slow motion, dark background, cinematic"
- "Brazilian Real banknotes falling into a black hole, top-down view, minimalist"
- "Logo crumbling into pixels, dark editorial style, particle effect"

---

## 🚦 Como eu uso depois

Quando você jogar arquivos aqui, eu:
1. Renomeio pra kebab-case se precisar
2. Otimizo (WebP pra imagem, comprimo MP4)
3. Crio component que usa
4. Atualizo este README com onde tá sendo usado

## ❌ NÃO precisa subir

- Logos da Hayzer (já tem em `public/landing/v2/`)
- SVGs maker (já tem)
- Ícones Lucide (uso direto da lib)
