'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import type { Order, OrderStatus, OrderOrigin, InventoryItem } from '@/lib/types'
import type { Product } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Package, Cpu, Zap } from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'
import { calcUnitCost } from '@/core/analytics/productionEngine'

// ─── Status / origin config ───────────────────────────────────────────────────
const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  lead:        { label: 'Lead',       color: 'text-[#888888] bg-[#88888818] border-[#88888833]' },
  quote_sent:  { label: 'Orçamento',  color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]' },
  paid:        { label: 'Pago',       color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
  delivered:   { label: 'Entregue',   color: 'text-[#a78bfa] bg-[#7c3aed1a] border-[#7c3aed33]' },
}

const originLabels: Record<OrderOrigin, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  other: 'Outro',
}

const originColors: Record<OrderOrigin, string> = {
  whatsapp: 'text-[#10b981]',
  instagram: 'text-[#f59e0b]',
  facebook: 'text-[#3b82f6]',
  other: 'text-[#888888]',
}

function Badge({ status }: { status: OrderStatus }) {
  const { label, color } = statusConfig[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{label}</span>
}

// ─── Inline cost preview (compact) ───────────────────────────────────────────
function OrderCostPreview({ product, inventory, salePrice }: {
  product:   Product
  inventory: InventoryItem[]
  salePrice: number
}) {
  const breakdown = calcUnitCost(product, inventory)
  const profit    = salePrice - breakdown.totalCost
  const margin    = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const fmt       = (v: number) => `R$ ${v.toFixed(2)}`

  return (
    <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Cpu size={11} className="text-[#555555]" />
        <p className="text-[#555555] text-[10px] font-semibold uppercase tracking-wide">
          Custo de Produção
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Material', value: breakdown.materialCost, color: 'text-[#3b82f6]' },
          { label: 'Energia',  value: breakdown.energyCost,   color: 'text-[#f59e0b]' },
          { label: 'Falha',    value: breakdown.failureCost,  color: 'text-[#ef4444]' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-xs font-semibold ${color}`}>{fmt(value)}</p>
            <p className="text-[#3a3a3a] text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2a2a2a] pt-2 flex items-center justify-between">
        <div>
          <span className="text-[#888888] text-xs">Custo total: </span>
          <span className="text-[#ebebeb] text-xs font-bold">{fmt(breakdown.totalCost)}</span>
        </div>
        {salePrice > 0 && (
          <div className="text-right">
            <span className="text-[#888888] text-xs">Margem: </span>
            <span className={`text-xs font-bold ${
              margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
            }`}>
              {margin.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────
type FormData = {
  projectId:       string
  clientName:      string
  origin:          OrderOrigin
  item:            string
  value:           string
  status:          OrderStatus
  date:            string
  inventoryItemId: string
  qtyUsed:         string
  productId:       string   // product template (optional)
}

function OrderForm({ projects, inventory, products, initial, onSave, onClose }: {
  projects:  { id: string; name: string }[]
  inventory: InventoryItem[]
  products:  Product[]
  initial?:  FormData
  onSave:    (d: FormData) => void
  onClose:   () => void
}) {
  const [data, setData] = useState<FormData>(initial ?? {
    projectId: projects[0]?.id ?? '', clientName: '', origin: 'whatsapp',
    item: '', value: '', status: 'lead', date: new Date().toISOString().slice(0, 10),
    inventoryItemId: '', qtyUsed: '1', productId: '',
  })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(prev => ({ ...prev, [k]: e.target.value }))

  // ── When project changes, reset linked product + inventory ─────────────────
  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setData(prev => ({ ...prev, projectId: e.target.value, productId: '', inventoryItemId: '', qtyUsed: '1' }))
  }

  // ── When a product template is selected, auto-fill form fields ─────────────
  function handleProductChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pid = e.target.value
    if (!pid) {
      setData(prev => ({ ...prev, productId: '' }))
      return
    }
    const product = products.find(p => p.id === pid)
    if (!product) return

    // Determine auto qty based on inventory unit
    const filamentItem = product.inventoryItemId
      ? inventory.find(i => i.id === product.inventoryItemId)
      : undefined
    const breakdown = calcUnitCost(product, inventory)
    let autoQty = '1'
    if (filamentItem) {
      autoQty = filamentItem.unit === 'g'
        ? String(breakdown.filamentUsedGrams)
        : String(Math.round(breakdown.filamentUsedGrams / 10) / 100)  // kg, 2 d.p.
    }

    setData(prev => ({
      ...prev,
      productId:       pid,
      item:            product.name,
      value:           product.salePrice > 0 ? String(product.salePrice) : prev.value,
      inventoryItemId: product.inventoryItemId ?? '',
      qtyUsed:         product.inventoryItemId ? autoQty : '1',
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.clientName.trim() || !data.item.trim()) return
    onSave(data)
    onClose()
  }

  const projectProducts  = products.filter(p => p.projectId === data.projectId)
  const projectInventory = inventory.filter(i => i.projectId === data.projectId)
  const selectedProduct  = projectProducts.find(p => p.id === data.productId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={handleProjectChange}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>

      {/* ── Product template selector (3D print products) ─────────────────── */}
      {projectProducts.length > 0 && (
        <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-[#7c3aed]" />
            <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Produto 3D (opcional)</p>
          </div>
          <FormField label="Usar Template de Produto">
            <Select value={data.productId} onChange={handleProductChange}>
              <option value="">Pedido avulso (sem template)</option>
              {projectProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.salePrice > 0 ? ` — R$ ${p.salePrice.toFixed(2)}` : ''}
                </option>
              ))}
            </Select>
          </FormField>
          {selectedProduct && (
            <p className="text-[#555555] text-xs">
              Item, valor e filamento preenchidos automaticamente. A impressão será agendada ao criar o pedido.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Cliente">
          <Input value={data.clientName} onChange={set('clientName')} placeholder="Nome do cliente" required />
        </FormField>
        <FormField label="Origem">
          <Select value={data.origin} onChange={set('origin')}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="other">Outro</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Item / Pedido">
        <Input value={data.item} onChange={set('item')} placeholder="Descrição do pedido" required />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor (R$)">
          <Input type="number" value={data.value} onChange={set('value')} placeholder="0" min="0" />
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="lead">Lead</option>
            <option value="quote_sent">Orçamento Enviado</option>
            <option value="paid">Pago</option>
            <option value="delivered">Entregue</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>

      {/* ── Live cost preview (when product template selected) ────────────── */}
      {selectedProduct && (
        <OrderCostPreview
          product={selectedProduct}
          inventory={inventory}
          salePrice={parseFloat(data.value) || 0}
        />
      )}

      {/* ── Manual inventory link (only shown when no product template) ────── */}
      {!selectedProduct && projectInventory.length > 0 && (
        <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package size={13} className="text-[#555555]" />
            <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Estoque (opcional)</p>
          </div>
          <FormField label="Vincular ao Estoque">
            <Select value={data.inventoryItemId} onChange={set('inventoryItemId')}>
              <option value="">Não descontar do estoque</option>
              {projectInventory.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (disponível: {i.quantity} {i.unit})
                </option>
              ))}
            </Select>
          </FormField>
          {data.inventoryItemId && (
            <FormField label="Quantidade vendida">
              <Input type="number" value={data.qtyUsed} onChange={set('qtyUsed')} min="0.01" step="0.01" />
            </FormField>
          )}
          {data.inventoryItemId && (
            <p className="text-[#555555] text-xs">
              O estoque será decrementado automaticamente quando o pedido for marcado como{' '}
              <span className="text-[#10b981]">Pago</span>.
            </p>
          )}
        </div>
      )}

      {/* ── Inventory link info when product template is used ─────────────── */}
      {selectedProduct && data.inventoryItemId && (
        <div className="flex items-center gap-2 bg-[#7c3aed0d] border border-[#7c3aed22] rounded-lg px-3 py-2">
          <Zap size={12} className="text-[#a78bfa] shrink-0" />
          <p className="text-[#a78bfa] text-xs">
            {inventory.find(i => i.id === data.inventoryItemId)?.name ?? 'Filamento'} será decrementado
            em {data.qtyUsed} {inventory.find(i => i.id === data.inventoryItemId)?.unit ?? ''} ao pagar.
          </p>
        </div>
      )}

      <SubmitButton>{initial ? 'Salvar' : 'Criar Pedido'}</SubmitButton>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const ALL = 'all'

export default function OrdersPage() {
  const { state, dispatch, loading } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState<Order | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter,        setFilter]        = useState<OrderStatus | typeof ALL>(ALL)
  const [filterProject, setFilterProject] = useState<string>('all')

  // ── Helpers ────────────────────────────────────────────────────────────────
  const byProject   = filterProject === 'all' ? state.orders : state.orders.filter(o => o.projectId === filterProject)
  const filtered    = filter === ALL ? byProject : byProject.filter(o => o.status === filter)
  const sorted      = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const projectName = (id: string) => state.projects.find(p => p.id === id)?.name ?? '—'
  const productName = (id: string | undefined) => id ? state.products.find(p => p.id === id)?.name : undefined

  const statusCounts = useMemo(() =>
    Object.keys(statusConfig).reduce((acc, k) => {
      acc[k] = byProject.filter(o => o.status === k).length
      return acc
    }, {} as Record<string, number>),
  [byProject])

  // ── Create ─────────────────────────────────────────────────────────────────
  // In Supabase mode: dispatch(ADD_ORDER) → syncAction → processNewOrder handles
  //   all side effects (production task, transaction, inventory decrement) and
  //   rawDispatches each result to update local state.
  // In local mode: reducer is pure, so we dispatch side effects manually here.
  function handleCreate(data: FormData) {
    const newOrderId = uid()
    const product    = data.productId ? state.products.find(p => p.id === data.productId) : undefined
    const productionCost = product
      ? calcUnitCost(product, state.inventory).totalCost
      : undefined

    const order: Order = {
      id:              newOrderId,
      projectId:       data.projectId,
      clientName:      data.clientName,
      origin:          data.origin,
      item:            data.item,
      value:           parseFloat(data.value) || 0,
      status:          data.status,
      date:            data.date,
      inventoryItemId: data.inventoryItemId || undefined,
      qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
      productId:       product?.id,
      productionCost,
    }

    dispatch({ type: 'ADD_ORDER', payload: order })

    // Local-only side effects (syncAction handles these in Supabase mode)
    if (!isSupabaseConfigured) {
      if (product) {
        dispatch({
          type: 'ADD_PRODUCTION',
          payload: {
            id:             uid(),
            orderId:        newOrderId,
            clientName:     data.clientName,
            item:           product.name,
            printer:        'bambu',
            status:         'waiting',
            estimatedHours: product.printTimeHours,
            priority:       state.production.length + 1,
          },
        })
      }
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  // processOrderUpdate (called by syncAction) handles the paid-transition side
  // effects in Supabase mode. In local mode, we rely on the reducer being pure
  // (no auto-side-effects), so we accept that local mode won't auto-apply
  // inventory/transaction effects on edit — which is acceptable since local mode
  // is only used for development without a real database.
  function handleEdit(data: FormData) {
    if (!editing) return
    const product = data.productId ? state.products.find(p => p.id === data.productId) : undefined
    const productionCost = product
      ? calcUnitCost(product, state.inventory).totalCost
      : editing.productionCost  // preserve original cost if template removed

    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        ...editing,
        projectId:       data.projectId,
        clientName:      data.clientName,
        origin:          data.origin,
        item:            data.item,
        value:           parseFloat(data.value) || 0,
        status:          data.status,
        date:            data.date,
        inventoryItemId: data.inventoryItemId || undefined,
        qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
        productId:       product?.id,
        productionCost,
      },
    })
    setEditing(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_ORDER', payload: id })
    setMenuOpen(null)
  }

  if (loading) return null
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Vendas</h2>
          <p className="text-[#555555] text-sm">
            {byProject.length} pedidos · R${' '}
            {byProject
              .filter(o => o.status === 'paid' || o.status === 'delivered')
              .reduce((s, o) => s + o.value, 0)
              .toFixed(0)}{' '}
            faturados
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Novo Pedido
        </button>
      </div>

      {/* Project filter */}
      <select
        value={filterProject}
        onChange={e => setFilterProject(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] transition-colors"
      >
        <option value="all">Todos os projetos</option>
        {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter(ALL)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === ALL
              ? 'bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]'
              : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'
          }`}
        >
          Todos <span className="text-[#555555]">{byProject.length}</span>
        </button>
        {(Object.entries(statusConfig) as [OrderStatus, typeof statusConfig[OrderStatus]][]).map(([s, { label }]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]'
                : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'
            }`}
          >
            {label} <span className="text-[#555555]">{statusCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* ── Mobile cards ─────────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {sorted.length === 0 && (
          <p className="text-center text-[#555555] text-sm py-12">Nenhum pedido encontrado.</p>
        )}
        {sorted.map(o => {
          const pName = productName(o.productId)
          return (
            <div key={o.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-[#ebebeb] font-medium text-sm">{o.clientName}</p>
                  <p className="text-[#555555] text-xs mt-0.5 truncate">{o.item}</p>
                  {pName && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Cpu size={10} className="text-[#7c3aed]" />
                      <span className="text-[#7c3aed] text-[10px]">{pName}</span>
                    </div>
                  )}
                  <p className="text-[#3a3a3a] text-xs mt-0.5">
                    {projectName(o.projectId)} · {new Date(o.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#ebebeb] font-semibold text-sm">R$ {o.value.toFixed(2)}</p>
                  {o.productionCost != null && (
                    <p className="text-[#555555] text-[10px]">custo R$ {o.productionCost.toFixed(2)}</p>
                  )}
                  <div className="mt-1"><Badge status={o.status} /></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#1c1c1c] pt-3">
                <span className={`text-xs font-medium ${originColors[o.origin]}`}>{originLabels[o.origin]}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(o)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] text-xs transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef44441a] text-xs transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop table ──────────────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#555555] text-sm">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Projeto</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Origem</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">Item</th>
                  <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Valor</th>
                  <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">Custo</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Status</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(o => {
                  const margin = o.productionCost != null && o.value > 0
                    ? ((o.value - o.productionCost) / o.value) * 100
                    : null
                  return (
                    <tr key={o.id} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[#ebebeb] text-sm font-medium">{o.clientName}</p>
                        <p className="text-[#555555] text-xs">{new Date(o.date).toLocaleDateString('pt-BR')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#888888] text-sm">{projectName(o.projectId)}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-sm font-medium ${originColors[o.origin]}`}>{originLabels[o.origin]}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div>
                          <span className="text-[#888888] text-sm truncate max-w-[180px] block">{o.item}</span>
                          {o.productId && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Cpu size={10} className="text-[#7c3aed]" />
                              <span className="text-[#7c3aed] text-[10px]">produto vinculado</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#ebebeb] text-sm font-semibold">R$ {o.value.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {o.productionCost != null ? (
                          <div>
                            <span className="text-[#555555] text-xs">R$ {o.productionCost.toFixed(2)}</span>
                            {margin !== null && (
                              <p className={`text-[10px] font-medium ${
                                margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
                              }`}>
                                {margin.toFixed(0)}% margem
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#3a3a3a] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={o.status} />
                      </td>
                      <td className="px-2 py-3 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)}
                          className="p-1.5 text-[#555555] hover:text-[#ebebeb] transition-colors rounded-lg hover:bg-[#2a2a2a]"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === o.id && (
                          <div className="absolute right-2 top-10 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                            <button
                              onClick={() => { setEditing(o); setMenuOpen(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                            >
                              <Pencil size={13} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                            >
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Novo Pedido" onClose={() => setCreating(false)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Pedido" onClose={() => setEditing(null)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            initial={{
              projectId:       editing.projectId,
              clientName:      editing.clientName,
              origin:          editing.origin,
              item:            editing.item,
              value:           String(editing.value),
              status:          editing.status,
              date:            editing.date,
              inventoryItemId: editing.inventoryItemId ?? '',
              qtyUsed:         String(editing.qtyUsed ?? 1),
              productId:       editing.productId ?? '',
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
