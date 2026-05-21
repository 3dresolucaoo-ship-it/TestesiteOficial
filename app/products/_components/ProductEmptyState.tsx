'use client'

/**
 * ProductEmptyState.tsx — Estados vazios do modulo de produtos.
 *
 * ES-08 Onda 2 (2026-05-21, Felipe).
 * 3 variantes:
 *   - 'no-project'  (Variante C): usuario sem projeto criado. CTA -> /projects/new
 *   - 'empty'       (Variante A): tem projeto, mas zero produto cadastrado. CTA abre modal.
 *   - 'no-results'  (Variante B): filtro/tab sem produto. CTA limpa filtro.
 *
 * Icon principal: Box (Lucide). Filtro: PackageSearch. Sem projeto: FolderOpen.
 * Shell V4: icon wrapper petrol + headline + subtitle + CTA primario + CTA secundario.
 */

import { Box, FolderOpen, PackageSearch, Plus, Search } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type ProductEmptyVariant = 'empty' | 'no-results' | 'no-project'

interface ProductEmptyStateProps {
  variant: ProductEmptyVariant
  /** Usado apenas na variante 'empty': abre modal de criacao */
  onCreateClick?: () => void
  /** Usado apenas na variante 'no-results': limpa filtro/tab ativo */
  onClearFilter?: () => void
}

// ---------------------------------------------------------------------------
// Variante A — zero produtos (tem projeto)
// ---------------------------------------------------------------------------

function EmptyVariant({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Catalogo de produtos vazio"
    >
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow: '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <Box size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Teu catalogo ta vazio ainda.
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-6">
        Cadastra o primeiro produto que tu vende ou imprime. Com filamento vinculado,
        o Hayzer calcula custo e margem de cada pedido sozinho.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{
            background: 'hsl(173 58% 28%)',
            boxShadow: '0 0 20px hsl(173 58% 28% / 0.28)',
          }}
          aria-label="Criar primeiro produto"
        >
          <Plus size={15} aria-hidden="true" />
          Criar primeiro produto
        </button>

        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-foreground/70 font-medium text-sm border transition-colors hover:text-foreground"
          style={{ border: '1px solid hsl(200 11% 20%)' }}
          aria-label="Ir pro estoque primeiro"
        >
          Ir pro estoque primeiro
        </Link>
      </div>

      <p className="text-xs text-foreground/50 mt-4 leading-relaxed">
        Sem filamento cadastrado o custo fica zerado. Vale ir no Estoque antes.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Variante B — filtro/tab sem resultado
// ---------------------------------------------------------------------------

function NoResultsVariant({ onClearFilter }: { onClearFilter?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto px-6"
      role="status"
      aria-label="Nenhum produto encontrado com esse filtro"
    >
      <PackageSearch
        size={28}
        className="text-foreground/30 mb-3"
        aria-hidden="true"
      />

      <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">
        Nenhum produto ativo.
      </h3>

      <p className="text-sm text-foreground/55 leading-relaxed mb-5">
        Produtos aparecem aqui quando tem pelo menos um pedido vinculado no mes.
      </p>

      <button
        type="button"
        onClick={onClearFilter}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground/70 font-medium text-sm border transition-colors hover:text-foreground"
        style={{ border: '1px solid hsl(200 11% 20%)' }}
        aria-label="Ver todos os produtos"
      >
        <Search size={13} aria-hidden="true" />
        Ver todos os produtos
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Variante C — sem projeto criado
// ---------------------------------------------------------------------------

function NoProjectVariant() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6"
      role="status"
      aria-label="Nenhum projeto criado"
    >
      <div
        className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
        style={{
          background: 'hsl(173 58% 28% / 0.12)',
          border: '1px solid hsl(173 58% 28% / 0.25)',
          boxShadow: '0 0 32px hsl(173 58% 28% / 0.15)',
        }}
        aria-hidden="true"
      >
        <FolderOpen size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
        Precisa de um projeto antes.
      </h3>

      <p className="text-sm text-foreground/65 leading-relaxed mb-6">
        Produto fica dentro de um projeto. Cria o teu e volta aqui.
      </p>

      <Link
        href="/projects/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
        style={{
          background: 'hsl(173 58% 28%)',
          boxShadow: '0 0 20px hsl(173 58% 28% / 0.28)',
        }}
        aria-label="Criar projeto"
      >
        <Plus size={15} aria-hidden="true" />
        Criar projeto
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function ProductEmptyState({
  variant,
  onCreateClick,
  onClearFilter,
}: ProductEmptyStateProps) {
  if (variant === 'no-project') return <NoProjectVariant />
  if (variant === 'no-results') return <NoResultsVariant onClearFilter={onClearFilter} />
  return <EmptyVariant onCreateClick={onCreateClick} />
}
