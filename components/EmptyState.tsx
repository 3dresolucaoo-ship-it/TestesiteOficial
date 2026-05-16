'use client'

// Sofia (CS) + Diego (designer) — 2026-05-16:
// EmptyState reutilizável pra todas as telas vazias do app.
// Usado em Inventory, Products, Orders, CRM quando não tem dados ainda.
// Tom: parceiro/educador maker BR.

import Link from 'next/link'
import type { ReactNode } from 'react'

interface Action {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  actions?: Action[]
  helperText?: string
}

export function EmptyState({ icon, title, description, actions = [], helperText }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-16 max-w-md mx-auto">
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
        }}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-foreground/70 leading-relaxed mb-6">
        {description}
      </p>

      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto mb-3">
          {actions.map((action, i) => {
            const isPrimary = action.variant !== 'secondary'
            const className = isPrimary
              ? 'px-4 py-2.5 rounded-lg bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white text-sm font-medium transition-colors'
              : 'px-4 py-2.5 rounded-lg border border-foreground/15 text-foreground/80 hover:bg-foreground/5 text-sm font-medium transition-colors'

            if (action.href) {
              return (
                <Link key={i} href={action.href} className={className}>
                  {action.label}
                </Link>
              )
            }
            return (
              <button key={i} onClick={action.onClick} className={className}>
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-foreground/50 leading-relaxed max-w-sm">
          {helperText}
        </p>
      )}
    </div>
  )
}
