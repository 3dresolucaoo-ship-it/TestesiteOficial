'use client'

import { useState, useMemo, useRef } from 'react'
import { useStore, uid } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import type { Product } from '@/lib/types'
import type { InventoryItem } from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, Package, Zap,
  Flame, Clock, AlertTriangle, TrendingUp, DollarSign, ImageIcon, Loader2,
  LayoutGrid, Wrench, FileText,
} from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { calcUnitCost, filamentCostPerKg, getProductStats } from '@/core/analytics/productionEngine'
import { productsService } from '@/services/products'

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
function CostPreview({
  materialGrams,
  printTimeHours,
  failureRate,
  energyCostPerHour,
  supportCost,
  marginPercentage,
  salePrice,
  filamentItem,
}: {
  materialGrams:     number
  printTimeHours:    number
  failureRate:       number
  energyCostPerHour: number
  supportCost:       number
  marginPercentage:  number
  salePrice:         number
  filamentItem:      InventoryItem | undefined
}) {
  const costPerKg  = filamentCostPerKg(filamentItem)
  const breakdown  = calcUnitCost(
    {
      id: '', projectId: '', name: '', notes: '',
      materialGrams, printTimeHours, failureRate, energyCostPerHour,
      supportCost, marginPercentage, salePrice,
    },
    filamentItem ? [filamentItem] : [],
  )
  // Auto price = cost × (1 + margin); manual price if set
  const autoPrice  = breakdown.totalCost * (1 + marginPercentage)
  const effectivePrice = salePrice > 0 ? salePrice : autoPrice
  const profit     = effectivePrice - breakdown.totalCost
  const margin     = effectivePrice > 0 ? (profit / effectivePrice) * 100 : 0

  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      <p className="text-[#555555] text-xs font-semibold uppercase tracking-wide">
        Previsão de Custo por Unidade
      </p>

      <div className="space-y-1.5">
        {[
          { label: 'Material',  value: breakdown.materialCost, color: 'text-[#3b82f6]' },
          { label: 'Energia',   value: breakdown.energyCost,   color: 'text-[#f59e0b]' },
          { label: 'Falhas',    value: breakdown.failureCost,  color: 'text-[#ef4444]' },
          ...(supportCost > 0 ? [{ label: 'Suporte / Overhead', value: supportCost, color: 'text-[#a78bfa]' }] : []),
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-[#555555] text-xs">{label}</span>
            <span className={`text-xs font-medium ${color}`}>{fmt(value)}</span>
          </div>
        ))}
        <div className="border-t border-[#2a2a2a] pt-1.5 flex justify-between items-center">
          <span className="text-[#888888] text-xs font-semibold">Custo Total</span>
          <span className="text-[#ebebeb] text-sm font-bold">{fmt(breakdown.totalCost)}</span>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] pt-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">
            {salePrice > 0 ? 'Preço de Venda (manual)' : `Preço Sugerido (+${(marginPercentage * 100).toFixed(0)}%)`}
          </span>
          <span className="text-[#ebebeb] text-xs font-medium">{fmt(effectivePrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">Lucro por Unidade</span>
          <span className={`text-xs font-semibold ${profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {fmt(profit)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#555555] text-xs">Margem Real</span>
          <span className={`text-sm font-bold ${margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'}`}>
            {fmtPct(margin)}
          </span>
        </div>
      </div>

      {filamentItem && (
        <p className="text-[#3a3a3a] text-[10px]">
          Filamento: {filamentItem.name} · {fmt(costPerKg)}/kg
        </p>
      )}
    </div>
  )
}

// ─── Product form ─────────────────────────────────────────────────────────────
type FormData = {
  projectId:         string
  name:              string
  materialGrams:     string
  printTimeHours:    string
  failureRate:       string  // 0–100 (%)
  energyCostPerHour: string
  supportCost:       string  // R$ fixed overhead per unit
  marginPercentage:  string  // 0–100 (%)
  salePrice:         string
  inventoryItemId:   string
  notes:             string
  imageUrl:          string
}

function ProductForm({
  projects,
  inventory,
  initial,
  onSave,
  onClose,
}: {
  projects:  { id: string; name: string }[]
  inventory: InventoryItem[]
  initial?:  FormData
  onSave:    (d: FormData) => void
  onClose:   () => void
}) {
  const [data, setData] = useState<FormData>(
    initial ?? {
      projectId:         projects[0]?.id ?? '',
      name:              '',
      materialGrams:     '100',
      printTimeHours:    '2',
      failureRate:       '10',
      energyCostPerHour: '0.50',
      supportCost:       '0',
      marginPercentage:  '30',
      salePrice:         '',
      inventoryItemId:   '',
      notes:             '',
      imageUrl:          '',
    },
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingProductId = useRef<string>(uid())

  const set =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !isSupabaseConfigured) return
    setUploading(true)
    try {
      const url = await productsService.uploadImage(pendingProductId.current, file)
      setData(p => ({ ...p, imageUrl: url }))
    } catch (err) {
      console.error('[uploadImage]', err)
    } finally {
      setUploading(false)
    }
  }

  // Reset filament when project changes
  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setData(p => ({ ...p, projectId: e.target.value, inventoryItemId: '' }))
  }

  const projectFilaments = inventory.filter(
    i => i.projectId === data.projectId && i.category === 'filament',
  )
  const selectedFilament = projectFilaments.find(i => i.id === data.inventoryItemId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={handleProjectChange}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>

      <FormField label="Nome do Produto">
        <Input
          value={data.name}
          onChange={set('name')}
          placeholder="Ex: Suporte Celular Ajustável"
          required
        />
      </FormField>

      {/* Print specs */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Material (g/peça)">
          <Input
            type="number"
            value={data.materialGrams}
            onChange={set('materialGrams')}
            min="0"
            step="0.1"
            placeholder="100"
          />
        </FormField>
        <FormField label="Tempo de Impressão (h)">
          <Input
            type="number"
            value={data.printTimeHours}
            onChange={set('printTimeHours')}
            min="0"
            step="0.1"
            placeholder="2"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Taxa de Falha (%)">
          <Input
            type="number"
            value={data.failureRate}
            onChange={set('failureRate')}
            min="0"
            max="100"
            step="1"
            placeholder="10"
          />
        </FormField>
        <FormField label="Custo de Energia (R$/h)">
          <Input
            type="number"
            value={data.energyCostPerHour}
            onChange={set('energyCostPerHour')}
            min="0"
            step="0.01"
            placeholder="0.50"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Custo de Suporte (R$/peça)">
          <Input
            type="number"
            value={data.supportCost}
            onChange={set('supportCost')}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </FormField>
        <FormField label="Margem Desejada (%)">
          <Input
            type="number"
            value={data.marginPercentage}
            onChange={set('marginPercentage')}
            min="0"
            max="1000"
            step="1"
            placeholder="30"
          />
        </FormField>
      </div>

      <FormField label="Filamento Utilizado">
        <Select value={data.inventoryItemId} onChange={set('inventoryItemId')}>
          <option value="">Não especificado (usa R$80/kg padrão)</option>
          {projectFilaments.map(i => (
            <option key={i.id} value={i.id}>
              {i.name} — {fmt(i.costPrice)}/{i.unit}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Preço de Venda (R$)">
        <Input
          type="number"
          value={data.salePrice}
          onChange={set('salePrice')}
          min="0"
          step="0.01"
          placeholder="0,00"
        />
      </FormField>

      {/* Live cost preview */}
      <CostPreview
        materialGrams={parseFloat(data.materialGrams) || 0}
        printTimeHours={parseFloat(data.printTimeHours) || 0}
        failureRate={(parseFloat(data.failureRate) || 0) / 100}
        energyCostPerHour={parseFloat(data.energyCostPerHour) || 0.5}
        supportCost={parseFloat(data.supportCost) || 0}
        marginPercentage={(parseFloat(data.marginPercentage) || 30) / 100}
        salePrice={parseFloat(data.salePrice) || 0}
        filamentItem={selectedFilament}
      />

      {/* Image upload (Supabase Storage) */}
      {isSupabaseConfigured && (
        <div className="space-y-2">
          <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Imagem do Produto (opcional)</p>
          <div
            className="flex items-center gap-3 border border-dashed border-[#3a3a3a] rounded-xl p-4 cursor-pointer hover:border-[#7c3aed55] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {data.imageUrl ? (
              <img src={data.imageUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#1c1c1c] flex items-center justify-center shrink-0">
                {uploading ? (
                  <Loader2 size={16} className="text-[#555555] animate-spin" />
                ) : (
                  <ImageIcon size={16} className="text-[#555555]" />
                )}
              </div>
            )}
            <div>
              <p className="text-[#ebebeb] text-sm font-medium">
                {uploading ? 'Enviando…' : data.imageUrl ? 'Alterar imagem' : 'Adicionar imagem'}
              </p>
              <p className="text-[#555555] text-xs">JPG, PNG ou WebP · max 5 MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      <FormField label="Observações (opcional)">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas sobre o produto..." />
      </FormField>

      <SubmitButton>{initial ? 'Salvar Alterações' : 'Criar Produto'}</SubmitButton>
    </form>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────
// ─── Catalog card (visual, portfolio-style) ───────────────────────────────────
function CatalogCard({
  product,
  projectName,
  filamentItem,
  onEdit,
  onDelete,
  onQuote,
}: {
  product:      Product
  projectName:  string
  filamentItem: InventoryItem | undefined
  onEdit:       () => void
  onDelete:     () => void
  onQuote:      () => void
}) {
  const breakdown = calcUnitCost(product, filamentItem ? [filamentItem] : [])
  const price = product.salePrice > 0
    ? product.salePrice
    : breakdown.totalCost * (1 + (product.marginPercentage ?? 0.3))
  const unitMargin = price > 0
    ? ((price - breakdown.totalCost) / price) * 100
    : 0

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border transition-all"
      style={{
        background: 'var(--t-card-from)',
        borderColor: 'var(--t-card-border)',
        boxShadow: 'var(--t-card-shadow)',
      }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: 'var(--t-hover)' }}
      >
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--t-text-muted)' }}>
            <Package size={44} />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: 'var(--t-accent-soft)', color: 'var(--t-accent)' }}
          >
            {projectName}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/75 to-transparent">
          <button
            onClick={onQuote}
            className="flex-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#10b9811a] text-[#10b981] border border-[#10b98133] hover:bg-[#10b98133]"
          >
            <FileText size={11} className="inline mr-1" /> Orçar
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-white"
            title="Editar"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-[#ef4444]"
            title="Excluir"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--t-text-primary)' }}
          title={product.name}
        >
          {product.name}
        </p>
        {product.notes && (
          <p className="text-[11px] truncate" style={{ color: 'var(--t-text-muted)' }}>
            {product.notes}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--t-accent)' }}>
              {fmt(price)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--t-text-muted)' }}>
              custo {fmt(breakdown.totalCost)}
            </p>
          </div>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: 'var(--t-accent-soft)',
              color: unitMargin >= 40 ? '#10b981' : unitMargin >= 20 ? 'var(--t-accent)' : '#f59e0b',
            }}
          >
            {fmtPct(unitMargin)}
          </span>
        </div>
      </div>
    </div>
  )
}

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
  const { state, dispatch, dbError } = useStore()
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

  function handleCreate(data: FormData) {
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
        salePrice:         parseFloat(data.salePrice)         || 0,
        inventoryItemId:   data.inventoryItemId || undefined,
        notes:             data.notes.trim(),
        imageUrl:          data.imageUrl || undefined,
      },
    })
  }

  function handleEdit(data: FormData) {
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
        salePrice:         parseFloat(data.salePrice)         || 0,
        inventoryItemId:   data.inventoryItemId || undefined,
        notes:             data.notes.trim(),
        imageUrl:          data.imageUrl || undefined,
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="text-[#2a2a2a] mb-4" />
          <p className="text-[#555555] text-sm">
            {products.length === 0
              ? 'Nenhum produto cadastrado ainda.'
              : 'Nenhum produto neste projeto.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setCreating(true)}
              className="mt-4 flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> Criar Primeiro Produto
            </button>
          )}
        </div>
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
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
