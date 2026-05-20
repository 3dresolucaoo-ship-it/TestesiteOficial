'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/types'
import { Plus, Package, AlertTriangle, LayoutGrid, Wrench } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { getProductStats } from '@/core/analytics/productionEngine'

// Sub-componentes extraídos em 2026-05-19 (refactor Felipe)
import { ProductCard }      from './_components/ProductCard'
import { CatalogCard }      from './_components/CatalogCard'
import { ProductForm }      from './_components/ProductForm'
import { ProductKpiRow }    from './_components/ProductKpiRow'
import { ProductBestWorst } from './_components/ProductBestWorst'
import { ProductFilters }   from './_components/ProductFilters'
import { useProductActions } from './_components/useProductActions'
import { r2 }               from './_components/helpers'
import { fmtPct }           from './_components/helpers'

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { state, dbError, loading } = useStore()
  const router = useRouter()
  const [creating,       setCreating]       = useState(false)
  const [editing,        setEditing]        = useState<Product | null>(null)
  const [filterProject,  setFilterProject]  = useState('all')
  const [viewMode,       setViewMode]       = useState<'catalog' | 'technical'>('catalog')

  const { products, inventory, projects, orders } = state

  const { handleCreate, handleEdit, handleDelete } = useProductActions({ inventory })

  // Lista filtrada e ordenada alfabeticamente
  const filtered = useMemo(() => {
    const list = filterProject === 'all'
      ? products
      : products.filter(p => p.projectId === filterProject)
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [products, filterProject])

  // Estatisticas por produto (historico de pedidos)
  const productStats = useMemo(
    () => getProductStats(products, orders, inventory),
    [products, orders, inventory],
  )

  // KPIs globais: apenas produtos com pedidos pagos
  const statsWithOrders = productStats.filter(s => s.orderCount > 0)
  const totalRevenue    = statsWithOrders.reduce((s, p) => s + p.totalRevenue, 0)
  const totalCost       = statsWithOrders.reduce((s, p) => s + p.totalCost,    0)
  const totalProfit     = totalRevenue - totalCost
  const avgMargin       = statsWithOrders.length > 0
    ? statsWithOrders.reduce((s, p) => s + p.avgMargin, 0) / statsWithOrders.length
    : 0

  // Helpers de lookup para os cards
  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? '?'
  const getFilament = (product: Product) =>
    product.inventoryItemId
      ? inventory.find(i => i.id === product.inventoryItemId)
      : undefined
  const getStats = (id: string) => productStats.find(s => s.product.id === id)

  if (loading) return null

  // Estado: nenhum projeto cadastrado ainda
  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <Package size={40} className="text-[#2a2a2a] mb-4" />
        <p className="text-[#555555] text-sm">Crie um projeto primeiro para cadastrar produtos.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Banner de erro de banco de dados */}
      {dbError && (
        <div className="flex items-start gap-3 bg-[#ef44440d] border border-[#ef444433] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#ef4444] mt-0.5 shrink-0" />
          <p className="text-[#ef4444] text-sm">{dbError}</p>
        </div>
      )}

      {/* Cabecalho da pagina */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Catalogo de Produtos</h2>
          <p className="text-[#555555] text-sm">
            {products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alternador de visualizacao */}
          <div
            className="flex items-center rounded-lg overflow-hidden border border-[#2a2a2a]"
            role="group"
            aria-label="Modo de visualizacao"
          >
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-2 flex items-center gap-1.5 text-xs transition-colors ${
                viewMode === 'catalog' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
              }`}
              aria-pressed={viewMode === 'catalog'}
              aria-label="Visualizacao em catalogo"
            >
              <LayoutGrid size={13} aria-hidden="true" /> Catalogo
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-3 py-2 flex items-center gap-1.5 text-xs transition-colors ${
                viewMode === 'technical' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
              }`}
              aria-pressed={viewMode === 'technical'}
              aria-label="Visualizacao tecnica"
            >
              <Wrench size={13} aria-hidden="true" /> Tecnico
            </button>
          </div>

          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} aria-hidden="true" /> Novo Produto
          </button>
        </div>
      </div>

      {/* KPIs globais de produtos (so renderiza se ha pedidos) */}
      {statsWithOrders.length > 0 && (
        <ProductKpiRow
          totalRevenue={totalRevenue}
          totalCost={totalCost}
          totalProfit={totalProfit}
          avgMargin={avgMargin}
        />
      )}

      {/* Ranking melhor / pior (so renderiza com 2+ produtos com dados) */}
      <ProductBestWorst stats={statsWithOrders} />

      {/* Filtro por projeto */}
      <ProductFilters
        projects={projects}
        products={products}
        filterProject={filterProject}
        onFilterChange={setFilterProject}
      />

      {/* Grid de produtos */}
      {filtered.length === 0 ? (
        products.length === 0 ? (
          // Empty state inicial: explica o que e "produto" no contexto maker 3D
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto px-6">
            <div
              className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'hsl(173 58% 28% / 0.12)',
                border:     '1px solid hsl(173 58% 28% / 0.25)',
              }}
            >
              <Package size={28} className="text-[hsl(173_30%_57%)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
              Cadastre o que voce vende
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
              Um produto aqui e qualquer peca que voce imprime e vende: suporte de celular, miniatura, peca tecnica.
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              Ao cadastrar, o Hayzer calcula custo de impressao, margem de lucro e preco sugerido por marketplace.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={15} aria-hidden="true" /> Cadastrar meu primeiro produto
            </button>
          </div>
        ) : (
          // Empty state filtrado: projeto sem produtos
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={40} className="text-[#2a2a2a] mb-4" />
            <p className="text-[#555555] text-sm">Nenhum produto neste projeto.</p>
          </div>
        )
      ) : viewMode === 'catalog' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(product => (
            <CatalogCard
              key={product.id}
              product={product}
              projectName={projectName(product.projectId)}
              filamentItem={getFilament(product)}
              onEdit={() => setEditing(product)}
              onDelete={() => handleDelete(product.id)}
              onQuote={() => { router.push(`/orders?quote=${product.id}`) }}
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => {
            const stats = getStats(product.id)
            return (
              <ProductCard
                key={product.id}
                product={product}
                projectName={projectName(product.projectId)}
                filamentItem={getFilament(product)}
                orderCount={stats?.orderCount   ?? 0}
                totalRevenue={stats?.totalRevenue ?? 0}
                totalProfit={stats?.totalProfit   ?? 0}
                avgMargin={stats?.avgMargin     ?? 0}
                onEdit={() => setEditing(product)}
                onDelete={() => handleDelete(product.id)}
              />
            )
          })}
        </div>
      )}

      {/* Aviso de produtos com margem baixa */}
      {statsWithOrders.some(s => s.avgMargin < 20) && (
        <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-[#f59e0b] text-sm font-medium">Produtos com margem abaixo de 20%</p>
            <p className="text-[#f59e0b] text-xs opacity-70 mt-0.5">
              {statsWithOrders
                .filter(s => s.avgMargin < 20)
                .map(s => `${s.product.name} (${fmtPct(s.avgMargin)})`)
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Modal: criar produto */}
      {creating && (
        <Modal title="Novo Produto" onClose={() => setCreating(false)}>
          <ProductForm
            projects={projects}
            inventory={inventory}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {/* Modal: editar produto */}
      {editing && (
        <Modal title="Editar Produto" onClose={() => setEditing(null)}>
          <ProductForm
            projects={projects}
            inventory={inventory}
            initial={{
              projectId:         editing.projectId,
              name:              editing.name,
              materialGrams:     String(editing.materialGrams),
              printTimeHours:    String(editing.printTimeHours),
              failureRate:       String(r2(editing.failureRate * 100)),
              energyCostPerHour: String(editing.energyCostPerHour),
              supportCost:       String(editing.supportCost      ?? 0),
              marginPercentage:  String(r2((editing.marginPercentage ?? 0.30) * 100)),
              salePrice:         String(editing.salePrice),
              inventoryItemId:   editing.inventoryItemId ?? '',
              notes:             editing.notes,
              imageUrl:          editing.imageUrl ?? '',
              checkoutMode:      editing.checkoutMode ?? 'direct',
              variants:          editing.variants ?? [],
              allowsCustom:      editing.allowsCustom ?? false,
            }}
            onSave={data => handleEdit(editing, data)}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
