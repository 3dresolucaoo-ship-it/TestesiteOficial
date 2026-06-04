/**
 * Email transacional via Resend (Fase 1 — waitlist welcome).
 *
 * Setup necessário:
 * 1. RESEND_API_KEY no env (Vercel + .env.local)
 * 2. RESEND_FROM_EMAIL no env (padrão: ola@hayzer.com.br)
 * 3. NEXT_PUBLIC_WHATSAPP_GROUP_URL — link convite do grupo WhatsApp (opcional)
 * 4. Domínio hayzer.com.br verificado no Resend (SPF + DKIM + DMARC no Registro.br)
 *
 * Comportamento defensivo: se RESEND_API_KEY ausente, função retorna { ok: false }
 * silenciosamente — não quebra o fluxo de cadastro (lead já tá salvo no DB).
 */

import { Resend } from 'resend'

const RESEND_API_KEY     = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL  = process.env.RESEND_FROM_EMAIL || 'ola@hayzer.com.br'
const WHATSAPP_GROUP_URL = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

// ─── Welcome email — waitlist etapa 1 ───────────────────────────────────────

export async function sendWaitlistWelcome(
  to: string,
  name: string,
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY ausente — welcome não enviado pra', to)
    return { ok: false, error: 'not_configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from:    `Hayzer <${RESEND_FROM_EMAIL}>`,
      to,
      subject: 'Você entrou na lista do Hayzer',
      html:    renderWelcomeHtml(name),
      text:    renderWelcomeText(name),
    })

    if (error) {
      console.error('[email.sendWaitlistWelcome] resend error:', error)
      return { ok: false, error: error.message || 'send_failed' }
    }

    return { ok: true, id: data?.id || '' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[email.sendWaitlistWelcome] unexpected:', err)
    return { ok: false, error: msg }
  }
}

// ─── Templates inline ──────────────────────────────────────────────────────
// HTML mínimo, sem framework de email (React Email é overkill pra 1 template).
// Estilo casado com paleta do site: night #07090A, petrol #1F7669, fog #F7F5F0.

function renderWelcomeHtml(name: string): string {
  const firstName = (name.split(' ')[0] || name).trim()
  const groupBlock = WHATSAPP_GROUP_URL
    ? `<p style="margin: 8px 0 18px;">
         <a href="${WHATSAPP_GROUP_URL}" style="display: inline-block; background: #1F7669; color: #ffffff; padding: 11px 22px; border-radius: 6px; text-decoration: none; font-weight: 600;">
           Entrar no grupo Hayzer Beta
         </a>
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Você entrou na lista do Hayzer</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.55; color: #1a1a1a; background: #f7f5f0; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px 32px;">
    <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px; color: #07090A;">
      Oi ${escapeHtml(firstName)}, valeu por entrar.
    </h1>
    <p style="font-size: 15px; margin: 0 0 14px; color: #2a2a2a;">
      Você tá na lista do Hayzer. Lançamento <strong>04 de julho</strong>.
      Te aviso por aqui quando abrir, com acesso antecipado.
    </p>
    <p style="font-size: 15px; margin: 0 0 14px; color: #2a2a2a;">
      Enquanto isso, se quiser conversar com gente que tá no mesmo barco
      (maker 3D que quer tirar o caos da gestão do caminho), tem um grupo
      no WhatsApp da galera do beta:
    </p>
    ${groupBlock}
    <p style="font-size: 15px; margin: 0 0 14px; color: #2a2a2a;">
      Se preferir, responde esse email contando o que você vende e o que
      mais te trava hoje. Eu leio tudo.
    </p>
    <p style="font-size: 15px; margin-top: 24px; color: #2a2a2a;">
      — Gabriel<br>
      <span style="color: #888; font-size: 13px;">fundador, Hayzer</span>
    </p>
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
      Você recebeu isso porque entrou na lista de espera em
      <a href="https://hayzer.com.br" style="color: #1F7669;">hayzer.com.br</a>.
      Se foi engano, é só ignorar — não mando mais.
    </div>
  </div>
</body>
</html>`
}

function renderWelcomeText(name: string): string {
  const firstName = (name.split(' ')[0] || name).trim()
  const groupLine = WHATSAPP_GROUP_URL
    ? `\nGrupo Hayzer Beta no WhatsApp: ${WHATSAPP_GROUP_URL}\n`
    : ''

  return `Oi ${firstName}, valeu por entrar.

Você tá na lista do Hayzer. Lançamento 04 de julho. Te aviso por aqui quando abrir, com acesso antecipado.

Enquanto isso, se quiser conversar com gente que tá no mesmo barco (maker 3D que quer tirar o caos da gestão do caminho), tem um grupo no WhatsApp da galera do beta:
${groupLine}
Se preferir, responde esse email contando o que você vende e o que mais te trava hoje. Eu leio tudo.

— Gabriel
fundador, Hayzer

---
Você recebeu isso porque entrou na lista de espera em hayzer.com.br.
Se foi engano, é só ignorar — não mando mais.`
}

// Escape básico — protege contra nomes com < > & " no HTML
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Email sequence D+1 / D+3 / D+7 ─────────────────────────────────────────

export type SequenceStep = 'd1' | 'd3' | 'd7'

export async function sendSequenceEmail(
  step: SequenceStep,
  to: string,
  name: string,
): Promise<SendEmailResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY ausente — ${step} não enviado pra`, to)
    return { ok: false, error: 'not_configured' }
  }

  const { subject, html, text } = renderSequenceStep(step, name)

  try {
    const { data, error } = await resend.emails.send({
      from: `Hayzer <${RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error(`[email.sendSequenceEmail/${step}] resend error:`, error)
      return { ok: false, error: error.message || 'send_failed' }
    }

    return { ok: true, id: data?.id || '' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error(`[email.sendSequenceEmail/${step}] unexpected:`, err)
    return { ok: false, error: msg }
  }
}

function renderSequenceStep(step: SequenceStep, name: string): {
  subject: string; html: string; text: string
} {
  const firstName = (name.split(' ')[0] || name).trim()
  const safeName  = escapeHtml(firstName)
  const groupUrl  = WHATSAPP_GROUP_URL ?? ''

  switch (step) {
    case 'd1':
      return {
        subject: 'O que o Hayzer faz na prática (sem rodeio)',
        html: wrapHtml(`
          <h1>${safeName}, ontem você entrou na lista.</h1>
          <p>Hoje quero te contar o que tá vindo, sem rodeio:</p>
          <p style="margin:18px 0; padding:16px 20px; border-left:3px solid #1F7669; background:#f9f7f2; font-size:14px;">
            Maker 3D BR perde tempo anotando a mesma venda em 5 lugares — caderno, WhatsApp,
            planilha, Excel do filamento, cabeça. O Hayzer junta tudo numa tela só.
            Lead vira pedido com 1 clique. Imprimir desconta filamento e gera despesa sozinho.
            Pedido pago vira receita. Fim do mês você vê lucro real, não chute.
          </p>
          <p>Se quiser ver isso funcionando antes do lançamento, responde esse email
          contando 2 coisas: <strong>o que você vende</strong> e <strong>o que mais te trava hoje</strong>.</p>
          <p>Eu leio tudo. Pode ser detalhe ou desabafo — uso pra ajustar antes do launch.</p>
          ${groupUrl ? `<p style="margin:24px 0 8px;">
            <a href="${groupUrl}" style="display:inline-block;background:#1F7669;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;">
              Entrar no grupo Hayzer Beta
            </a>
          </p>` : ''}
          <p style="margin-top:24px;">— Gabriel</p>
        `),
        text: `${firstName}, ontem você entrou na lista.

Hoje quero te contar o que tá vindo, sem rodeio:

Maker 3D BR perde tempo anotando a mesma venda em 5 lugares — caderno, WhatsApp, planilha, Excel do filamento, cabeça. O Hayzer junta tudo numa tela só. Lead vira pedido com 1 clique. Imprimir desconta filamento e gera despesa sozinho. Pedido pago vira receita. Fim do mês você vê lucro real, não chute.

Se quiser ver isso funcionando antes do lançamento, responde esse email contando 2 coisas: o que você vende e o que mais te trava hoje.

Eu leio tudo. Pode ser detalhe ou desabafo — uso pra ajustar antes do launch.

${groupUrl ? `Grupo Hayzer Beta no WhatsApp: ${groupUrl}\n\n` : ''}— Gabriel`,
      }

    case 'd3':
      return {
        subject: 'Por que isso importa pro maker BR (e não pro maker gringo)',
        html: wrapHtml(`
          <h1>${safeName}, deixa eu te contar uma coisa.</h1>
          <p>Os sistemas de gestão pra maker 3D que existem hoje são todos gringos.
          Pensados pra quem tem Etsy, paga em USD, vende em loja física, tem funcionário.</p>
          <p>Maker brasileiro é outra coisa:</p>
          <ul style="margin:16px 0 18px; padding-left:22px; color:#2a2a2a; font-size:15px;">
            <li style="margin-bottom:6px;">Vende custom no WhatsApp, não em marketplace</li>
            <li style="margin-bottom:6px;">Recebe Pix na conta pessoal</li>
            <li style="margin-bottom:6px;">Compra filamento em real, paga energia da garagem</li>
            <li style="margin-bottom:6px;">Cliente pede pelo Insta, fecha por áudio do WhatsApp</li>
            <li style="margin-bottom:6px;">É um, no máximo dois — sem time</li>
          </ul>
          <p>O Hayzer foi construído pra esse maker. Vocabulário em português,
          filamento em gramas, taxa de falha brasileira, WhatsApp como cidadão de primeira.</p>
          <p>O lançamento tá próximo, faltam poucas semanas.</p>
          <p>Se você é um dos primeiros 10 a responder esse email, eu te coloco
          no beta antes do lançamento. Sem custo, sem compromisso.</p>
          <p style="margin-top:24px;">— Gabriel</p>
        `),
        text: `${firstName}, deixa eu te contar uma coisa.

Os sistemas de gestão pra maker 3D que existem hoje são todos gringos. Pensados pra quem tem Etsy, paga em USD, vende em loja física, tem funcionário.

Maker brasileiro é outra coisa:
- Vende custom no WhatsApp, não em marketplace
- Recebe Pix na conta pessoal
- Compra filamento em real, paga energia da garagem
- Cliente pede pelo Insta, fecha por áudio do WhatsApp
- É um, no máximo dois — sem time

O Hayzer foi construído pra esse maker. Vocabulário em português, filamento em gramas, taxa de falha brasileira, WhatsApp como cidadão de primeira.

O lançamento tá próximo, faltam poucas semanas.

Se você é um dos primeiros 10 a responder esse email, eu te coloco no beta antes do lançamento. Sem custo, sem compromisso.

— Gabriel`,
      }

    case 'd7':
      return {
        subject: 'Lançamento em breve. Lembrete + o que tá pronto',
        html: wrapHtml(`
          <h1>${safeName}, lembrete rápido.</h1>
          <p>Faz 7 dias que você entrou na lista. O lançamento tá próximo.</p>
          <p>O que tá pronto pro lançamento:</p>
          <ul style="margin:16px 0 18px; padding-left:22px; color:#2a2a2a; font-size:15px;">
            <li style="margin-bottom:6px;"><strong>CRM no estilo Trello</strong> — arrasta lead entre colunas, do "Negociando" pro "Ganho"</li>
            <li style="margin-bottom:6px;"><strong>Lead vira pedido com 1 clique</strong> — sem redigitar nome, valor, WhatsApp</li>
            <li style="margin-bottom:6px;"><strong>Estoque em gramas com alerta de mínimo</strong></li>
            <li style="margin-bottom:6px;"><strong>Calculadora de produto</strong> — gramas + tempo + margem = preço sugerido</li>
            <li style="margin-bottom:6px;"><strong>Finance que se atualiza sozinho</strong> — imprimiu desconta filamento e cria despesa</li>
            <li style="margin-bottom:6px;"><strong>Catálogo público</strong> — link tipo hayzer.com.br/catalogo/voce pro WhatsApp</li>
          </ul>
          <p>Se ainda não respondeu o email pedindo entrada no beta, ainda dá tempo.
          Responde esse aqui contando o que você vende.</p>
          <p>Final: se Hayzer não for pra você, é só ignorar esse último email. Não
          mando mais até o lançamento.</p>
          <p style="margin-top:24px;">— Gabriel</p>
        `),
        text: `${firstName}, lembrete rápido.

Faz 7 dias que você entrou na lista. O lançamento tá próximo.

O que tá pronto pro lançamento:
- CRM no estilo Trello — arrasta lead entre colunas, do "Negociando" pro "Ganho"
- Lead vira pedido com 1 clique — sem redigitar nome, valor, WhatsApp
- Estoque em gramas com alerta de mínimo
- Calculadora de produto — gramas + tempo + margem = preço sugerido
- Finance que se atualiza sozinho — imprimiu desconta filamento e cria despesa
- Catálogo público — link tipo hayzer.com.br/catalogo/voce pro WhatsApp

Se ainda não respondeu o email pedindo entrada no beta, ainda dá tempo. Responde esse aqui contando o que você vende.

Final: se Hayzer não for pra você, é só ignorar esse último email. Não mando mais até o lançamento.

— Gabriel`,
      }
  }
}

// Helper template HTML compartilhado pelos 3 emails da sequência
function wrapHtml(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.55;color:#1a1a1a;background:#f7f5f0;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:40px 32px;">
    ${innerHtml.replace(/<h1>/g, '<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#07090A;">').replace(/<p>/g, '<p style="font-size:15px;margin:0 0 14px;color:#2a2a2a;">')}
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#888;">
      Você recebeu isso porque entrou na lista em
      <a href="https://hayzer.com.br" style="color:#1F7669;">hayzer.com.br</a>.
      Se foi engano, é só ignorar — não mando mais.
    </div>
  </div>
</body>
</html>`
}
