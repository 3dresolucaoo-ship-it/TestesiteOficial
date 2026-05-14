import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { ThankYouHero } from '@/components/landing/ThankYouHero'
import { Step2Form } from '@/components/landing/Step2Form'

export const metadata = {
  title: 'Você entrou. Bem-vindo. — Hayzer',
  description: 'Você está na lista de espera do Hayzer. A gente avisa quando abrir.',
}

export default async function ObrigadoPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get('waitlist_email')?.value

  // Sem email no cookie = chegou aqui direto sem submeter. Volta pra landing.
  if (!email) {
    redirect('/')
  }

  return (
    <div className="bg-background text-foreground">
      <Header />
      <ThankYouHero email={email} />
      <Step2Form />
      <Footer />
    </div>
  )
}
