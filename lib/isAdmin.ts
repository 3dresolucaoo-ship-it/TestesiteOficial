/**
 * Verifica se um email pertence à lista de admins do Hayzer.
 *
 * Lista vem da env var `ADMIN_EMAILS` (CSV separado por vírgula).
 * Comparação case-insensitive. Email vazio → false.
 *
 * Uso:
 *   const user = await getUser()
 *   if (!user || !isAdminEmail(user.email)) {
 *     return new NextResponse('Forbidden', { status: 403 })
 *   }
 *
 * Decisão: usamos whitelist de email em vez de flag no DB
 * porque (1) só tem 1 admin (CEO) hoje, (2) não exige migration,
 * (3) controle fica em env var (Vercel Dashboard).
 * Quando o time crescer, migrar pra coluna `users.is_admin`.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const raw = process.env.ADMIN_EMAILS || ''
  const admins = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}
