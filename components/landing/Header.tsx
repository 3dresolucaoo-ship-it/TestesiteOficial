import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo size="sm" />
        <nav className="flex items-center gap-6 md:gap-9">
          <a
            href="#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            O que faz
          </a>
          <a
            href="#por-que"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Por quê
          </a>
          <a
            href="#waitlist"
            className="btn-light rounded-md px-4 py-1.5 text-sm"
          >
            Entrar na lista
          </a>
        </nav>
      </div>
    </header>
  )
}
