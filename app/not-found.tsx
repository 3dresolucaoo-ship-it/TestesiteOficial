import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-[#3a3a3a] text-8xl font-bold">404</p>
        <p className="text-[#ebebeb] text-lg font-semibold">Página não encontrada</p>
        <p className="text-[#555555] text-sm">A URL que você acessou não existe.</p>
        <Link href="/dashboard" className="inline-block mt-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
