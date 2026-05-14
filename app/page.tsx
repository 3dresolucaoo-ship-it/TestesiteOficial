import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
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

  return (
    <div className="bg-background text-foreground">
      <Header />
      {/* Suspense necessário porque WaitlistForm usa useSearchParams */}
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <Features />
      <WhyDifferent />
      <FinalCTA />
      <Footer />
    </div>
  )
}
