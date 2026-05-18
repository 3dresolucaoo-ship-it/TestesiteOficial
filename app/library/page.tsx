import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/isAdmin'
import { LibraryShell } from './_components/LibraryShell'

export const metadata = {
  title: 'Biblioteca Hayzer — Design System Interno',
  robots: 'noindex, nofollow',
}

/**
 * /library — showcase vivo de componentes e assets da visual-library.
 * Protegida: requer auth Supabase + email em ADMIN_EMAILS.
 * Server Component: guard de acesso antes de qualquer render.
 */
export default async function LibraryPage() {
  // Guard 1: autenticado
  const user = await getUser()
  if (!user) redirect('/login')

  // Guard 2: admin
  if (!isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(200 11% 6%)' }}   // night-800
    >
      <Suspense fallback={<LibraryFallback />}>
        <LibraryShell />
      </Suspense>
    </div>
  )
}

function LibraryFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span style={{ color: 'hsl(40 21% 86%)' }} className="text-sm font-mono">
        carregando biblioteca...
      </span>
    </div>
  )
}
