import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/isAdmin'

/**
 * Serve mockups HTML do diretório `mockups/` na raiz do projeto.
 *
 * Guards:
 *   1. Usuário autenticado (Supabase getUser)
 *   2. Email admin (whitelist em ADMIN_EMAILS env var)
 *
 * Por que aqui em vez de public/mockups/?
 *   - public/ é servido estaticamente pelo Vercel CDN, sem passar pelo
 *     middleware/auth — qualquer URL é pública.
 *   - HTMLs de mockup contêm WIP visual sensível (especialmente antes da
 *     marca INPI Hayzer ser protocolada, em 18/05/2026).
 *   - Route handler permite check de auth + check de admin antes de servir.
 *
 * Segurança extra:
 *   - Path traversal bloqueado (verifica que resolved path está dentro
 *     do diretório `mockups/`).
 *   - Só aceita arquivos .html (denyl outros tipos).
 *   - Headers X-Robots-Tag pra reforçar noindex no servidor.
 *
 * Decisão: usamos node:fs/promises pra ler arquivos. Funciona em Fluid
 * Compute (Node.js runtime padrão do Vercel). Sem dependências externas.
 */

const MOCKUPS_DIR = path.join(process.cwd(), 'mockups')

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  // Guard 1: usuário logado
  const user = await getUser()
  if (!user) {
    return new NextResponse('Unauthorized — faça login em /login', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // Guard 2: email admin
  if (!isAdminEmail(user.email)) {
    return new NextResponse('Forbidden — acesso restrito a admin', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // Parse slug (params é Promise no Next 15+)
  const { slug } = await context.params
  if (!Array.isArray(slug) || slug.length === 0) {
    return new NextResponse('Bad request — slug obrigatório', { status: 400 })
  }

  // Reconstruir path relativo do mockup (ex: ['dashboard', 'editorial-bento-hibrido.html'])
  const relativePath = slug.join('/')

  // Validação 1: só permite arquivos .html
  if (!relativePath.endsWith('.html')) {
    return new NextResponse('Bad request — apenas arquivos .html são servidos', {
      status: 400,
    })
  }

  // Validação 2: path traversal — resolved path tem que estar dentro de MOCKUPS_DIR
  const resolvedPath = path.resolve(MOCKUPS_DIR, relativePath)
  if (!resolvedPath.startsWith(MOCKUPS_DIR + path.sep)) {
    return new NextResponse('Forbidden — path traversal detectado', {
      status: 403,
    })
  }

  // Ler arquivo do filesystem
  try {
    const html = await readFile(resolvedPath, 'utf-8')
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException
    if (error.code === 'ENOENT') {
      return new NextResponse(`Mockup não encontrado: ${relativePath}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
    console.error('[/mockups route] erro lendo arquivo:', error)
    return new NextResponse('Erro interno ao servir mockup', { status: 500 })
  }
}
