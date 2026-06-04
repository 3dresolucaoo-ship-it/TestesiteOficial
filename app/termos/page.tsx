import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Termos de Uso — Hayzer',
  description: 'Termos de uso da lista de espera e do produto Hayzer.',
}

export default function TermosPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <article className="prose prose-invert mx-auto max-w-3xl px-6 py-20 prose-headings:tracking-tight prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
        <h1>Termos de Uso</h1>
        <p className="text-sm">Última atualização: 13 de maio de 2026</p>

        <h2>1. O que estes termos cobrem</h2>
        <p>
          Estes termos se aplicam à lista de espera do Hayzer e, futuramente,
          ao produto quando lançar.
        </p>

        <h2>2. Sobre a lista de espera</h2>
        <ul>
          <li>Entrar na lista é gratuito.</li>
          <li>Você só recebe emails relacionados ao Hayzer.</li>
          <li>Pode sair da lista a qualquer momento — basta responder qualquer email pedindo descadastro, ou usar o link no final do email.</li>
          <li>Não cravamos data de lançamento. Trabalhamos pra entregar em breve.</li>
        </ul>

        <h2>3. Comunicação</h2>
        <p>
          Quando o produto lançar, você recebe um email com instruções de acesso.
          Antes disso, ocasionalmente mandamos atualizações sobre o desenvolvimento.
        </p>

        <h2>4. Mudanças</h2>
        <p>
          Podemos atualizar estes termos. Mudanças relevantes serão comunicadas
          por email pra quem está na lista.
        </p>

        <h2>5. Contato</h2>
        <p>
          Qualquer dúvida, manda pra{' '}
          <a href="mailto:ola@hayzer.com.br">ola@hayzer.com.br</a>.
        </p>
      </article>
      <Footer />
    </div>
  )
}
