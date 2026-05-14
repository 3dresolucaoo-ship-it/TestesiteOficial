import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Política de Privacidade — Hayzer',
  description: 'Como tratamos seus dados em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <article className="prose prose-invert mx-auto max-w-3xl px-6 py-20 prose-headings:tracking-tight prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
        <h1>Política de Privacidade</h1>
        <p className="text-sm">Última atualização: 13 de maio de 2026</p>

        <h2>1. Quem somos</h2>
        <p>
          Hayzer é uma ferramenta de gestão para pequenos negócios brasileiros.
          Esta política descreve como coletamos, usamos e protegemos seus dados.
        </p>

        <h2>2. O que coletamos na lista de espera</h2>
        <ul>
          <li><strong>Dados que você informa:</strong> email, nome e (opcional) WhatsApp.</li>
          <li><strong>Dados de qualificação (opcionais):</strong> nome do negócio, segmento, tamanho, faturamento estimado, dor principal, como nos conheceu.</li>
          <li><strong>Dados técnicos automáticos:</strong> endereço IP (anonimizado para país/região/cidade), tipo de dispositivo, navegador, página de origem, parâmetros de campanha (UTM).</li>
        </ul>

        <h2>3. Para que usamos</h2>
        <ul>
          <li>Te avisar quando o Hayzer abrir.</li>
          <li>Entender quem está esperando — pra adaptar o produto à realidade.</li>
          <li>Métricas agregadas (sem identificar você individualmente).</li>
        </ul>

        <h2>4. Seus direitos pela LGPD</h2>
        <p>
          Você pode, a qualquer momento, e sem custo, solicitar:
        </p>
        <ul>
          <li>Confirmação de que tratamos seus dados</li>
          <li>Acesso aos seus dados</li>
          <li>Correção de dados incompletos ou desatualizados</li>
          <li><strong>Eliminação completa</strong> dos seus dados</li>
          <li>Portabilidade pra outra plataforma</li>
          <li>Revogação do consentimento</li>
        </ul>
        <p>
          Pra exercer qualquer direito, mande email pra{' '}
          <a href="mailto:privacidade@hayzer.com.br">privacidade@hayzer.com.br</a> com o
          assunto "LGPD" e o pedido. Respondemos em até 15 dias.
        </p>

        <h2>5. Quem tem acesso</h2>
        <p>
          Hoje, apenas o time interno do Hayzer. Não vendemos, alugamos ou
          compartilhamos seus dados com terceiros pra publicidade.
        </p>
        <p>
          Sub-processadores técnicos (que armazenam dados em nosso nome): Supabase
          (banco de dados, hospedado em São Paulo) e Vercel (hospedagem da aplicação).
          Ambos atendem LGPD e GDPR.
        </p>

        <h2>6. Quanto tempo guardamos</h2>
        <p>
          Enquanto você estiver na lista de espera ou for cliente ativo. Se você
          pedir deleção, removemos em até 15 dias.
        </p>

        <h2>7. Segurança</h2>
        <p>
          Usamos HTTPS, criptografia em repouso, isolamento por usuário (Row Level
          Security) e revisões periódicas de segurança. Em caso de incidente,
          comunicamos a ANPD e os afetados conforme exigido pela LGPD.
        </p>

        <h2>8. Contato</h2>
        <p>
          Encarregado de Dados (DPO):{' '}
          <a href="mailto:privacidade@hayzer.com.br">privacidade@hayzer.com.br</a>
        </p>
      </article>
      <Footer />
    </div>
  )
}
