import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/isAdmin'

export const metadata: Metadata = {
  title: 'Mockups · Hayzer',
  description: 'Mockups visuais de features Hayzer — uso interno.',
  robots: { index: false, follow: false },
}

type Mockup = {
  slug: string
  feature: string
  title: string
  variant: string
  status: 'rascunho' | 'em-avaliacao' | 'aprovado' | 'descartado'
  description: string
  author: string
  createdAt: string
}

const MOCKUPS: Mockup[] = [
  {
    slug: 'landing-v2/option-a-light-warm.html',
    feature: 'Landing v2',
    title: 'Light Warm',
    variant: 'A',
    status: 'descartado',
    description: 'Creme + ink + moss + amber. Fraunces serif. Marker handmade no "caos". Sticker rotacionado.',
    author: 'Diego',
    createdAt: '2026-05-14',
  },
  {
    slug: 'landing-v2/option-b-dark-grain.html',
    feature: 'Landing v2',
    title: 'Dark Grain',
    variant: 'B',
    status: 'aprovado',
    description: 'Night + petrol + ember. Hero centralizado. Grain forte. Pixel icons. Implementado em prod.',
    author: 'Diego',
    createdAt: '2026-05-14',
  },
  {
    slug: 'landing-v2/option-c-hybrid.html',
    feature: 'Landing v2',
    title: 'Hybrid',
    variant: 'C',
    status: 'descartado',
    description: 'Híbrido A+B. Não usado — B venceu.',
    author: 'Diego',
    createdAt: '2026-05-14',
  },
  {
    slug: 'logos/conceitos.html',
    feature: 'Logo',
    title: 'Conceitos de logo',
    variant: '—',
    status: 'descartado',
    description: 'Conceitos iniciais antes do CEO trazer arte final (H com raízes).',
    author: 'Diego',
    createdAt: '2026-05-14',
  },
  {
    slug: 'dashboard/editorial-bento-hibrido.html',
    feature: 'Dashboard Interno',
    title: 'Editorial-Bento Híbrido v1',
    variant: 'C v1',
    status: 'descartado',
    description:
      'Primeira tentativa. CEO detonou: dark uniforme, raízes invisíveis, sem dataviz, fonte pequena.',
    author: 'Diego',
    createdAt: '2026-05-16',
  },
  {
    slug: 'dashboard/editorial-bento-hibrido-v2.html',
    feature: 'Dashboard Interno',
    title: 'Editorial-Bento Híbrido v2',
    variant: 'C v2',
    status: 'em-avaliacao',
    description:
      'Refeito atacando 5 pontos: surface ladder, raízes estruturais, 3 charts (donut+sparkline+bars), tipografia +, conteúdo maker BR real (Falconi, Marina, R$ 47/kg).',
    author: 'Diego',
    createdAt: '2026-05-16',
  },
]

const STATUS_STYLES: Record<Mockup['status'], string> = {
  rascunho: 'bg-fog-50/8 text-fog-50/70 border-fog-50/20',
  'em-avaliacao': 'bg-ember-500/15 text-ember-500 border-ember-500/40',
  aprovado: 'bg-petrol-500/15 text-petrol-500 border-petrol-500/40',
  descartado: 'bg-fog-50/5 text-fog-50/40 border-fog-50/10 line-through',
}

const STATUS_LABEL: Record<Mockup['status'], string> = {
  rascunho: 'rascunho',
  'em-avaliacao': 'em avaliação',
  aprovado: 'aprovado',
  descartado: 'descartado',
}

function getMockupUrl(slug: string): string {
  return `/mockups/${slug}`
}

export default async function MockupsPage() {
  // Guard 1: requer usuário logado
  const user = await getUser()
  if (!user) {
    redirect('/login?next=/mockups')
  }

  // Guard 2: requer email admin (whitelist em ADMIN_EMAILS env var)
  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-night-950 text-fog-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mb-4 inline-block rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-ember-500">
            acesso restrito
          </div>
          <h1 className="font-serif text-3xl font-medium mb-3">Mockups são internos</h1>
          <p className="text-sm text-fog-50/70 mb-6">
            Esta área é restrita à equipe Hayzer. Se você acha que deveria ter acesso, fale com o Gabriel.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg border border-fog-50/20 bg-fog-50/5 px-4 py-2 text-sm hover:border-petrol-500/40 hover:bg-petrol-500/10 transition"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  const grouped = MOCKUPS.reduce<Record<string, Mockup[]>>((acc, mockup) => {
    if (!acc[mockup.feature]) acc[mockup.feature] = []
    acc[mockup.feature].push(mockup)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-night-950 text-fog-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-12 border-b border-fog-50/10 pb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-fog-50/20 bg-fog-50/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-fog-50/60">
              uso interno
            </span>
            <span className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-ember-500">
              noindex
            </span>
            <span className="rounded-full border border-petrol-500/30 bg-petrol-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-petrol-500">
              admin · {user.email}
            </span>
          </div>
          <h1 className="font-serif text-5xl font-medium tracking-tight">
            Mockups
          </h1>
          <p className="mt-3 max-w-2xl text-base text-fog-50/70">
            Direções visuais standalone antes de tocar no código real. Diego
            entrega HTMLs aqui, CEO aprova, Felipe implementa em React fiel.
          </p>
        </header>

        <div className="space-y-12">
          {Object.entries(grouped).map(([feature, items]) => (
            <section key={feature}>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl font-medium">{feature}</h2>
                <span className="text-xs text-fog-50/50">{items.length} {items.length === 1 ? 'mockup' : 'mockups'}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((mockup) => (
                  <Link
                    key={mockup.slug}
                    href={getMockupUrl(mockup.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-fog-50/10 bg-night-900 p-5 transition hover:border-petrol-500/40 hover:bg-night-800"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.16em] text-fog-50/40">
                          Variante {mockup.variant}
                        </div>
                        <h3 className="font-serif text-lg font-medium text-fog-50 group-hover:text-petrol-500">
                          {mockup.title}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em] ${STATUS_STYLES[mockup.status]}`}
                      >
                        {STATUS_LABEL[mockup.status]}
                      </span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-fog-50/65">
                      {mockup.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-fog-50/40">
                      <span>{mockup.author}</span>
                      <span className="font-mono">{mockup.createdAt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-fog-50/10 pt-6 text-xs text-fog-50/40">
          <p className="font-mono uppercase tracking-[0.14em]">
            mockups/ é versionado · servido via route handler com guard admin
          </p>
        </footer>
      </div>
    </div>
  )
}
