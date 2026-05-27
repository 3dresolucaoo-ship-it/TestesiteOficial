'use client'

/**
 * app/products/page.tsx — Modulo de Produtos V4.8
 *
 * Migrado para ModuleShell em 2026-05-20 (onda 3c.2).
 * Funcionalidade 100% preservada: grid catalogo/tecnico, modais, filtros,
 * KpiRow, BestWorst, aviso margem baixa.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow V4 + FilterBar tabs Todos/Ativos/Pausados)
 *     children:
 *       - ProductBestWorst
 *       - ProductFilters (filtro por projeto)
 *       - Toggle catalogo/tecnico (mantido como acao secundaria)
 *       - Grid CatalogCard ou ProductCard
 *       - Banner margem baixa
 *   Modais: Novo Produto / Editar Produto
 *
 * KPIs V4:
 *   Hero  — melhor margem (produto com maior avgMargin nos pedidos pagos)
 *   Sat 1 — total de produtos cadastrados
 *   Sat 2 — mais vendido (produto com mais pedidos)
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/types'
import { Plus, Package, AlertTriangle, LayoutGrid, Wrench } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { getProductStats } from '@/core/analytics/productionEngine'
import { ModuleShell, V4ThemeProvider } from '@/components/dashboard/v4'

// CSS V4 do ModuleShell (mesmo pattern de /orders e /dashboard).
import '../globals-v4.css'

import { ProductCard }       from './_components/ProductCard'
import { CatalogCard }       from './_components/CatalogCard'
import { ProductForm }       from './_components/ProductForm'
import { ProductBestWorst }  from './_components/ProductBestWorst'
import { ProductFilters }    from './_components/ProductFilters'
import { useProductActions } from './_components/useProductActions'
import { r2, fmtPct }        from './_components/helpers'

// ---------------------------------------------------------------------------
// Tipo de tab (status de produto — sem status no modelo atual, usamos proxy)
// "Todos" / "Com pedidos" / "Sem pedidos"
// ---------------------------------------------------------------------------

type ProdTabId = 'all' | 'with_orders' | 'no_orders'

const PROD_TABS: Array<{ id: ProdTabId; label: string }> = [
  { id: 'all',         label: 'Todos' },
  { id: 'with_orders', label: 'Ativos' },
  { id: 'no_orders',   label: 'Sem pedidos' },
]

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  const { state, dbError, loading } = useStore()
  const router = useRouter()

  const [creating,      setCreating]      = useState(false)
  const [editing,       setEditing]       = useState<Product | null>(null)
  const [filterProject, setFilterProject] = useState('all')
  const [viewMode,      setViewMode]      = useState<'catalog' | 'technical'>('catalog')
  const [activeTab,     setActiveTab]     = useState<ProdTabId>('all')

  const { products, inventory, projects, orders } = state

  const { handleCreate, handleEdit, handleDelete } = useProductActions({ inventory })

  // Estatisticas por produto (historico de pedidos)
  const productStats = useMemo(
    () => getProductStats(products, orders, inventory),
    [products, orders, inventory],
  )

  // KPIs globais: apenas produtos com pedidos pagos
  const statsWithOrders = useMemo(
    () => productStats.filter(s => s.orderCount > 0),
    [productStats],
  )

  const avgMargin = useMemo(
    () =>
      statsWithOrders.length > 0
        ? statsWithOrders.reduce((s, p) => s + p.avgMargin, 0) / statsWithOrders.length
        : 0,
    [statsWithOrders],
  )

  // Produto com melhor margem (hero KPI)
  const bestMarginStat = useMemo(
    () =>
      statsWithOrders.length > 0
        ? [...statsWithOrders].sort((a, b) => b.avgMargin - a.avgMargin)[0]
        : null,
    [statsWithOrders],
  )

  // Produto mais vendido (satelite KPI)
  const mostSoldStat = useMemo(
    () =>
      statsWithOrders.length > 0
        ? [...statsWithOrders].sort((a, b) => b.orderCount - a.orderCount)[0]
        : null,
    [statsWithOrders],
  )

  // Lista filtrada por projeto + tab
  const filtered = useMemo(() => {
    let list = filterProject === 'all'
      ? products
      : products.filter(p => p.projectId === filterProject)

    if (activeTab === 'with_orders') {
      const withOrderIds = new Set(statsWithOrders.map(s => s.product.id))
      list = list.filter(p => withOrderIds.has(p.id))
    } else if (activeTab === 'no_orders') {
      const withOrderIds = new Set(statsWithOrders.map(s => s.product.id))
      list = list.filter(p => !withOrderIds.has(p.id))
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [products, filterProject, activeTab, statsWithOrders])

  // Contagens para tabs
  const scopedProducts = useMemo(
    () => filterProject === 'all' ? products : products.filter(p => p.projectId === filterProject),
    [products, filterProject],
  )

  const withOrderIds = useMemo(
    () => new Set(statsWithOrders.map(s => s.product.id)),
    [statsWithOrders],
  )

  // Helpers de lookup
  const projectName = useCallback(
    (id: string) => projects.find(p => p.id === id)?.name ?? '?',
    [projects],
  )

  const getFilament = useCallback(
    (product: Product) =>
      product.inventoryItemId
        ? inventory.find(i => i.id === product.inventoryItemId)
        : undefined,
    [inventory],
  )

  const getStats = useCallback(
    (id: string) => productStats.find(s => s.product.id === id),
    [productStats],
  )

  // Tabs para ModuleShell
  const tabs = useMemo(
    () =>
      PROD_TABS.map(t => ({
        id:    t.id,
        label: t.label,
        count: t.id === 'all'
          ? scopedProducts.length
          : t.id === 'with_orders'
          ? scopedProducts.filter(p => withOrderIds.has(p.id)).length
          : scopedProducts.filter(p => !withOrderIds.has(p.id)).length,
        active: t.id === activeTab,
      })),
    [scopedProducts, withOrderIds, activeTab],
  )

  // Frase viva do header
  const livePhrase = useMemo(() => {
    if (statsWithOrders.length === 0) {
      return (
        <>
          {products.length} {products.length === 1 ? 'produto cadastrado.' : 'produtos cadastrados.'}{' '}
          Registre pedidos para ver metricas de margem.
        </>
      )
    }
    return (
      <>
        {statsWithOrders.length} {statsWithOrders.length === 1 ? 'produto com vendas.' : 'produtos com vendas.'}{' '}
        Margem media: {fmtPct(avgMargin)}.
      </>
    )
  }, [products.length, statsWithOrders.length, avgMargin])

  const handleTabChange = useCallback((id: string) => { setActiveTab(id as ProdTabId) }, [])
  const handleSearch    = useCallback((_q: string) => { /* busca futura */ }, [])

  // Guards
  if (loading) return null

  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <Package size={40} className="text-[#2a2a2a] mb-4" aria-hidden="true" />
        <p className="text-[#555555] text-sm">Crie um projeto primeiro para cadastrar produtos.</p>
      </div>
    )
  }

  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · ${products.length} PRODUTOS · ${statsWithOrders.length} COM VENDAS`}
        title="Produtos"
        titleItalicSuffix="no catalogo"
        livePhrase={livePhrase}
        primaryAction={{
          label:   'Novo Produto',
          onClick: () => setCreating(true),
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        secondaryAction={{
          label:   viewMode === 'catalog' ? 'Ver tecnico' : 'Ver catalogo',
          onClick: () => setViewMode(v => v === 'catalog' ? 'technical' : 'catalog'),
          icon:    viewMode === 'catalog'
            ? <Wrench size={15} aria-hidden="true" />
            : <LayoutGrid size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'MELHOR MARGEM',
          value:       bestMarginStat ? fmtPct(bestMarginStat.avgMargin) : 'sem dados',
          description: bestMarginStat
            ? `${bestMarginStat.product.name} (${bestMarginStat.orderCount} pedidos).`
            : 'registre pedidos para calcular.',
        }}
        satelliteKpis={[
          {
            label:       'TOTAL PRODUTOS',
            value:       String(products.length),
            description: `${projects.length} ${projects.length === 1 ? 'projeto' : 'projetos'}.`,
            tone:        'neutral',
          },
          {
            label:     'MAIS VENDIDO',
            value:     mostSoldStat ? mostSoldStat.product.name.slice(0, 14) : 'sem dados',
            alertText: mostSoldStat ? `${mostSoldStat.orderCount} pedidos` : undefined,
            tone:      mostSoldStat ? 'petrol' : 'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar produto..."
        onSearch={handleSearch}
      >
        {/* Banner de erro de banco de dados */}
        {dbError && (
          <div className="flex items-start gap-3 bg-[#ef44440d] border border-[#ef444433] rounded-xl px-4 py-3 mb-4">
            <AlertTriangle size={15} className="text-[#ef4444] mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-[#ef4444] text-sm">{dbError}</p>
          </div>
        )}

        {/* Ranking melhor / pior */}
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
            <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto px-6">
              <div
                className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'hsl(173 58% 28% / 0.12)',
                  border:     '1px solid hsl(173 58% 28% / 0.25)',
                }}
                aria-hidden="true"
              >
                <Package size={28} className="text-[hsl(173_30%_57%)]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                Cadastra o que você vende
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-2">
                Produto aqui é qualquer peca que você imprime e vende: suporte de celular, miniatura, peca tecnica.
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
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package size={40} className="text-[#2a2a2a] mb-4" aria-hidden="true" />
              <p className="text-[#555555] text-sm">Nenhum produto neste filtro.</p>
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
                  orderCount={stats?.orderCount    ?? 0}
                  totalRevenue={stats?.totalRevenue  ?? 0}
                  totalProfit={stats?.totalProfit    ?? 0}
                  avgMargin={stats?.avgMargin       ?? 0}
                  onEdit={() => setEditing(product)}
                  onDelete={() => handleDelete(product.id)}
                />
              )
            })}
          </div>
        )}

        {/* Aviso de produtos com margem baixa */}
        {statsWithOrders.some(s => s.avgMargin < 20) && (
          <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3 mt-4">
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
      </ModuleShell>

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
    </>
  )
}
