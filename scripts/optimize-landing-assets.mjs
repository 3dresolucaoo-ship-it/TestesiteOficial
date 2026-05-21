// scripts/optimize-landing-assets.mjs
// Bruna/Backend — 2026-05-21
// USO: node scripts/optimize-landing-assets.mjs
// Gera 36 WebPs (3 variantes por asset) de 12 PNGs da landing v3
// NÃO toca nos PNGs originais em animation-carteira/

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'public', 'landing', 'v3', 'animation-carteira');
const OUT_DIR = path.join(ROOT, 'public', 'landing', 'v3', 'optimized');

// Assets alvo: [source, targetName]
// Skipped (erro texto IA): carteira organizada v1, v2, v3
const ASSETS = [
  ['Carteira rasgada v2.png',                          'carteira-rasgada'],
  ['carteira organizada v4.png',                       'carteira-organizada'],
  ['Print celular whats v5.png',                       'whats-bagunca'],
  ['maker triste e cansado e maker tranquilo.png',     'maker-antes-depois'],
  ['timelaspe.png',                                    'timelapse-impressora'],
  ['cliente final v1.png',                             'cliente-mulher-mestre'],
  ['cliente final v2.png',                             'cliente-mulher-clean'],
  ['produto laptop v3.png',                            'produto-laptop'],
  ['produto laptop v2.png',                            'produto-laptop-pedidos'],
  ['Carteira rasgada v1.png',                          'carteira-rasgada-dark'],
  ['Print celular whats v1.png',                       'whats-bagunca-alt'],
  ['Print celular whats v3.png',                       'whats-bagunca-alt2'],
];

// Variantes: [sufixo, largura-max, qualidade]
const VARIANTS = [
  ['1920w', 1920, 80],
  ['1080w', 1080, 75],
  ['480w',  480,  70],
];

// Cria diretório de saída se não existir
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Diretório criado: ${OUT_DIR}`);
}

const results = [];
let totalSrcBytes = 0;
let totalOutBytes = 0;

console.log('=== optimize-landing-assets.mjs ===');
console.log(`Fonte:  ${SRC_DIR}`);
console.log(`Saída:  ${OUT_DIR}`);
console.log(`Assets: ${ASSETS.length} PNGs -> ${ASSETS.length * VARIANTS.length} WebPs\n`);

for (const [srcFile, targetName] of ASSETS) {
  const srcPath = path.join(SRC_DIR, srcFile);

  if (!fs.existsSync(srcPath)) {
    console.error(`[SKIP] Arquivo não encontrado: ${srcFile}`);
    continue;
  }

  const srcSize = fs.statSync(srcPath).size;
  totalSrcBytes += srcSize;

  const assetResults = [];

  for (const [suffix, maxWidth, quality] of VARIANTS) {
    const outFile = `${targetName}-${suffix}.webp`;
    const outPath = path.join(OUT_DIR, outFile);

    try {
      await sharp(srcPath)
        .resize({
          width: maxWidth,
          withoutEnlargement: true, // não upscala se original for menor
          fit: 'inside',
        })
        .webp({ quality })
        .toFile(outPath);

      const outSize = fs.statSync(outPath).size;
      totalOutBytes += outSize;
      assetResults.push({ suffix, outFile, outSize });
    } catch (err) {
      console.error(`[ERROR] ${outFile}: ${err.message}`);
    }
  }

  const srcKB  = Math.round(srcSize / 1024);
  const sumOut = assetResults.reduce((acc, r) => acc + r.outSize, 0);
  const sumKB  = Math.round(sumOut / 1024);
  const ratio  = srcSize > 0 ? Math.round((1 - sumOut / (srcSize * VARIANTS.length)) * 100) : 0;

  console.log(`[OK] ${srcFile}`);
  console.log(`     Original: ${srcKB}KB`);
  assetResults.forEach(r => {
    console.log(`     -> ${r.outFile}: ${Math.round(r.outSize / 1024)}KB`);
  });
  console.log(`     3 variantes somadas: ${sumKB}KB | -${ratio}% vs ${VARIANTS.length}x original\n`);

  results.push({
    srcFile,
    targetName,
    srcKB,
    variants: assetResults.map(r => ({
      name: r.outFile,
      kb: Math.round(r.outSize / 1024),
    })),
    totalVariantsKB: sumKB,
    ratioVsTriple: ratio,
  });
}

const totalSrcKB = Math.round(totalSrcBytes / 1024);
const totalOutKB = Math.round(totalOutBytes / 1024);
const totalRatio = totalSrcBytes > 0
  ? Math.round((1 - totalOutBytes / (totalSrcBytes * VARIANTS.length)) * 100)
  : 0;

console.log('=== RESUMO ===');
console.log(`Total original (12 PNGs):          ${totalSrcKB}KB (${Math.round(totalSrcKB/1024 * 10)/10}MB)`);
console.log(`Total WebPs gerados (36 arquivos):  ${totalOutKB}KB (${Math.round(totalOutKB/1024 * 10)/10}MB)`);
console.log(`Redução vs 36× originais:           -${totalRatio}%`);
console.log(`Meta <2MB (36 arquivos):             ${totalOutKB <= 2048 ? 'ATINGIDA' : 'NAO ATINGIDA'} (${Math.round(totalOutKB/1024 * 10)/10}MB)`);

// Serializa resultado pra o gerador de audit usar
const reportPath = path.join(ROOT, 'audits', '_landing-assets-tmp.json');
fs.writeFileSync(reportPath, JSON.stringify({ results, totalSrcKB, totalOutKB, totalRatio }, null, 2));
console.log(`\nDados salvos em: ${reportPath}`);
console.log('Pronto. Rode `node scripts/generate-assets-audit.mjs` pra gerar o audit markdown.');
