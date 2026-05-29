# lighthouse-runner.ps1
# Gerado por Ana (Analytics) . 2026-05-29
# Roda Lighthouse mobile em 10 rotas do Hayzer e salva JSONs com timestamp.
#
# USO:
#   .\audits\lighthouse-runner.ps1               -- todas as 10 rotas
#   .\audits\lighthouse-runner.ps1 -PublicOnly   -- apenas / e /calculadora
#
# PREREQUISITO:
#   npm install -g lighthouse
#   Criar .env.lighthouse.local na raiz com:
#     LIGHTHOUSE_SESSION_COOKIE=sb-<ref>-auth-token=<valor-devtools>

param(
    [switch]$PublicOnly
)

# ---- Configuracao ----
$BaseUrl = "https://hayzer.com.br"
$RunsDir = Join-Path $PSScriptRoot "lighthouse\runs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmm"

# ---- Criar pasta de runs se nao existir ----
if (-not (Test-Path $RunsDir)) {
    New-Item -ItemType Directory -Path $RunsDir | Out-Null
}

# ---- Carregar cookie do .env.lighthouse.local ----
$Cookie = ""
$EnvFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env.lighthouse.local"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^LIGHTHOUSE_SESSION_COOKIE=(.+)$") {
            $Cookie = $Matches[1]
        }
    }
}

# ---- Definir rotas ----
$PublicRoutes = @(
    @{ slug = "root";        path = "/" },
    @{ slug = "calculadora"; path = "/calculadora" }
)

$AuthRoutes = @(
    @{ slug = "orders";     path = "/orders" },
    @{ slug = "products";   path = "/products" },
    @{ slug = "customers";  path = "/customers" },
    @{ slug = "crm";        path = "/crm" },
    @{ slug = "finance";    path = "/finance" },
    @{ slug = "inventory";  path = "/inventory" },
    @{ slug = "production"; path = "/production" },
    @{ slug = "settings";   path = "/settings" }
)

$RoutesToRun = if ($PublicOnly) { $PublicRoutes } else { $PublicRoutes + $AuthRoutes }

# ---- Avisar sobre cookie ausente ----
if (-not $PublicOnly -and $Cookie -eq "") {
    Write-Warning "LIGHTHOUSE_SESSION_COOKIE nao encontrado em .env.lighthouse.local"
    Write-Warning "Rotas autenticadas vao medir /login, nao a rota real."
    Write-Warning "Criar .env.lighthouse.local com o cookie antes de rodar."
    Write-Host ""
}

# ---- Rodar Lighthouse em cada rota ----
$Results = @()
$Total = $RoutesToRun.Count
$i = 0

foreach ($route in $RoutesToRun) {
    $i++
    $url = "$BaseUrl$($route.path)"
    $outFile = Join-Path $RunsDir "$Timestamp-lighthouse-$($route.slug).json"
    $isAuth = $AuthRoutes | Where-Object { $_.slug -eq $route.slug }

    Write-Host "[$i/$Total] Rodando: $url" -ForegroundColor Cyan

    $lhArgs = @(
        "--form-factor=mobile",
        "--throttling-method=simulate",
        "--throttling.rttMs=40",
        "--throttling.throughputKbps=10240",
        "--throttling.cpuSlowdownMultiplier=4",
        "--output=json",
        "--output-path=$outFile",
        "--chrome-flags=--headless --no-sandbox",
        $url
    )

    if ($isAuth -and $Cookie -ne "") {
        $headerJson = "{""Cookie"": ""$Cookie""}"
        $lhArgs += "--extra-headers=$headerJson"
    }

    & npx lighthouse @lhArgs 2>&1 | Out-Null

    if (Test-Path $outFile) {
        try {
            $json = Get-Content $outFile -Raw | ConvertFrom-Json
            $score = [math]::Round($json.categories.performance.score * 100)
            $tbt   = [math]::Round($json.audits."total-blocking-time".numericValue)
            $lcp   = [math]::Round($json.audits."largest-contentful-paint".numericValue)
            $cls   = $json.audits."cumulative-layout-shift".numericValue
            $fcp   = [math]::Round($json.audits."first-contentful-paint".numericValue)

            $Results += [PSCustomObject]@{
                Rota  = $route.path
                Score = $score
                TBT   = "${tbt}ms"
                LCP   = "${lcp}ms"
                CLS   = $cls
                FCP   = "${fcp}ms"
                JSON  = (Split-Path $outFile -Leaf)
            }

            $isPublic = $route.slug -in @("root","calculadora")
            $color = if ($isPublic) {
                if ($score -ge 90) { "Green" } elseif ($score -ge 75) { "Yellow" } else { "Red" }
            } else {
                if ($score -ge 75) { "Green" } elseif ($score -ge 60) { "Yellow" } else { "Red" }
            }
            Write-Host "   Score: $score | TBT: ${tbt}ms | LCP: ${lcp}ms | CLS: $cls | FCP: ${fcp}ms" -ForegroundColor $color
        } catch {
            Write-Host "   ERRO ao ler JSON: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   ERRO: JSON nao gerado. Chrome/Node instalados?" -ForegroundColor Red
    }

    Write-Host ""
}

# ---- Tabela resumo ----
Write-Host "=============================" -ForegroundColor White
Write-Host "RESUMO LIGHTHOUSE -- BLOCO 3" -ForegroundColor White
Write-Host "=============================" -ForegroundColor White
$Results | Format-Table -AutoSize

Write-Host ""
Write-Host "JSONs em: $RunsDir" -ForegroundColor DarkGray
Write-Host "Mandar JSONs pra Ana para interpretacao completa." -ForegroundColor DarkGray
