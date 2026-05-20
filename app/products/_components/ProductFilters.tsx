'use client'

/**
 * ProductFilters — barra de filtros por projeto para a lista de produtos.
 *
 * Renderiza apenas quando ha mais de 1 projeto disponivel.
 * Extraído de app/products/page.tsx em 2026-05-19 (refactor Felipe).
 */

import type { Product } from '@/lib/types'

interface Project {
  id:   string
  name: string
}

interface ProductFiltersProps {
  projects:       Project[]
  products:       Product[]
  filterProject:  string
  onFilterChange: (projectId: string) => void
}

export function ProductFilters({
  projects,
  products,
  filterProject,
  onFilterChange,
}: ProductFiltersProps) {
  if (projects.length <= 1) return null

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
      active
        ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
        : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
    }`

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      role="group"
      aria-label="Filtrar por projeto"
    >
      <button
        onClick={() => onFilterChange('all')}
        className={btnClass(filterProject === 'all')}
        aria-pressed={filterProject === 'all'}
      >
        Todos
      </button>
      {projects.map(p => {
        const count = products.filter(pr => pr.projectId === p.id).length
        return (
          <button
            key={p.id}
            onClick={() => onFilterChange(p.id)}
            className={btnClass(filterProject === p.id)}
            aria-pressed={filterProject === p.id}
          >
            {p.name} ({count})
          </button>
        )
      })}
    </div>
  )
}
