'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import type { InventoryItem, InventoryCategory, StockMovement, MovementReason } from '@/lib/types'
import {
  INVENTORY_CATEGORY_LABELS,
  MOVEMENT_REASON_LABELS,
  MOVEMENT_REASONS_BY_TYPE,
} from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle,
  Package, TrendingUp, ArrowDownLeft, ArrowUpRight, Search,
  DollarSign, Layers,
} from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

// ─── Constants ────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<InventoryCategory, { badge: string; bar: string }> = {
  filament:  { badge: 'text-[#7c3aed] bg-[#7c3aed1a] border-[#7c3aed33]', bar: 'bg-[#7c3aed]' },
  product:   { badge: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', bar: 'bg-[#10b981]' },
  equipment: { badge: 'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]', bar: 'bg-[#3b82f6]' },
  other:     { badge: 'text-[#888888] bg-[#88888818] border-[#88888833]', bar: 'bg-[#888888]' },
}

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Parse YYYY-MM-DD as a local date — avoids UTC→timezone shift. */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Category badge ───────────────────────────────────────────────────────────
function CatBadge({ cat }: { cat: InventoryCategory }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${CAT_COLORS[cat].badge}`}>
      {INVENTORY_CATEGORY_LABELS[cat]}
    </span>
  )
}

// ─── Item form ────────────────────────────────────────────────────────────────
type ItemFormData = {
  category: InventoryCategory; name: string; sku: string
  quantity: string; unit: string; costPrice: string; salePrice: string
  notes: string; minStock: string
}

function ItemForm({ initial, onSave, onClose }: {
  initial?: ItemFormData; onSave: (d: ItemFormData) => void; onClose: () => void
}) {
  const [data, setData] = useState<ItemFormData>(initial ?? {
    category: 'product', name: '', sku: '', quantity: '1',
    unit: 'un', costPrice: '', salePrice: '', notes: '', minStock: '2',
  })
  const set = (k: keyof ItemFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoria">
          <Select value={data.category} onChange={set('category')}>
            {Object.entries(INVENTORY_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </FormField>
        <FormField label="Unidade">
          <Select value={data.unit} onChange={set('unit')}>
            <option value="un">un</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="m">m</option>
            <option value="l">l</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Nome do Item">
        <Input value={data.name} onChange={set('name')} placeholder="Ex: Suporte Monitor Ajustável" required />
      </FormField>
      <FormField label="SKU">
        <Input value={data.sku} onChange={set('sku')} placeholder="Ex: PRD-SMN-001" />
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Quantidade">
          <Input type="number" value={data.quantity} onChange={set('quantity')} min="0" step="0.01" />
        </FormField>
        <FormField label="Custo (R$)">
          <Input type="number" value={data.costPrice} onChange={set('costPrice')} min="0" step="0.01" placeholder="0,00" />
        </FormField>
        <FormField label="Venda (R$)">
          <Input type="number" value={data.salePrice} onChange={set('salePrice')} min="0" step="0.01" placeholder="0,00" />
        </FormField>
      </div>
      <FormField label="Alerta Mínimo (qtd)">
        <Input type="number" value={data.minStock} onChange={set('minStock')} min="0" step="1" />
      </FormField>
      <FormField label="Observações">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas opcionais..." />
      </FormField>
      <SubmitButton>{initial ? 'Salvar' : 'Adicionar Item'}</SubmitButton>
    </form>
  )
}

// ─── Movement (Entrada / Saída) form ─────────────────────────────────────────
type MovementFormData = {
  itemId: string; type: 'in' | 'out'; quantity: string
  reason: MovementReason; date: string; notes: string
}

function MovementForm({ items, defaultItemId, defaultType, onSave, onClose }: {
  items: InventoryItem[]
  defaultItemId?: string
  defaultType?: 'in' | 'out'
  onSave: (d: MovementFormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<MovementFormData>({
    itemId: defaultItemId ?? items[0]?.id ?? '',
    type: defaultType ?? 'in',
    quantity: '1',
    reason: defaultType === 'out' ? 'sale' : 'purchase',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const set = (k: keyof MovementFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  const reasonOptions = MOVEMENT_REASONS_BY_TYPE[data.type]

  function handleTypeChange(t: 'in' | 'out') {
    setData(p => ({ ...p, type: t, reason: MOVEMENT_REASONS_BY_TYPE[t][0] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseFloat(data.quantity) || 0
    if (qty <= 0 || !data.itemId) return
    onSave(data)
    onClose()
  }

  const selectedItem = items.find(i => i.id === data.itemId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['in', 'out'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => handleTypeChange(t)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
              data.type === t
                ? t === 'in'
                  ? 'bg-[#10b9811a] text-[#10b981] border-[#10b98133]'
                  : 'bg-[#ef44441a] text-[#ef4444] border-[#ef444433]'
                : 'bg-transparent text-[#888888] border-[#2a2a2a]'
            }`}
          >
            {t === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
            {t === 'in' ? 'Entrada' : 'Saída'}
          </button>
        ))}
      </div>

      {/* Item selector (hidden when opened from a specific item) */}
      {!defaultItemId && (
        <FormField label="Item">
          <Select value={data.itemId} onChange={set('itemId')}>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </FormField>
      )}
      {defaultItemId && selectedItem && (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2">
          <p className="text-[#555555] text-xs">Item</p>
          <p className="text-[#ebebeb] text-sm font-medium">{selectedItem.name}</p>
          <p className="text-[#555555] text-xs">Estoque atual: {selectedItem.quantity} {selectedItem.unit}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Quantidade">
          <Input type="number" value={data.quantity} onChange={set('quantity')} min="0.01" step="0.01" required />
        </FormField>
        <FormField label="Motivo">
          <Select value={data.reason} onChange={set('reason')}>
            {reasonOptions.map(r => <option key={r} value={r}>{MOVEMENT_REASON_LABELS[r]}</option>)}
          </Select>
        </FormField>
      </div>
      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>
      <FormField label="Observações">
        <Input value={data.notes} onChange={set('notes')} placeholder="Opcional..." />
      </FormField>
      <SubmitButton>
        {data.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
      </SubmitButton>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectInventoryPage() {
  const { projectId } = useParams() as { projectId: string }
  const { state, dispatch } = useStore()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [movementItem, setMovementItem] = useState<{ item?: InventoryItem; type: 'in' | 'out' } | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<InventoryCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const items = state.inventory.filter(i => i.projectId === projectId)
  const movements = state.movements
    .filter(m => m.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const filtered = useMemo(() => {
    let list = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    }
    return list
  }, [items, filterCat, search])

  const lowStock = items.filter(i => i.quantity <= (i.minStock ?? 2))
  const stockValue   = items.reduce((s, i) => s + i.costPrice * i.quantity, 0)
  const saleValue    = items.reduce((s, i) => s + (i.salePrice > 0 ? i.salePrice * i.quantity : 0), 0)

  // Category value breakdown
  const catValues = (Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]).map(cat => ({
    cat,
    value: items.filter(i => i.category === cat).reduce((s, i) => s + i.costPrice * i.quantity, 0),
    count: items.filter(i => i.category === cat).length,
  })).filter(c => c.count > 0)
  const maxCatValue = Math.max(...catValues.map(c => c.value), 1)

  function handleCreate(data: ItemFormData) {
    dispatch({
      type: 'ADD_INVENTORY',
      payload: {
        id: uid(), projectId, ...data,
        quantity: parseFloat(data.quantity) || 0,
        costPrice: parseFloat(data.costPrice) || 0,
        salePrice: parseFloat(data.salePrice) || 0,
        minStock: parseInt(data.minStock) || 2,
      },
    })
  }

  function handleEdit(data: ItemFormData) {
    if (!editing) return
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        ...editing, ...data,
        quantity: parseFloat(data.quantity) || 0,
        costPrice: parseFloat(data.costPrice) || 0,
        salePrice: parseFloat(data.salePrice) || 0,
        minStock: parseInt(data.minStock) || 2,
      },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_INVENTORY', payload: id })
    setMenuOpen(null)
  }

  function handleMovement(data: MovementFormData) {
    const qty = parseFloat(data.quantity) || 0
    const delta = data.type === 'in' ? qty : -qty
    const movement: StockMovement = {
      id: uid(),
      projectId,
      itemId: data.itemId,
      type: data.type,
      quantity: qty,
      reason: data.reason,
      date: data.date,
      notes: data.notes,
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: data.itemId, delta } })
  }

  function quickAdjust(item: InventoryItem, delta: number) {
    const movement: StockMovement = {
      id: uid(),
      projectId,
      itemId: item.id,
      type: delta > 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      reason: delta > 0 ? 'purchase' : 'adjustment',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: item.id, delta } })
  }

  const itemName = (id: string) => items.find(i => i.id === id)?.name ?? id

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Estoque</h2>
          <p className="text-[#555555] text-sm">{items.length} itens · {movements.length} movimentações</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMovementItem({ type: 'in' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowDownLeft size={14} /> Entrada
          </button>
          <button
            onClick={() => setMovementItem({ type: 'out' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowUpRight size={14} /> Saída
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Item
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de Itens',   value: items.length,           suffix: '',    icon: Package,    color: 'text-[#a78bfa]', bg: 'bg-[#7c3aed1a]' },
          { label: 'Valor em Custo',   value: fmt(stockValue),        suffix: '',    icon: DollarSign, color: 'text-[#3b82f6]', bg: 'bg-[#3b82f61a]' },
          { label: 'Pot. de Venda',    value: saleValue > 0 ? fmt(saleValue) : '—', suffix: '', icon: TrendingUp,  color: 'text-[#10b981]', bg: 'bg-[#10b9811a]' },
          { label: 'Em Alerta',        value: lowStock.length,        suffix: ' itens', icon: AlertTriangle, color: lowStock.length > 0 ? 'text-[#f59e0b]' : 'text-[#555555]', bg: lowStock.length > 0 ? 'bg-[#f59e0b1a]' : 'bg-[#1c1c1c]' },
        ].map(({ label, value, suffix, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${bg}`}><Icon size={13} className={color} /></div>
              <span className="text-[#555555] text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}{suffix}</p>
          </div>
        ))}
      </div>

      {/* Category value breakdown */}
      {catValues.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-[#555555]" />
            <p className="text-[#ebebeb] text-sm font-medium">Valor por Categoria</p>
          </div>
          <div className="space-y-3">
            {catValues.map(({ cat, value, count }) => (
              <div key={cat}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="flex items-center gap-2">
                    <CatBadge cat={cat} />
                    <span className="text-[#555555] text-xs">{count} {count === 1 ? 'item' : 'itens'}</span>
                  </span>
                  <span className="text-[#ebebeb] text-xs font-semibold">{fmt(value)}</span>
                </div>
                <div className="h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(value / maxCatValue) * 100}%` }}
                    className={`h-full rounded-full transition-all ${CAT_COLORS[cat].bar}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" />
          <div>
            <p className="text-[#f59e0b] text-sm font-medium">Estoque Baixo — {lowStock.length} {lowStock.length === 1 ? 'item' : 'itens'}</p>
            <p className="text-[#f59e0b] text-xs opacity-70 mt-0.5">{lowStock.map(i => `${i.name} (${i.quantity}${i.unit !== 'un' ? i.unit : ''})`).join(' · ')}</p>
          </div>
        </div>
      )}

      {/* Filter + search */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterCat === 'all' ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
        >
          Todos ({items.length})
        </button>
        {(Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]).map(c => {
          const count = items.filter(i => i.category === c).length
          if (count === 0) return null
          return (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterCat === c ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
            >
              {INVENTORY_CATEGORY_LABELS[c]} ({count})
            </button>
          )
        })}
        <div className="relative ml-auto">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-36"
          />
        </div>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package size={32} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#555555] text-sm">Nenhum item encontrado.</p>
          </div>
        )}
        {filtered.map(item => {
          const isLow = item.quantity <= (item.minStock ?? 2)
          const margin = item.salePrice > 0 && item.costPrice > 0
            ? ((item.salePrice - item.costPrice) / item.salePrice) * 100
            : null

          return (
            <div
              key={item.id}
              className={`bg-[#141414] border rounded-xl p-4 flex items-center gap-4 group hover:border-[#3a3a3a] transition-colors ${isLow ? 'border-[#f59e0b33]' : 'border-[#2a2a2a]'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <CatBadge cat={item.category} />
                  {isLow && (
                    <span className="text-[#f59e0b] text-xs flex items-center gap-1">
                      <AlertTriangle size={10} /> Baixo
                    </span>
                  )}
                  {item.sku && <span className="text-[#3a3a3a] text-xs">{item.sku}</span>}
                </div>
                <p className="text-[#ebebeb] text-sm font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {item.costPrice > 0 && <span className="text-[#555555] text-xs">Custo {fmt(item.costPrice)}</span>}
                  {item.salePrice > 0 && <span className="text-[#555555] text-xs">Venda {fmt(item.salePrice)}</span>}
                  {margin !== null && (
                    <span className={`text-xs font-medium ${margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'}`}>
                      {margin.toFixed(0)}% margem
                    </span>
                  )}
                  {item.notes && <span className="text-[#3a3a3a] text-xs truncate max-w-[180px]">{item.notes}</span>}
                </div>
              </div>

              {/* Quick entrada/saída */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setMovementItem({ item, type: 'in' })}
                  title="Registrar entrada"
                  className="px-2 py-1 rounded-lg text-xs text-[#10b981] hover:bg-[#10b9811a] transition-colors border border-transparent hover:border-[#10b98122]"
                >
                  + Entrada
                </button>
                <button
                  onClick={() => setMovementItem({ item, type: 'out' })}
                  title="Registrar saída"
                  className="px-2 py-1 rounded-lg text-xs text-[#ef4444] hover:bg-[#ef44441a] transition-colors border border-transparent hover:border-[#ef444422]"
                >
                  − Saída
                </button>
              </div>

              {/* Quantity control */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => quickAdjust(item, -1)}
                  className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
                >−</button>
                <span className={`text-sm font-bold w-10 text-center tabular-nums ${isLow ? 'text-[#f59e0b]' : 'text-[#ebebeb]'}`}>
                  {item.quantity}{item.unit !== 'un' ? <span className="text-[#555555] text-xs font-normal ml-0.5">{item.unit}</span> : ''}
                </span>
                <button
                  onClick={() => quickAdjust(item, 1)}
                  className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
                >+</button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                  className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen === item.id && (
                  <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                    <button
                      onClick={() => { setEditing(item); setMenuOpen(null) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                    >
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Movement log */}
      {movements.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#2a2a2a]">
            <p className="text-[#ebebeb] text-sm font-medium">Histórico de Movimentações</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-5 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide">Item</th>
                  <th className="text-left px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide hidden sm:table-cell">Motivo</th>
                  <th className="text-right px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide">Qtd</th>
                  <th className="text-left px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Notas</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 25).map(m => (
                  <tr key={m.id} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {parseDate(m.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-[#ebebeb] text-sm">{itemName(m.itemId)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[#555555] text-xs">{MOVEMENT_REASON_LABELS[m.reason]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${m.type === 'in' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {m.type === 'in' ? '+' : '−'}{m.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#555555] text-xs hidden md:table-cell truncate max-w-[200px]">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {movements.length > 25 && (
            <div className="px-5 py-3 border-t border-[#1c1c1c]">
              <p className="text-[#555555] text-xs">{movements.length - 25} movimentações anteriores não exibidas.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {creating && (
        <Modal title="Novo Item" onClose={() => setCreating(false)}>
          <ItemForm onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Item" onClose={() => setEditing(null)}>
          <ItemForm
            initial={{
              category: editing.category, name: editing.name, sku: editing.sku,
              quantity: String(editing.quantity), unit: editing.unit,
              costPrice: String(editing.costPrice), salePrice: String(editing.salePrice),
              notes: editing.notes, minStock: String(editing.minStock ?? 2),
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      {movementItem !== null && (
        <Modal
          title={movementItem.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
          onClose={() => setMovementItem(null)}
        >
          <MovementForm
            items={items}
            defaultItemId={movementItem.item?.id}
            defaultType={movementItem.type}
            onSave={handleMovement}
            onClose={() => setMovementItem(null)}
          />
        </Modal>
      )}
    </div>
  )
}
