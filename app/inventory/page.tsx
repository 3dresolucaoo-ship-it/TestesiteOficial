'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import type { InventoryItem, InventoryCategory, StockMovement, MovementReason } from '@/lib/types'
import {
  INVENTORY_CATEGORY_LABELS,
  MOVEMENT_REASON_LABELS,
  MOVEMENT_REASONS_BY_TYPE,
} from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, AlertTriangle,
  Package, TrendingUp, ArrowDownLeft, ArrowUpRight,
  DollarSign, Layers, Search, ChevronDown, ArrowUpDown,
  Sparkles,
} from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtShort(v: number) {
  if (Math.abs(v) >= 1000)
    return `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/** Profit potential for a single item: (salePrice - costPrice) × quantity. */
function itemProfit(i: { salePrice: number; costPrice: number; quantity: number }): number {
  return (i.salePrice - i.costPrice) * i.quantity
}

/** Parse YYYY-MM-DD as local date — avoids UTC→timezone shift. */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Category colours ─────────────────────────────────────────────────────────
const CAT_COLORS: Record<InventoryCategory, { badge: string; bar: string }> = {
  filament:  { badge: 'text-[#7c3aed] bg-[#7c3aed1a] border-[#7c3aed33]', bar: 'bg-[#7c3aed]' },
  product:   { badge: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', bar: 'bg-[#10b981]' },
  equipment: { badge: 'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]', bar: 'bg-[#3b82f6]' },
  other:     { badge: 'text-[#888888] bg-[#88888818] border-[#88888833]', bar: 'bg-[#888888]' },
}

function CatBadge({ cat }: { cat: InventoryCategory }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${CAT_COLORS[cat].badge}`}>
      {INVENTORY_CATEGORY_LABELS[cat]}
    </span>
  )
}

// ─── Item form ────────────────────────────────────────────────────────────────
type ItemFormData = {
  projectId: string
  category: InventoryCategory
  name: string
  sku: string
  quantity: string
  unit: string
  costPrice: string
  salePrice: string
  notes: string
  minStock: string
  imageUrl: string
}

function ItemForm({
  projects,
  initial,
  onSave,
  onClose,
}: {
  projects: { id: string; name: string }[]
  initial?: ItemFormData
  onSave: (d: ItemFormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<ItemFormData>(
    initial ?? {
      projectId: projects[0]?.id ?? '',
      category: 'product',
      name: '',
      sku: '',
      quantity: '1',
      unit: 'un',
      costPrice: '',
      salePrice: '',
      notes: '',
      minStock: '2',
      imageUrl: '',
    },
  )

  const set =
    (k: keyof ItemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim() || !data.projectId) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={set('projectId')}>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoria">
          <Select value={data.category} onChange={set('category')}>
            {Object.entries(INVENTORY_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
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
        <Input
          value={data.name}
          onChange={set('name')}
          placeholder="Ex: Filamento PLA Branco 1kg"
          required
        />
      </FormField>

      <FormField label="SKU (opcional)">
        <Input value={data.sku} onChange={set('sku')} placeholder="Ex: FIL-PLA-BRK-001" />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Quantidade">
          <Input
            type="number"
            value={data.quantity}
            onChange={set('quantity')}
            min="0"
            step="0.01"
          />
        </FormField>
        <FormField label="Custo (R$)">
          <Input
            type="number"
            value={data.costPrice}
            onChange={set('costPrice')}
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        </FormField>
        <FormField label="Venda (R$)">
          <Input
            type="number"
            value={data.salePrice}
            onChange={set('salePrice')}
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        </FormField>
      </div>

      <FormField label="Alerta Mínimo (qtd)">
        <Input
          type="number"
          value={data.minStock}
          onChange={set('minStock')}
          min="0"
          step="1"
        />
      </FormField>

      <FormField label="Observações (opcional)">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas opcionais..." />
      </FormField>

      <FormField label="Foto (URL da imagem — opcional)">
        <Input
          value={data.imageUrl}
          onChange={set('imageUrl')}
          placeholder="https://exemplo.com/foto.jpg"
          type="url"
        />
        {data.imageUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[#2a2a2a] w-20 h-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
      </FormField>

      <SubmitButton>{initial ? 'Salvar Alterações' : 'Adicionar Item'}</SubmitButton>
    </form>
  )
}

// ─── Movement form ─────────────────────────────────────────────────────────────
type MovementFormData = {
  itemId: string
  type: 'in' | 'out'
  quantity: string
  reason: MovementReason
  date: string
  notes: string
}

function MovementForm({
  items,
  defaultItemId,
  defaultType,
  onSave,
  onClose,
}: {
  items: InventoryItem[]
  defaultItemId?: string
  defaultType?: 'in' | 'out'
  onSave: (d: MovementFormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<MovementFormData>({
    itemId:   defaultItemId ?? items[0]?.id ?? '',
    type:     defaultType ?? 'in',
    quantity: '1',
    reason:   defaultType === 'out' ? 'sale' : 'purchase',
    date:     new Date().toISOString().slice(0, 10),
    notes:    '',
  })

  const set =
    (k: keyof MovementFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

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
  const reasonOptions = MOVEMENT_REASONS_BY_TYPE[data.type]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['in', 'out'] as const).map(t => (
          <button
            key={t}
            type="button"
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

      {/* Item selector — hidden when opened from a specific item card */}
      {!defaultItemId ? (
        <FormField label="Item">
          <Select value={data.itemId} onChange={set('itemId')}>
            {items.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
        </FormField>
      ) : selectedItem ? (
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2">
          <p className="text-[#555555] text-xs">Item</p>
          <p className="text-[#ebebeb] text-sm font-medium">{selectedItem.name}</p>
          <p className="text-[#555555] text-xs">
            Estoque atual: {selectedItem.quantity} {selectedItem.unit}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Quantidade">
          <Input
            type="number"
            value={data.quantity}
            onChange={set('quantity')}
            min="0.01"
            step="0.01"
            required
          />
        </FormField>
        <FormField label="Motivo">
          <Select value={data.reason} onChange={set('reason')}>
            {reasonOptions.map(r => (
              <option key={r} value={r}>{MOVEMENT_REASON_LABELS[r]}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>

      <FormField label="Observações (opcional)">
        <Input value={data.notes} onChange={set('notes')} placeholder="Opcional..." />
      </FormField>

      <SubmitButton>
        {data.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
      </SubmitButton>
    </form>
  )
}

// ─── Inventory item row ────────────────────────────────────────────────────────
function ItemRow({
  item,
  projectName,
  onEdit,
  onDelete,
  onMovement,
  onQuickAdjust,
}: {
  item: InventoryItem
  projectName: string
  onEdit: () => void
  onDelete: () => void
  onMovement: (type: 'in' | 'out') => void
  onQuickAdjust: (delta: number) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isLow = item.quantity <= (item.minStock ?? 2)
  const margin =
    item.salePrice > 0 && item.costPrice > 0
      ? ((item.salePrice - item.costPrice) / item.salePrice) * 100
      : null
  const profitPotential = item.salePrice > 0 && item.costPrice > 0
    ? itemProfit(item)
    : null

  return (
    <div
      className={`bg-[#141414] border rounded-xl p-4 group hover:border-[#3a3a3a] transition-colors ${
        isLow ? 'border-[#f59e0b33]' : 'border-[#2a2a2a]'
      }`}
    >
      {/* Mobile layout */}
      <div className="flex items-start gap-3 sm:hidden">
        {item.imageUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#2a2a2a] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CatBadge cat={item.category} />
            {isLow && (
              <span className="text-[#f59e0b] text-xs flex items-center gap-1">
                <AlertTriangle size={10} /> Baixo
              </span>
            )}
          </div>
          <p className="text-[#ebebeb] text-sm font-medium">{item.name}</p>
          <p className="text-[#555555] text-xs mt-0.5">{projectName}</p>
          {item.costPrice > 0 && (
            <p className="text-[#555555] text-xs mt-0.5">Custo {fmt(item.costPrice)}</p>
          )}
          {profitPotential !== null && (
            <p className={`text-xs font-medium mt-0.5 ${
              profitPotential >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}>
              Lucro: {fmtShort(profitPotential)}
              {margin !== null && (
                <span className="text-[#555555] font-normal ml-1">({margin.toFixed(0)}%)</span>
              )}
            </p>
          )}
        </div>
        {/* Quantity + controls */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-lg font-bold tabular-nums ${isLow ? 'text-[#f59e0b]' : 'text-[#ebebeb]'}`}>
            {item.quantity}
            <span className="text-[#555555] text-xs font-normal ml-0.5">{item.unit}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQuickAdjust(-1)}
              className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
            >−</button>
            <button
              onClick={() => onQuickAdjust(1)}
              className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
            >+</button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 text-[#555555] hover:text-[#888888] transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-[#555555] hover:text-[#ef4444] transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-4">
        {item.imageUrl && (
          <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#2a2a2a] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
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
            <span className="text-[#3a3a3a] text-xs">{projectName}</span>
            {item.costPrice > 0 && (
              <span className="text-[#555555] text-xs">Custo {fmt(item.costPrice)}</span>
            )}
            {item.salePrice > 0 && (
              <span className="text-[#555555] text-xs">Venda {fmt(item.salePrice)}</span>
            )}
            {margin !== null && (
              <span
                className={`text-xs font-medium ${
                  margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
                }`}
              >
                {margin.toFixed(0)}% margem
              </span>
            )}
            {profitPotential !== null && (
              <span className={`text-xs ${profitPotential >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                lucro: {fmtShort(profitPotential)}
              </span>
            )}
            {item.notes && (
              <span className="text-[#3a3a3a] text-xs truncate max-w-[180px]">{item.notes}</span>
            )}
          </div>
        </div>

        {/* Entrada / Saída quick buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMovement('in')}
            className="px-2 py-1 rounded-lg text-xs text-[#10b981] hover:bg-[#10b9811a] border border-transparent hover:border-[#10b98122] transition-colors"
          >
            + Entrada
          </button>
          <button
            onClick={() => onMovement('out')}
            className="px-2 py-1 rounded-lg text-xs text-[#ef4444] hover:bg-[#ef44441a] border border-transparent hover:border-[#ef444422] transition-colors"
          >
            − Saída
          </button>
        </div>

        {/* ± quick adjust */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onQuickAdjust(-1)}
            className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
          >−</button>
          <span
            className={`text-sm font-bold w-12 text-center tabular-nums ${isLow ? 'text-[#f59e0b]' : 'text-[#ebebeb]'}`}
          >
            {item.quantity}
            {item.unit !== 'un' && (
              <span className="text-[#555555] text-xs font-normal ml-0.5">{item.unit}</span>
            )}
          </span>
          <button
            onClick={() => onQuickAdjust(1)}
            className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] text-sm transition-colors flex items-center justify-center"
          >+</button>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
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
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const { state, dispatch } = useStore()

  const [creating, setCreating]       = useState(false)
  const [editing, setEditing]         = useState<InventoryItem | null>(null)
  const [movementCtx, setMovementCtx] = useState<{ item?: InventoryItem; type: 'in' | 'out' } | null>(null)

  const [filterProject, setFilterProject] = useState('all')
  const [filterCat,     setFilterCat]     = useState<InventoryCategory | 'all'>('all')
  const [search,        setSearch]        = useState('')
  const [showLog,       setShowLog]       = useState(false)
  const [sortBy,        setSortBy]        = useState<'name' | 'profit' | 'stock' | 'value'>('name')

  const { inventory: allItems, movements: allMovements, projects } = state

  // ── Filtered item list ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allItems
    if (filterProject !== 'all') list = list.filter(i => i.projectId === filterProject)
    if (filterCat     !== 'all') list = list.filter(i => i.category  === filterCat)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'profit') return itemProfit(b) - itemProfit(a)
      if (sortBy === 'stock')  return b.quantity    - a.quantity
      if (sortBy === 'value')  return (b.costPrice * b.quantity) - (a.costPrice * a.quantity)
      return a.name.localeCompare(b.name, 'pt-BR')
    })
  }, [allItems, filterProject, filterCat, search, sortBy])

  // ── KPIs (scoped to current filter, full totals when no filter) ──────────────
  const scopedItems       = filterProject === 'all' ? allItems : allItems.filter(i => i.projectId === filterProject)
  const lowStockList      = scopedItems.filter(i => i.quantity <= (i.minStock ?? 2))
  const stockValue        = scopedItems.reduce((s, i) => s + i.costPrice * i.quantity, 0)
  const profitPotentialTotal = scopedItems
    .filter(i => i.salePrice > 0 && i.costPrice > 0)
    .reduce((s, i) => s + itemProfit(i), 0)

  // Top 5 items by profit potential (items with both prices set)
  const topProfitItems = [...scopedItems]
    .filter(i => i.salePrice > 0 && i.costPrice > 0 && i.quantity > 0)
    .sort((a, b) => itemProfit(b) - itemProfit(a))
    .slice(0, 5)

  // Category breakdown for the value bar chart
  const catValues = (Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[])
    .map(cat => ({
      cat,
      value: scopedItems.filter(i => i.category === cat).reduce((s, i) => s + i.costPrice * i.quantity, 0),
      count: scopedItems.filter(i => i.category === cat).length,
    }))
    .filter(c => c.count > 0)
  const maxCatValue = Math.max(...catValues.map(c => c.value), 1)

  // Movement log — limited to current project scope, newest first
  const movements = useMemo(() => {
    let list = allMovements
    if (filterProject !== 'all') list = list.filter(m => m.projectId === filterProject)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [allMovements, filterProject])

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? '—'
  const itemName    = (id: string) => allItems.find(i => i.id === id)?.name ?? id

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleCreate(data: ItemFormData) {
    dispatch({
      type: 'ADD_INVENTORY',
      payload: {
        id:        uid(),
        projectId: data.projectId,
        category:  data.category,
        name:      data.name.trim(),
        sku:       data.sku.trim(),
        quantity:  parseFloat(data.quantity)  || 0,
        unit:      data.unit,
        costPrice: parseFloat(data.costPrice) || 0,
        salePrice: parseFloat(data.salePrice) || 0,
        notes:     data.notes.trim(),
        minStock:  parseInt(data.minStock)    || 2,
        imageUrl:  data.imageUrl.trim() || undefined,
      },
    })
  }

  function handleEdit(data: ItemFormData) {
    if (!editing) return
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        ...editing,
        projectId: data.projectId,
        category:  data.category,
        name:      data.name.trim(),
        sku:       data.sku.trim(),
        quantity:  parseFloat(data.quantity)  || 0,
        unit:      data.unit,
        costPrice: parseFloat(data.costPrice) || 0,
        salePrice: parseFloat(data.salePrice) || 0,
        notes:     data.notes.trim(),
        minStock:  parseInt(data.minStock)    || 2,
        imageUrl:  data.imageUrl.trim() || undefined,
      },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_INVENTORY', payload: id })
  }

  function handleMovement(data: MovementFormData) {
    const qty    = parseFloat(data.quantity) || 0
    const delta  = data.type === 'in' ? qty : -qty
    const target = allItems.find(i => i.id === data.itemId)
    if (!target) return
    const movement: StockMovement = {
      id:        uid(),
      projectId: target.projectId,
      itemId:    data.itemId,
      type:      data.type,
      quantity:  qty,
      reason:    data.reason,
      date:      data.date,
      notes:     data.notes,
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: data.itemId, delta } })
  }

  function quickAdjust(item: InventoryItem, delta: number) {
    const movement: StockMovement = {
      id:        uid(),
      projectId: item.projectId,
      itemId:    item.id,
      type:      delta > 0 ? 'in' : 'out',
      quantity:  Math.abs(delta),
      reason:    delta > 0 ? 'purchase' : 'adjustment',
      date:      new Date().toISOString().slice(0, 10),
      notes:     '',
    }
    dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: item.id, delta } })
  }

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="text-[#2a2a2a] mb-4" />
          <p className="text-[#555555] text-sm">
            Nenhum projeto encontrado. Crie um projeto primeiro para gerenciar o estoque.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Estoque Global</h2>
          <p className="text-[#555555] text-sm">
            {allItems.length} {allItems.length === 1 ? 'item' : 'itens'} em{' '}
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMovementCtx({ type: 'in' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowDownLeft size={14} /> Entrada
          </button>
          <button
            onClick={() => setMovementCtx({ type: 'out' })}
            className="flex items-center gap-2 text-[#888888] hover:text-[#ebebeb] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowUpRight size={14} /> Saída
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Novo Item
          </button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total de Itens',
            value: `${scopedItems.length}`,
            icon:  Package,
            color: 'text-[#a78bfa]',
            bg:    'bg-[#7c3aed1a]',
          },
          {
            label: 'Valor em Custo',
            value: fmt(stockValue),
            icon:  DollarSign,
            color: 'text-[#3b82f6]',
            bg:    'bg-[#3b82f61a]',
          },
          {
            label: 'Lucro Potencial',
            value: profitPotentialTotal > 0 ? fmtShort(profitPotentialTotal) : '—',
            icon:  TrendingUp,
            color: profitPotentialTotal > 0 ? 'text-[#10b981]' : 'text-[#555555]',
            bg:    profitPotentialTotal > 0 ? 'bg-[#10b9811a]' : 'bg-[#1c1c1c]',
          },
          {
            label: 'Em Alerta',
            value: `${lowStockList.length}`,
            icon:  AlertTriangle,
            color: lowStockList.length > 0 ? 'text-[#f59e0b]' : 'text-[#555555]',
            bg:    lowStockList.length > 0 ? 'bg-[#f59e0b1a]' : 'bg-[#1c1c1c]',
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

      {/* ── Category breakdown ──────────────────────────────────────────────── */}
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
                    <span className="text-[#555555] text-xs">
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
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

      {/* ── Top items by profit potential ───────────────────────────────────── */}
      {topProfitItems.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-[#a78bfa]" />
            <p className="text-[#ebebeb] text-sm font-medium">Top Itens por Lucro Potencial</p>
            <span className="ml-auto text-[#3a3a3a] text-xs">estoque × margem</span>
          </div>
          <div className="space-y-3">
            {topProfitItems.map((item, idx) => {
              const profit = itemProfit(item)
              const maxProfit = itemProfit(topProfitItems[0])
              const margin = ((item.salePrice - item.costPrice) / item.salePrice) * 100
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-[#3a3a3a] text-[10px] font-bold tabular-nums w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-[#888888] text-xs truncate">{item.name}</span>
                      <span className={`text-[10px] font-medium shrink-0 ${
                        margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
                      }`}>
                        {margin.toFixed(0)}%
                      </span>
                    </span>
                    <span className="text-[#f0f0f5] text-xs font-semibold whitespace-nowrap ml-2">
                      {fmtShort(profit)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(profit / maxProfit) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#10b981] transition-all duration-500"
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {profitPotentialTotal > 0 && (
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-baseline">
              <span className="text-[#555555] text-xs">Total em estoque</span>
              <span className="text-[#10b981] text-sm font-bold">{fmtShort(profitPotentialTotal)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Low stock banner ────────────────────────────────────────────────── */}
      {lowStockList.length > 0 && (
        <div className="flex items-start gap-3 bg-[#f59e0b0d] border border-[#f59e0b22] rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-[#f59e0b] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[#f59e0b] text-sm font-medium">
              Estoque Baixo — {lowStockList.length}{' '}
              {lowStockList.length === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-[#f59e0b] text-xs opacity-70 mt-0.5 truncate">
              {lowStockList
                .map(i => `${i.name} (${i.quantity}${i.unit !== 'un' ? i.unit : ''})`)
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Project filter */}
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
        >
          <option value="all">Todos os projetos</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Category filter buttons */}
        <button
          onClick={() => setFilterCat('all')}
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
              onClick={() => setFilterCat(c)}
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

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={11} className="text-[#555555]" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
          >
            <option value="name">Nome</option>
            <option value="profit">Lucro</option>
            <option value="stock">Qtd</option>
            <option value="value">Valor</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="bg-[#141414] border border-[#2a2a2a] text-[#888888] text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#7c3aed] placeholder:text-[#3a3a3a] w-40"
          />
        </div>
      </div>

      {/* ── Item list ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={36} className="text-[#2a2a2a] mb-3" />
          <p className="text-[#555555] text-sm">
            {allItems.length === 0
              ? 'Nenhum item no estoque. Adicione o primeiro!'
              : 'Nenhum item corresponde aos filtros.'}
          </p>
          {allItems.length === 0 && (
            <button
              onClick={() => setCreating(true)}
              className="mt-4 flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> Adicionar Primeiro Item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              projectName={projectName(item.projectId)}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onMovement={type => setMovementCtx({ item, type })}
              onQuickAdjust={delta => quickAdjust(item, delta)}
            />
          ))}
        </div>
      )}

      {/* ── Movement log ─────────────────────────────────────────────────────── */}
      {movements.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowLog(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
          >
            <p className="text-[#ebebeb] text-sm font-medium">
              Histórico de Movimentações{' '}
              <span className="text-[#555555] font-normal">({movements.length})</span>
            </p>
            <ChevronDown
              size={15}
              className={`text-[#555555] transition-transform ${showLog ? 'rotate-180' : ''}`}
            />
          </button>

          {showLog && (
            <>
              {/* Mobile movement cards */}
              <div className="sm:hidden divide-y divide-[#1c1c1c]">
                {movements.slice(0, 30).map(m => (
                  <div key={m.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[#ebebeb] text-sm truncate">{itemName(m.itemId)}</p>
                        <p className="text-[#555555] text-xs mt-0.5">
                          {parseDate(m.date).toLocaleDateString('pt-BR')} ·{' '}
                          {MOVEMENT_REASON_LABELS[m.reason]}
                        </p>
                        {m.notes && <p className="text-[#3a3a3a] text-xs mt-0.5">{m.notes}</p>}
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums shrink-0 ${
                          m.type === 'in' ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}
                      >
                        {m.type === 'in' ? '+' : '−'}{m.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop movement table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      {['Data', 'Item', 'Motivo', 'Projeto', 'Qtd', 'Notas'].map(h => (
                        <th
                          key={h}
                          className="text-left px-4 py-2.5 text-[#555555] text-xs font-medium uppercase tracking-wide first:pl-5 last:pr-5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.slice(0, 50).map(m => (
                      <tr
                        key={m.id}
                        className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <td className="px-5 py-3 text-[#888888] text-xs whitespace-nowrap">
                          {parseDate(m.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-[#ebebeb] text-sm max-w-[160px] truncate">
                          {itemName(m.itemId)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#555555] text-xs">
                            {MOVEMENT_REASON_LABELS[m.reason]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#555555] text-xs">
                          {projectName(m.projectId)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              m.type === 'in' ? 'text-[#10b981]' : 'text-[#ef4444]'
                            }`}
                          >
                            {m.type === 'in' ? '+' : '−'}{m.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 pr-5 text-[#555555] text-xs max-w-[200px] truncate">
                          {m.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {movements.length > 50 && (
                <div className="px-5 py-3 border-t border-[#1c1c1c]">
                  <p className="text-[#555555] text-xs">
                    {movements.length - 50} movimentações anteriores não exibidas.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Novo Item de Estoque" onClose={() => setCreating(false)}>
          <ItemForm
            projects={projects}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Item" onClose={() => setEditing(null)}>
          <ItemForm
            projects={projects}
            initial={{
              projectId: editing.projectId,
              category:  editing.category,
              name:      editing.name,
              sku:       editing.sku,
              quantity:  String(editing.quantity),
              unit:      editing.unit,
              costPrice: String(editing.costPrice),
              salePrice: String(editing.salePrice),
              notes:     editing.notes,
              minStock:  String(editing.minStock ?? 2),
              imageUrl:  editing.imageUrl ?? '',
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {movementCtx !== null && (
        <Modal
          title={movementCtx.type === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
          onClose={() => setMovementCtx(null)}
        >
          <MovementForm
            items={filterProject === 'all' ? allItems : allItems.filter(i => i.projectId === filterProject)}
            defaultItemId={movementCtx.item?.id}
            defaultType={movementCtx.type}
            onSave={handleMovement}
            onClose={() => setMovementCtx(null)}
          />
        </Modal>
      )}
    </div>
  )
}
