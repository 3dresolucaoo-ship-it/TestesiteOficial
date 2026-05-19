import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { getWaitlistCount } from '@/services/waitlist'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { ProductPreview } from '@/components/landing/ProductPreview'
import { Features } from '@/components/landing/Features'
import { WhyDifferent } from '@/components/landing/WhyDifferent'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Hayzer — A raiz do seu negócio',
  description:
    'Substitui gambiarra, planilha perdida e desorganização por controle real. Estoque, vendas, clientes, financeiro num lugar só. A raiz firme que sustenta tudo.',
}

export default async function HomePage() {
  // Usuário autenticado vai direto pro dashboard
  try {
    const user = await getUser()
    if (user) redirect('/dashboard')
  } catch {
    // Sem auth ainda — segue na landing
  }

  // #5 — Conta makers na fila (fail-safe: null se der erro)
  const waitlistCount = await getWaitlistCount().catch(() => null)

  return (
    <div className="bg-background text-foreground">
      <Header />
      {/* Suspense necessário porque WaitlistForm usa useSearchParams */}
      <Suspense fallback={null}>
        {/* #4 e #5 injetados via prop (count lido server-side, sem fetch client) */}
        <Hero waitlistCount={waitlistCount} />
      </Suspense>

      {/* #1 — Prova visual do produto (Server Component, sem JS cliente) */}
      <ProductPreview />

      <Features />
      <WhyDifferent />
      <FinalCTA />
      <Footer />
    </div>
  )
}
