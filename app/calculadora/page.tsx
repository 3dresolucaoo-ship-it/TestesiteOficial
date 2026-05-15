import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { CalculadoraForm } from '@/components/landing/CalculadoraForm'

export const metadata = {
  title: 'Calculadora de custo de impressão 3D — Hayzer',
  description:
    'Calcule custo real (filamento + luz) e preço sugerido da sua próxima impressão. Grátis, sem cadastro.',
}

export default function CalculadoraPage() {
  return (
    <div className="grain bg-background text-foreground">
      <Header />
      <CalculadoraForm />
      <Footer />
    </div>
  )
}
