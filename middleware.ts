import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/showcase',
  '/catalogo',
  '/portfolio',
  '/checkout',
  '/waitlist',
  '/privacidade',
  '/termos',
  '/calculadora',
  // Webhooks são server-to-server: gateway POST sem cookie de sessão.
  // Autenticação acontece via signature do payload (Stripe: stripe-signature
  // header verificado em payments/stripe.ts:88; MP: HMAC SHA-256 obrigatório
  // em payments/mercadopago.ts:121). Sem isto aqui, middleware faz 307→/login
  // e o gateway nunca alcança o handler — pagamento aprovado não vira Order.
  '/api/webhooks',
]
// /mockups REMOVIDO de PUBLIC_PATHS em 2026-05-16:
// requer auth Supabase + email admin pra prevenir vazamento de WIP visual
// (especialmente crítico antes da marca INPI ser protocolada).
// HTMLs antes em public/mockups/ foram movidos pra mockups/ e servidos
// via route handler app/mockups/[...slug]/route.ts com guard de admin.

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, pass through without auth checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session — keeps auth cookies up to date on every request.
    // This is what makes F5 work: the server always has a fresh session.
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isPublicPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch {
    if (!isPublicPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Exclude:
    //  - _next/static, _next/image (Next.js internals)
    //  - favicon.ico
    //  - robots.txt, sitemap.xml (SEO files, Lighthouse audit 2026-05-20)
    //  - arquivos estaticos por extensao (.svg, .png, .jpg, etc + .txt, .xml, .ico)
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|txt|xml|ico)$).*)',
  ],
}
