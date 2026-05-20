/**
 * app/dashboard/v4/page.tsx — Sandbox V4.8 (dados reais com fallback mockado)
 *
 * Rota ISOLADA para desenvolvimento e validacao visual sem tocar em
 * app/dashboard/page.tsx (prod com dados reais).
 *
 * Fase 2 (21/05/2026): conecta getDashboardData quando usuario autenticado.
 * Fallback: dados mockados quando nao autenticado (qualquer um pode ver visualmente).
 *
 * Regra: NAO redireciona para /login — sandbox deve ser acessivel sem auth.
 * Prod (/dashboard) tem o redirect obrigatorio.
 *
 * Server Component: passa DashboardData para DashboardLayout (Client).
 * CSS V4: importado via globals-v4.css.
 *
 * Ref: decisions/014-dashboard-v4-plano-execucao.md
 * Mockup aprovado: mockups/dashboard/v4-hibrido.html
 */

import { Suspense }           from 'react'
import { DashboardLayout }    from '@/components/dashboard/v4'
import { getUser }            from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseServer'
import { getDashboardData }   from '@/services/dashboard'
import type { DashboardData } from '@/components/dashboard/v4/types'
import '../../globals-v4.css'

// ---------------------------------------------------------------------------
// Dados mockados — replica valores do mockup aprovado (v4-hibrido.html)
// ---------------------------------------------------------------------------

const MOCK_DATA: DashboardData = {
  userName: 'Gabriel',
  projectId: 'mock-resolucao-3d',

  cover: {
    revenue:             12480,
    monthlyTarget:       18000,
    progressPercent:     69,
    remaining:           5520,
    daysLeft:            11,
    revenueVsLastMonth:  26.8,
    ordersCount:         47,
    weekLabel:           'sem 03',
    lastUpdatedMin:      3,
  },

  satellites: [
    {
      key:            'lucro',
      label:          'Lucro liquido',
      meta:           'receita - custos diretos',
      displayValue:   'R$ 8.590',
      deltaText:      '▲ +26,7% vs abr',
      deltaDirection: 'up',
      highlight:      true,
    },
    {
      key:            'margem',
      label:          'Margem media',
      meta:           'pedidos fechados',
      displayValue:   '68,8%',
      deltaText:      '▲ +4,2pp vs abr',
      deltaDirection: 'up',
      highlight:      false,
    },
    {
      key:            'custos',
      label:          'Custos diretos',
      meta:           'filamento + energia',
      displayValue:   'R$ 3.890',
      deltaText:      '▲ +12% vs abr',
      deltaDirection: 'up',
      highlight:      false,
    },
    {
      key:            'pedidos',
      label:          'Pedidos fechados',
      meta:           'mes atual · pago+entregue',
      displayValue:   '47',
      deltaText:      '▲ +8 vs abr',
      deltaDirection: 'up',
      highlight:      false,
    },
  ],

  nextAction: {
    message:    'Seu <strong>PLA Preto Voolt</strong> acaba em 3 dias no ritmo atual. Ultimo pedido foi R$ 89/kg na Voolt.',
    ctaLabel:   'Comprar agora',
    ctaHref:    '/inventory',
    onCtaClick: undefined,
    onDismiss:  undefined,
  },

  donutSegments: [
    { channel: 'WhatsApp',      revenuePercent: 46, marginPercent: 88, channelFee: 0,    color: 'hsl(173 58% 28%)' },
    { channel: 'Mercado Livre', revenuePercent: 28, marginPercent: 67, channelFee: 12,   color: 'hsl(173 43% 45%)' },
    { channel: 'Shopee',        revenuePercent: 14, marginPercent: 62, channelFee: 14,   color: 'hsl(28 60% 55%)' },
    { channel: 'Instagram',     revenuePercent: 8,  marginPercent: 80, channelFee: 0,    color: 'hsl(28 47% 68%)' },
    { channel: 'Outros',        revenuePercent: 4,  marginPercent: 58, channelFee: 16.5, color: 'hsl(40 12% 55%)' },
  ],

  monthBars: [
    { monthLabel: 'DEZ', value: 5820,  heightPercent: 47,  isCurrent: false },
    { monthLabel: 'JAN', value: 7340,  heightPercent: 59,  isCurrent: false },
    { monthLabel: 'FEV', value: 6280,  heightPercent: 50,  isCurrent: false },
    { monthLabel: 'MAR', value: 9850,  heightPercent: 79,  isCurrent: false },
    { monthLabel: 'ABR', value: 9840,  heightPercent: 79,  isCurrent: false },
    { monthLabel: 'MAI', value: 12480, heightPercent: 100, isCurrent: true  },
  ],

  queueDays: [
    { dayLabel: 'SEG', jobCount: 4,  heightPercent: 57,  isToday: false },
    { dayLabel: 'TER', jobCount: 7,  heightPercent: 100, isToday: false },
    { dayLabel: 'QUA', jobCount: 5,  heightPercent: 71,  isToday: false },
    { dayLabel: 'QUI', jobCount: 6,  heightPercent: 86,  isToday: false },
    { dayLabel: 'SEX', jobCount: 3,  heightPercent: 43,  isToday: false },
    { dayLabel: 'SAB', jobCount: 2,  heightPercent: 29,  isToday: false },
    { dayLabel: 'HOJE', jobCount: 3, heightPercent: 43,  isToday: true  },
  ],

  activePrintJobs: [
    {
      printer:         'Bambu Lab X1-Carbon',
      itemName:        'Suporte Parede 3D · x4',
      clientName:      'Marcos Oliveira',
      remainingTime:   '3h12min',
      progressPercent: 68,
    },
    {
      printer:         'Creality K1 Max',
      itemName:        'Case iPhone 15 Pro · x2',
      clientName:      'Ana Beatriz',
      remainingTime:   '1h44min',
      progressPercent: 82,
    },
  ],

  topProducts: [
    { name: 'Suporte Parede 3D', buyer: 'multi-canal',    qty: 14, profit: 2180, highlight: true  },
    { name: 'Case iPhone 15',    buyer: 'Shopee / ML',    qty: 22, profit: 1540, highlight: true  },
    { name: 'Ventosa Dashboard', buyer: 'WhatsApp direto', qty: 8,  profit: 960,  highlight: false },
    { name: 'Miniatura Garagem', buyer: 'encomenda',       qty: 3,  profit: 840,  highlight: false },
    { name: 'Tag Chaveiro NFC',  buyer: 'Instagram',       qty: 31, profit: 620,  highlight: false },
  ],

  stockAlerts: [
    {
      materialName:          'PLA Preto Voolt 1kg',
      daysUntilEmpty:        3,
      currentGrams:          420,
      dailyConsumptionGrams: 140,
      pricePerKg:            89,
      affectedPrinters:      ['Bambu Lab X1-Carbon', 'Ender 3 V3 KE'],
      urgencyLabel:          'comprar ate segunda',
    },
  ],

  goal: {
    percent:     69,
    targetValue: 18000,
    anchor:      'no caminho',
  },

  streak: {
    days: 12,
  },

  projects: [
    { id: 'mock-resolucao-3d',  name: 'Resolucao 3D',  revenue: 12480, isActive: true  },
    { id: 'mock-lab-criativo',  name: 'Lab Criativo',  revenue: 3200,  isActive: false },
  ],
}

// ---------------------------------------------------------------------------
// Skeleton (Suspense fallback)
// ---------------------------------------------------------------------------

function DashboardV4Skeleton() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--v4-surface-0, #11161A)' }}
      aria-label="Carregando dashboard V4..."
      role="status"
    >
      {/* Sidebar placeholder */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 248,
          height: '100vh',
          background: 'var(--v4-surface-0, #11161A)',
          borderRight: '1px solid var(--v4-border-soft, rgba(242,239,234,0.14))',
          zIndex: 10,
        }}
      />
      {/* Main placeholder */}
      <div style={{ marginLeft: 248, padding: '36px 40px' }}>
        <div
          aria-hidden="true"
          style={{
            height: 42,
            borderRadius: 999,
            background: 'var(--v4-surface-1, #161B1F)',
            width: 220,
            marginBottom: 36,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            height: 200,
            borderRadius: 16,
            background: 'var(--v4-surface-1, #161B1F)',
            marginBottom: 44,
            opacity: 0.7,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 18,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                height: 220,
                borderRadius: 16,
                background: 'var(--v4-surface-1, #161B1F)',
                gridColumn: i === 0 ? 'span 2' : undefined,
                opacity: 0.6 - i * 0.07,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inner (async — permite Suspense wrapping)
// ---------------------------------------------------------------------------

/** Resolve DashboardData para usuario autenticado ou retorna null em falha. */
async function resolveRealData(userId: string): Promise<DashboardData | null> {
  const supabase = await createServerClient()

  // Primeiro projeto ativo do usuario
  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)

  let projectId: string | null = projectRows?.[0]?.id ?? null

  // Fallback: qualquer projeto
  if (!projectId) {
    const { data: anyProject } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
    projectId = anyProject?.[0]?.id ?? null
  }

  if (!projectId) return null

  // Nome do usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const user = await getUser()
  const userName: string =
    (profile as { full_name?: string } | null)?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split('@')[0] ??
    'Maker'

  return getDashboardData(userId, projectId, userName)
}

async function DashboardV4Inner() {
  // Tenta autenticar — sem redirect (sandbox deve ser acessivel sem auth)
  const user = await getUser()

  if (!user) {
    // Nao autenticado: exibe dados mockados
    return <DashboardLayout data={MOCK_DATA} />
  }

  // Autenticado: tenta dados reais, com fallback gracioso
  let resolvedData: DashboardData | null = null
  try {
    resolvedData = await resolveRealData(user.id)
  } catch {
    // Servico indisponivel — continua com mock
  }

  if (!resolvedData) {
    // Sem projeto ou erro: mock com nome real do usuario
    const mockWithUser: DashboardData = {
      ...MOCK_DATA,
      userName: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Maker',
    }
    return <DashboardLayout data={mockWithUser} />
  }

  return <DashboardLayout data={resolvedData} />
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function DashboardV4Page() {
  return (
    <Suspense fallback={<DashboardV4Skeleton />}>
      <DashboardV4Inner />
    </Suspense>
  )
}

export const metadata = {
  title: 'Dashboard V4 · Dev Preview · Hayzer',
  robots: { index: false, follow: false },
}
