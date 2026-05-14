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
