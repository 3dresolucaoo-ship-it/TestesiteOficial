import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-6">
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
          <Link
            href="#waitlist"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]"
          >
            Entrar na lista
          </Link>
        </nav>
      </div>
    </header>
  )
}
