'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface SidebarNavLinkProps {
  href: string
  label: string
  icon: React.ElementType
  onClick?: () => void
  exact?: boolean
  iconOnly?: boolean
}

export function SidebarNavLink({
  href,
  label,
  icon: Icon,
  onClick,
  exact = false,
  iconOnly = false,
}: SidebarNavLinkProps) {
  const pathname = usePathname()
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/')

  const styleBase = {
    background: active ? 'var(--t-nav-active-bg)' : 'transparent',
    color:      active ? 'var(--t-nav-active-text)' : 'var(--t-nav-inactive)',
  }

  function onEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!active) {
      e.currentTarget.style.color = 'var(--t-text-primary)'
      e.currentTarget.style.background = 'var(--t-hover)'
    }
  }

  function onLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!active) {
      e.currentTarget.style.color = 'var(--t-nav-inactive)'
      e.currentTarget.style.background = 'transparent'
    }
  }

  if (iconOnly) {
    return (
      <Link
        href={href}
        onClick={onClick}
        title={label}
        className="relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl transition-all duration-150"
        style={styleBase}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
            style={{ background: 'var(--t-accent)' }}
          />
        )}
        <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden"
      style={styleBase}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: 'var(--t-accent)' }}
        />
      )}
      <Icon size={15} strokeWidth={active ? 2 : 1.5} />
      <span className="truncate">{label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
    </Link>
  )
}
