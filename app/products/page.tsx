'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Product, CheckoutMode, ProductVariantGroup, InventoryItem } from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, Package, Zap,
  Flame, Clock, AlertTriangle, TrendingUp, DollarSign,
  LayoutGrid, Wrench,
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { calcUnitCost, getProductStats } from '@/core/analytics/productionEngine'
import { ProductForm, type ProductFormData } from './_components/ProductForm'
import { CatalogCard } from './_components/CatalogCard'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtPct(v: number) {
  return `${v.toFixed(1)}%`
}
function r2(v: number) {
  return Math.round(v * 100) / 100
}

// ─── Live cost preview component ──────────────────────────────────────────────
// CostPreview extraído em 2026-05-16 → app/products/_components/CostPreview.tsx
// + paleta corrigida (Diego audit): azul/amarelo/lilás → petrol/ember/neutro

// FormData + CHECKOUT_MODE_META + ProductForm + CatalogCard extraidos em 2026-05-16
// -> app/products/_components/ProductForm.tsx + CatalogCard.tsx


function ProductCard({
  product,
  projectName,
  filamentItem,
  orderCount,
  totalRevenue,
  totalProfit,
  avgMargin,
  onEdit,
  onDelete,
}: {
  product:      Product
  projectName:  string
  filamentItem: InventoryItem | undefined
  orderCount:   number
  totalRevenue: number
  totalProfit:  number
  avgMargin:    number
  onEdit:       () => void
  onDelete:     () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const breakdown = calcUnitCost(product, filamentItem ? [filamentItem] : [])
  const unitMargin = product.salePrice > 0
    ? ((product.salePrice - breakdown.totalCost) / product.salePrice) * 100
    : 0

  const marginColor =
    unitMargin >= 50 ? 'text-[#10b981]' :
    unitMargin >= 30 ? 'text-[#a78bfa]' :
    unitMargin >= 10 ? 'text-[#f59e0b]' : 'text-[#ef4444]'

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden group hover:border-[#3a3a3a] transition-colors">
      {/* Product image */}
      {product.imageUrl && (
        <div className="h-32 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]">
              {projectName}
            </span>
          </div>
          <h3 className="text-[#ebebeb] font-semibold text-sm leading-snug">{product.name}</h3>
          {product.notes && (
            <p className="text-[#3a3a3a] text-xs mt-0.5 truncate">{product.notes}</p>
          )}
        </div>

        <div className="relative shrink-0 ml-2">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
              <button
                onClick={() => { onEdit(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Print specs */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: Package, label: `${product.materialGrams}g`, sub: 'material' },
          { icon: Clock,   label: `${product.printTimeHours}h`, sub: 'impressão' },
          { icon: Flame,   label: `${(product.failureRate * 100).toFixed(0)}%`, sub: 'falha' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={sub} className="bg-[#0f0f0f] rounded-lg p-2.5 text-center">
            <Icon size={12} className="text-[#555555] mx-auto mb-1" />
            <p className="text-[#ebebeb] text-sm font-semibold">{label}</p>
            <p className="text-[#3a3a3a] text-[10px]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">Material + Energia + Falha</span>
          <span className="text-[#ebebeb] text-xs font-semibold">{fmt(breakdown.totalCost)}</span>
        </div>
        {product.salePrice > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#555555] text-xs">Preço de Venda</span>
              <span className="text-[#ebebeb] text-xs">{fmt(product.salePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888888] text-xs font-medium">Margem por Peça</span>
              <span className={`text-sm font-bold ${marginColor}`}>{fmtPct(unitMargin)}</span>
            </div>
          </>
        )}
        {filamentItem && (
          <p className="text-[#3a3a3a] text-[10px]">
            Filamento: {filamentItem.name}
          </p>
        )}
      </div>

      {/* Historical performance */}
      {orderCount > 0 && (
        <div className="border-t border-[#1c1c1c] pt-3 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[#ebebeb] text-sm font-bold">{orderCount}</p>
            <p className="text-[#555555] text-[10px]">pedidos</p>
          </div>
          <div className="text-center">
            <p className="text-[#10b981] text-sm font-bold">{fmt(totalRevenue)}</p>
            <p className="text-[#555555] text-[10px]">receita</p>
          </div>
          <div className="text-center">
            <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-[#a78bfa]' : 'text-[#ef4444]'}`}>
              {fmtPct(avgMargin)}
            </p>
            <p className="text-[#555555] text-[10px]">margem real</p>
          </div>
        </div>
      )}
      </div>{/* /p-5 */}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { state, dispatch, dbError, loading } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState<Product | null>(null)
  const [filterProject, setFilterProject] = useState('all')
  const [viewMode, setViewMode] = useState<'catalog' | 'technical'>('catalog')

  const { products, inventory, projects, orders } = state

  const filtered = useMemo(() => {
    const list = filterProject === 'all'
      ? products
      : products.filter(p => p.projectId === filterProject)
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [products, filterProject])

  const productStats = useMemo(
    () => getProductStats(products, orders, inventory),
    [products, orders, inventory],
  )

  // Global KPIs across all products that have paid orders
  const statsWithOrders = productStats.filter(s => s.orderCount > 0)
  const totalRevenue    = statsWithOrders.reduce((s, p) => s + p.totalRevenue, 0)
  const totalCost       = statsWithOrders.reduce((s, p) => s + p.totalCost, 0)
  const totalProfit     = totalRevenue - totalCost
  const avgMargin       = statsWithOrders.length > 0
    ? statsWithOrders.reduce((s, p) => s + p.avgMargin, 0) / statsWithOrders.length
    : 0

  // Se o usuário não preencheu preço manual, usa custo + margem como sale_price
  function resolvePrice(data: ProductFormData): number {
    const manual = parseFloat(data.salePrice) || 0
    if (manual > 0) return manual
    const filamentItems = data.inventoryItemId
      ? inventory.filter(i => i.id === data.inventoryItemId)
      : []
    const breakdown = calcUnitCost(
      {
        id: '', projectId: '', name: '', notes: '',
        materialGrams:     parseFloat(data.materialGrams)     || 0,
        printTimeHours:    parseFloat(data.printTimeHours)    || 0,
        failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
        energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
        supportCost:       parseFloat(data.supportCost)       || 0,
        marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
        salePrice:         0,
        inventoryItemId:   data.inventoryItemId || undefined,
        checkoutMode:      'direct',
        allowsCustom:      false,
      },
      filamentItems,
    )
    const margin = (parseFloat(data.marginPercentage) || 30) / 100
    return Math.round(breakdown.totalCost * (1 + margin) * 100) / 100
  }

  function sanitizeVariants(mode: CheckoutMode, raw: ProductVariantGroup[]): ProductVariantGroup[] | undefined {
    if (mode !== 'variant') return undefined
    const cleaned = raw
      .map(g => ({ name: g.name.trim(), options: g.options.map(o => o.trim()).filter(Boolean) }))
      .filter(g => g.name && g.options.length > 0)
    return cleaned.length > 0 ? cleaned : undefined
  }

  function handleCreate(data: ProductFormData) {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        id:                uid(),
        projectId:         data.projectId,
        name:              data.name.trim(),
        materialGrams:     parseFloat(data.materialGrams)     || 0,
        printTimeHours:    parseFloat(data.printTimeHours)    || 0,
        failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
        energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
        supportCost:       parseFloat(data.supportCost)       || 0,
        marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
        salePrice:         resolvePrice(data),
        inventoryItemId:   data.inventoryItemId || undefined,
        notes:             data.notes.trim(),
        imageUrl:          data.imageUrl || undefined,
        checkoutMode:      data.checkoutMode,
        variants:          sanitizeVariants(data.checkoutMode, data.variants),
        allowsCustom:      data.checkoutMode === 'direct' || data.checkoutMode === 'variant'
                             ? data.allowsCustom
                             : false,
      },
    })
  }

  function handleEdit(data: ProductFormData) {
    if (!editing) return
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: {
        ...editing,
        projectId:         data.projectId,
        name:              data.name.trim(),
        materialGrams:     parseFloat(data.materialGrams)     || 0,
        printTimeHours:    parseFloat(data.printTimeHours)    || 0,
        failureRate:       (parseFloat(data.failureRate)      || 0) / 100,
        energyCostPerHour: parseFloat(data.energyCostPerHour) || 0.5,
        supportCost:       parseFloat(data.supportCost)       || 0,
        marginPercentage:  (parseFloat(data.marginPercentage) || 30) / 100,
        salePrice:         resolvePrice(data),
        inventoryItemId:   data.inventoryItemId || undefined,
        notes:             data.notes.trim(),
        imageUrl:          data.imageUrl || undefined,
        checkoutMode:      data.checkoutMode,
        variants:          sanitizeVariants(data.checkoutMode, data.variants),
        allowsCustom:      data.checkoutMode === 'direct' || data.checkoutMode === 'variant'
                             ? data.allowsCustom
                             : false,
      },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
  }

  const projectName  = (id: string) => projects.find(p => p.id === id)?.name ?? '—'
  const getFilament  = (product: Product) =>
    product.inventoryItemId
      ? inventory.find(i => i.id === product.inventoryItemId)
      : undefined
  const getStats     = (id: string) => productStats.find(s => s.product.id === id)

  if (loading) return null
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

      {/* ── DB error banner ─────────────────────────────────────────────────── */}
      {dbError && (
        <div className="flex items-start gap-3 bg-[#ef44440d] border border-[#ef444433] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#ef4444] mt-0.5 shrink-0" />
          <p className="text-[#ef4444] text-sm">{dbError}</p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Catálogo de Produtos</h2>
          <p className="text-[#555555] text-sm">
            {products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg overflow-hidden border border-[#2a2a2a]">
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-2 flex items-center gap-1.5 text-xs transition-colors ${
                viewMode === 'catalog' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
              }`}
              title="Catálogo visual"
            >
              <LayoutGrid size={13} /> Catálogo
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-3 py-2 flex items-center gap-1.5 text-xs transition-colors ${
                viewMode === 'technical' ? 'bg-[#7c3aed1a] text-[#a78bfa]' : 'text-[#888888] hover:text-[#ebebeb]'
              }`}
              title="Vista técnica"
            >
              <Wrench size={13} /> Técnico
            </button>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Novo Produto
          </button>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      {statsWithOrders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Receita (produtos)',
              value: fmt(totalRevenue),
              icon:  TrendingUp,
              color: 'text-[#10b981]',
              bg:    'bg-[#10b9811a]',
            },
            {
              label: 'Custo de Produção',
              value: fmt(totalCost),
              icon:  Zap,
              color: 'text-[#f59e0b]',
              bg:    'bg-[#f59e0b1a]',
            },
            {
              label: 'Lucro (produtos)',
              value: fmt(totalProfit),
              icon:  DollarSign,
              color: totalProfit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]',
              bg:    totalProfit >= 0 ? 'bg-[#10b9811a]' : 'bg-[#ef44441a]',
            },
            {
              label: 'Margem Média',
              value: fmtPct(avgMargin),
              icon:  TrendingUp,
              color: avgMargin >= 40 ? 'text-[#a78bfa]' : avgMargin >= 20 ? 'text-[#f59e0b]' : 'text-[#ef4444]',
              bg:    'bg-[#7c3aed1a]',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon size={13} className={color} />
                </div>
                <span className="text-[#555555] text-xs font-medium uppercase tracking-wide">{label}</span>
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Best / Worst (only if we have data) ───────────────────────────── */}
      {statsWithOrders.length >= 2 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { stat: statsWithOrders[0],                              label: '🏆 Mais Rentável', borderColor: 'border-[#10b98133]' },
            { stat: statsWithOrders[statsWithOrders.length - 1],     label: '⚠️ Menos Rentável', borderColor: 'border-[#ef444433]' },
          ].map(({ stat, label, borderColor }) => (
            <div key={stat.product.id} className={`bg-[#141414] border ${borderColor} rounded-xl px-4 py-3`}>
              <p className="text-[#555555] text-xs mb-1">{label}</p>
              <p className="text-[#ebebeb] text-sm font-semibold">{stat.product.name}</p>
              <p className="text-[#555555] text-xs mt-0.5">
                {stat.orderCount} pedido(s) · margem real {fmtPct(stat.avgMargin)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Project filter ────────────────────────────────────────────────── */}
      {projects.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterProject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterProject === 'all'
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
            }`}
          >
            Todos
          </button>
          {projects.map(p => {
            const count = products.filter(pr => pr.projectId === p.id).length
            return (
              <button
                key={p.id}
                onClick={() => setFilterProject(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  filterProject === p.id
                    ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                    : 'text-[#888888] border-transparent hover:text-[#ebebeb]'
                }`}
              >
                {p.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        products.length === 0 ? (
          /* Sofia (CS) 2026-05-16: explica o que é "produto" no contexto maker 3D + benefício concreto */
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto px-6">
            <div
              className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'hsl(173 58% 28% / 0.12)',
                border: '1px solid hsl(173 58% 28% / 0.25)',
              }}
            >
              <Package size={28} className="text-[hsl(173_30%_57%)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
              Cadastre o que você vende
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
              Um produto aqui é qualquer peça que você imprime e vende — suporte de celular, miniatura, peça técnica.
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              Ao cadastrar, o Hayzer calcula custo de impressão, margem de lucro e preço sugerido por marketplace.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 bg-[hsl(173_58%_28%)] hover:bg-[hsl(173_58%_32%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={15} /> Cadastrar meu primeiro produto
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={40} className="text-[#2a2a2a] mb-4" />
            <p className="text-[#555555] text-sm">
              Nenhum produto neste projeto.
            </p>
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
              onQuote={() => {
                window.location.href = `/orders?quote=${product.id}`
              }}
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
                orderCount={stats?.orderCount  ?? 0}
                totalRevenue={stats?.totalRevenue ?? 0}
                totalProfit={stats?.totalProfit  ?? 0}
                avgMargin={stats?.avgMargin    ?? 0}
                onEdit={() => setEditing(product)}
                onDelete={() => handleDelete(product.id)}
              />
            )
          })}
        </div>
      )}

      {/* ── Low-margin warning ───────────────────────────────────────────── */}
      {statsWithOrders.some(s => s.avgMargin < 20) && (
        <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" />
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

      {/* ── Modals ───────────────────────────────────────────────────────── */}
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
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
