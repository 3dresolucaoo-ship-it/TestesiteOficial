'use client'

import { SidebarGlobalNav } from './sidebar/SidebarGlobalNav'
import { SidebarProjectNav } from './sidebar/SidebarProjectNav'
import { SidebarFooter } from './sidebar/SidebarFooter'
import { useProjectContext, useSidebarCollapsed } from './sidebar/useSidebarState'

export { BottomNav, MobileNav } from './sidebar/SidebarMobileNav'

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function Sidebar() {
  const projectId             = useProjectContext()
  const { collapsed, toggle } = useSidebarCollapsed()

  return (
    <aside
      className="hidden lg:flex flex-col h-screen fixed top-0 left-0 z-30 overflow-hidden"
      style={{
        width:       collapsed ? '3.5rem' : '14rem',
        transition:  'width 200ms ease',
        background:  'linear-gradient(180deg, var(--t-accent-soft) 0%, transparent 30%), var(--t-sidebar-bg)',
        borderRight: '1px solid var(--t-sidebar-border)',
        boxShadow:   '1px 0 0 var(--t-sidebar-border)',
        minHeight:   0,
      }}
    >
      {projectId ? (
        <SidebarProjectNav projectId={projectId} />
      ) : (
        <SidebarGlobalNav collapsed={collapsed} onToggle={toggle} />
      )}
      <SidebarFooter iconOnly={collapsed} />
    </aside>
  )
}
