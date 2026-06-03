/**
 * app/api/sentry-test/route.ts — Endpoint pra validar Sentry init em prod.
 *
 * Uso:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://hayzer.com.br/api/sentry-test
 *
 * Comportamento:
 *   - Sem auth → 401 (não dispara Sentry, evita ruído por scanners de bot)
 *   - Com auth → joga Error proposital
 *   - Sentry deve capturar e exibir no dashboard em < 1 minuto
 *
 * Validação CEO:
 *   1. Confirmar evento em https://sentry.io/organizations/<SENTRY_ORG>/issues/
 *   2. Filtrar por project=$SENTRY_PROJECT
 *   3. Procurar "Sentry init validation — proposital" (mensagem deste handler)
 *
 * Após validar, este endpoint pode ficar (não polui prod — é gateado por auth).
 */

import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Auth via mesmo CRON_SECRET (não vale criar outra var só pra isso)
  const expected = process.env.CRON_SECRET
  if (expected) {
    const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (provided !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  // Erro proposital pra Sentry capturar
  throw new Error('Sentry init validation — proposital. Disparado via /api/sentry-test. Se você está vendo isto no Sentry dashboard, init está funcionando.')
}
