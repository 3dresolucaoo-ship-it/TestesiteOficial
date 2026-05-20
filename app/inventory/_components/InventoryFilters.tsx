'use client'

/**
 * InventoryFilters — barra de filtros do módulo de inventário.
 * Inclui: filtro de projeto, filtro de categoria, toggle de visualização,
 * ordenação e campo de busca.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { Search, ArrowUpDown, LayoutGrid, List } from 'lucide-react'
import type { InventoryCategory, InventoryItem } from '@/lib/types'
import { INVENTORY_CATEGORY_LABELS } from '@/lib/types'

interface InventoryFiltersProps {
  projects:       { id: string; name: string }[]
  scopedItems:    InventoryItem[]
  filterProject:  string
  filterCat:      InventoryCategory | 'all'
  search:         string
  sortBy:         'name' | 'profit' | 'stock' | 'value'
  viewMode:       'grid' | 'list'
  onFilterProject: (v: string) => void
  onFilterCat:     (v: InventoryCategory | 'all') => void
  onSearch:        (v: string) => void
  onSortBy:        (v: 'name' | 'profit' | 'stock' | 'value') => void
  onViewMode:      (v: 'grid' | 'list') => void
}

export function InventoryFilters({
  projects,
  scopedItems,
  filterProject,
  filterCat,
  search,
  sortBy,
  viewMode,
  onFilterProject,
  onFilterCat,
  onSearch,
  onSortBy,
  onViewMode,
}: InventoryFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filtro de projeto */}
      <select
        value={filterProject}
        onChange={e => onFilterProject(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
        aria-label="Filtrar por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Botões de categoria */}
      <button
        onClick={() => onFilterCat('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          filterCat === 'all'
            ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
            : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
        }`}
      >
        Todos
      </button>
      {(Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]).map(c => {
        const count = scopedItems.filter(i => i.category === c).length
        if (count === 0) return null
        return (
          <button
            key={c}
            onClick={() => onFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterCat === c
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
            }`}
          >
            {INVENTORY_CATEGORY_LABELS[c]} ({count})
          </button>
        )
      })}

      {/* Toggle de visualização */}
      <div className="flex items-center gap-0 ml-auto border border-[#2a2a2a] rounded-lg overflow-hidden" role="group" aria-label="Modo de visualização">
        <button
          onClick={() => onViewMode('grid')}
          className={`px-2 py-1.5 flex items-center gap-1 text-xs transition-colors ${
            viewMode === 'grid' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
          }`}
          title="Grade"
          aria-pressed={viewMode === 'grid'}
        >
          <LayoutGrid size={12} />
        </button>
        <button
          onClick={() => onViewMode('list')}
          className={`px-2 py-1.5 flex items-center gap-1 text-xs transition-colors ${
            viewMode === 'list' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
          }`}
          title="Lista"
          aria-pressed={viewMode === 'list'}
        >
          <List size={12} />
        </button>
      </div>

      {/* Ordenação */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown size={11} className="text-[#555555]" aria-hidden="true" />
        <select
          value={sortBy}
          onChange={e => onSortBy(e.target.value as typeof sortBy)}
          className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
          aria-label="Ordenar por"
        >
          <option value="name">Nome</option>
          <option value="profit">Lucro</option>
          <option value="stock">Qtd</option>
          <option value="value">Valor</option>
        </select>
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" aria-hidden="true" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Buscar item..."
          aria-label="Buscar item"
          className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-40"
        />
      </div>
    </div>
  )
}
