import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { getWaitlistCount } from '@/services/waitlist'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { PrinterShowcase } from '@/components/landing/PrinterShowcase'
import { MakerBeforeAfter } from '@/components/landing/MakerBeforeAfter'
import { WalletTransform } from '@/components/landing/WalletTransform'
import { ProductPreview } from '@/components/landing/ProductPreview'
import { Features } from '@/components/landing/Features'
import { WhatsAppFlow } from '@/components/landing/WhatsAppFlow'
import { CustomerProof } from '@/components/landing/CustomerProof'
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

  // Conta makers na fila (fail-safe: null se der erro)
  const waitlistCount = await getWaitlistCount().catch(() => null)

  return (
    <div className="bg-background text-foreground">
      <Header />

      {/* Suspense necessario porque WaitlistForm usa useSearchParams */}
      <Suspense fallback={null}>
        {/* count lido server-side, sem fetch client */}
        <Hero waitlistCount={waitlistCount} />
      </Suspense>

      {/* Prova de autenticidade — timelapse real Bambu A1 neon noturno */}
      <PrinterShowcase />

      {/* Antes/Depois maker — PNG split A/B, zoom reveal */}
      <MakerBeforeAfter />

      {/* Carteira rasgada → organizada — reveal sequencial */}
      <WalletTransform />

      {/* Prova visual do produto — laptop + iPhone dashboard */}
      <ProductPreview />

      <Features />

      {/* Fluxo WhatsApp → pedido — PNG real maker exausto */}
      <WhatsAppFlow />

      {/* Prova social visual — mulheres makers entregando */}
      <CustomerProof />

      <WhyDifferent />
      <FinalCTA />
      <Footer />
    </div>
  )
}
