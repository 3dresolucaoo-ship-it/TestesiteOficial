// scripts/lighthouse-all.mjs
// Gerado: Ana/Analytics 2026-05-21
// USO: node scripts/lighthouse-all.mjs
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(__dirname, "..");
const DATE = new Date().toISOString().slice(0, 10);
const RUNS_DIR = path.join(BASE, "audits", "lighthouse", "runs");
const SUMMARY = path.join(BASE, "audits", "lighthouse", DATE + ".md");

if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });

// Carrega cookie de sessao e base URL
let cookie = "";
let BASE_URL = "https://hayzer.com.br";
const envLocal = path.join(BASE, ".env.lighthouse.local");
if (fs.existsSync(envLocal)) {
  const raw = fs.readFileSync(envLocal, "utf-8");
  const mc = raw.match(/LIGHTHOUSE_SESSION_COOKIE=(.+)/);
  const mu = raw.match(/LIGHTHOUSE_BASE_URL=(.+)/);
  if (mc) cookie = mc[1].trim();
  if (mu) BASE_URL = mu[1].trim();
}

const ONLY_PUBLIC = process.env.LIGHTHOUSE_ONLY_PUBLIC === "true";

if (!cookie && !ONLY_PUBLIC) {
  console.warn("[lighthouse] Sem cookie -- rotas autenticadas ignoradas.");
  console.warn("[lighthouse] Ver protocolo secao 8.3.");
}

const PUBLIC_PATHS = ["/", "/calculadora"];
const AUTHED_PATHS = ONLY_PUBLIC ? [] : ["/orders","/crm","/finance","/production","/inventory","/products","/dashboard","/customers"];

const urls = [
  ...PUBLIC_PATHS.map((rp) => ({ path: rp, auth: false })),
  ...AUTHED_PATHS.map((rp) => ({ path: rp, auth: true })),
];

const results = [];

for (const item of urls) {
  const url = BASE_URL + item.path;
  if (item.auth && !cookie) {
    console.log("[SKIP] " + url);
    results.push({ url, skipped: true });
    continue;
  }
  console.log("[RUN] " + url);
  const slug = item.path.replace(///g, "_").replace(/^_/, "") || "root";
  const jsonOut = path.join(RUNS_DIR, slug + "-" + DATE + ".json");
  const cookieFlag = item.auth ? ("--extra-headers " + JSON.stringify(JSON.stringify({ Cookie: cookie }))) : "";
  try {
    execSync(
      ["npx lighthouse", JSON.stringify(url),"--output=json","--output-path=" + JSON.stringify(jsonOut),"--throttling-method=simulate","--throttling.rttMs=40","--throttling.throughputKbps=10240","--throttling.cpuSlowdownMultiplier=4","--emulated-form-factor=mobile","--only-categories=performance","--chrome-flags=\"--headless --no-sandbox\"","--quiet",cookieFlag].filter(Boolean).join(" "),
      { stdio: "pipe" }
    );
    const report = JSON.parse(fs.readFileSync(jsonOut, "utf-8"));
    const aud = report.audits;
    const score = Math.round(report.categories.performance.score * 100);
    const lcp = Math.round(aud["largest-contentful-paint"].numericValue);
    const tbt = Math.round(aud["total-blocking-time"].numericValue);
    const cls = parseFloat(aud["cumulative-layout-shift"].numericValue).toFixed(3);
    const fcp = Math.round(aud["first-contentful-paint"].numericValue);
    console.log("  Score:" + score + " LCP:" + lcp + "ms TBT:" + tbt + "ms CLS:" + cls);
    results.push({ url, auth: item.auth, score, lcp, tbt, cls, fcp });
  } catch (err) {
    console.error("[ERRO] " + url + ": " + err.message.slice(0,120));
    results.push({ url, auth: item.auth, error: true });
  }
}

// Gera summary markdown
const icon = (v, good, warn) => v <= good ? "[ok]" : v <= warn ? "[aviso]" : "[CRITICO]";

const tableRows = results.map((r) => {
  if (r.skipped) return "| " + r.url + " | -- | SKIP | -- | -- | -- |";
  if (r.error) return "| " + r.url + " | -- | ERRO | -- | -- | -- |";
  return "| " + r.url + " | " + r.score + " | " + icon(r.lcp,2500,4000) + " " + r.lcp + "ms | " + icon(r.tbt,300,600) + " " + r.tbt + "ms | " + icon(parseFloat(r.cls),0.10,0.25) + " " + r.cls + " | " + r.fcp + "ms |";
});

const critical = results.filter((r) => !r.skipped && !r.error && (r.lcp > 4000 || r.tbt > 600 || parseFloat(r.cls) > 0.25));
const actionLines = critical.length === 0
  ? ["Nenhuma rota em zona critica."]
  : critical.map((r) => {
      const issues = [];
      if (r.lcp > 4000) issues.push("LCP " + r.lcp + "ms");
      if (r.tbt > 600) issues.push("TBT " + r.tbt + "ms");
      if (parseFloat(r.cls) > 0.25) issues.push("CLS " + r.cls);
      return r.url + ": " + issues.join(", ");
    });

const md = [
  "# Lighthouse Run -- " + DATE,"",
  "> Throttling: mobile-br-realista (4G 10Mbps, CPU 4x, viewport 390px)",
  "> Gerado por scripts/lighthouse-all.mjs","",
  "## Resultados","",
  "| URL | Score | LCP | TBT | CLS | FCP |",
  "|---|---|---|---|---|---|",
  ...tableRows,"",
  "## Legenda",
  "- [ok] Meta good","- [aviso] Zona OK","- [CRITICO] Fora de meta","",
  "## Acoes",
  ...actionLines.map((l) => "- " + l),
].join("
");

fs.writeFileSync(SUMMARY, md, "utf-8");
console.log("
[DONE] audits/lighthouse/" + DATE + ".md");

// Sai com erro se rota publica em zona critica (bloqueia CI)
const publicCritical = results.filter((r) => !r.skipped && !r.error && !r.auth && (r.lcp > 4000 || r.tbt > 600 || parseFloat(r.cls) > 0.25));
if (publicCritical.length > 0) {
  console.error("[CI BLOCK] Rota publica critica. Merge bloqueado.");
  process.exit(1);
}
