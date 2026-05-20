'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'

interface SidebarLogoProps {
  iconOnly?: boolean
}

export function SidebarLogo({ iconOnly = false }: SidebarLogoProps) {
  const { state } = useStore()
  const name    = state.config?.companyName || 'Hayzer'
  const logoUrl = state.config?.brand?.logoUrl

  // Diego (2026-05-16): sem logo customizado, usa o logo oficial Hayzer
  const avatar = logoUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={logoUrl} alt={name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo-hayzer.png"
      alt="Hayzer"
      className="w-7 h-7 rounded-lg object-contain shrink-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )

  if (iconOnly) {
    return (
      <Link href="/dashboard" title={name} className="flex items-center justify-center py-4">
        {avatar}
      </Link>
    )
  }

  return (
    <div className="px-5 pt-5 pb-1">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        {avatar}
        <span
          className="font-semibold text-sm truncate"
          style={{ color: 'var(--t-text-primary)' }}
        >
          {name}
        </span>
      </Link>
    </div>
  )
}
