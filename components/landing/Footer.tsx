import Link from 'next/link'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BVaz Hub. Feito no Brasil.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/privacidade"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacidade
          </Link>
          <Link
            href="/termos"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Termos
          </Link>
          <a
            href="mailto:ola@bvaz-hub.com"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Contato
          </a>
        </nav>
      </div>
    </footer>
  )
}
