'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

/** Detecta se a rota atual esta dentro de um projeto especifico. */
export function useProjectContext(): string | null {
  const pathname = usePathname()
  const parts = pathname.split('/')
  if (parts[1] === 'projects' && parts[2] && parts[2] !== 'new') {
    return parts[2]
  }
  return null
}

/** Estado de collapsed da sidebar desktop com persistencia em localStorage. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-global-collapsed') === 'true'
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '3.5rem' : '14rem')
  }, [collapsed])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-global-collapsed', String(next))
  }

  return { collapsed, toggle }
}
