'use client'

import { useStore } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

interface SidebarFooterProps {
  iconOnly?: boolean
}

export function SidebarFooter({ iconOnly = false }: SidebarFooterProps) {
  const { loading, dbError } = useStore()

  const dot = (
    <div
      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        loading ? 'bg-[#f59e0b] animate-pulse' : dbError ? 'bg-[#ef4444]' : 'bg-[#10b981]'
      }`}
    />
  )

  if (iconOnly) {
    return (
      <div
        className="shrink-0 pb-3 flex flex-col items-center gap-2"
        style={{ borderTop: '1px solid var(--t-footer-border)', paddingTop: '0.75rem' }}
      >
        {isSupabaseConfigured ? dot : (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--t-text-muted)' }}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="shrink-0 pt-3 px-5 pb-4"
      style={{ borderTop: '1px solid var(--t-footer-border)' }}
    >
      <p className="text-[11px]" style={{ color: 'var(--t-footer-text)' }}>
        Sistema Operacional v0.3
      </p>
      {isSupabaseConfigured ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          {dot}
          <span className="text-[10px] truncate" style={{ color: 'var(--t-footer-text)' }}>
            {loading ? 'Conectando...' : dbError ? 'Offline' : 'Supabase'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: 'var(--t-text-muted)' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--t-footer-text)' }}>Local</span>
        </div>
      )}
    </div>
  )
}
