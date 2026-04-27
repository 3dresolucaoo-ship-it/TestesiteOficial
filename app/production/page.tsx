'use client'

import { useState, useEffect } from 'react'
import { useStore, uid } from '@/lib/store'
import type { ProductionItem, ProductionStatus, PrinterName, StockMovement, Transaction } from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, GripVertical, Clock,
  Activity, CheckCircle2, Timer, Printer,
} from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

// ─── Config ──────────────────────────────────────────────────────────────────

const statusConfig: Record<ProductionStatus, { label: string; color: string; dot: string }> = {
  waiting:  { label: 'Aguardando', color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]', dot: 'bg-[#f59e0b]' },
  printing: { label: 'Imprimindo', color: 'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]', dot: 'bg-[#3b82f6] animate-pulse' },
  done:     { label: 'Finalizado', color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', dot: 'bg-[#10b981]' },
}

const printerConfig: Record<PrinterName, { label: string; color: string; accent: string }> = {
  bambu:      { label: 'Bambu Lab',  color: 'text-[#10b981]', accent: '#10b981' },
  flashforge: { label: 'Flashforge', color: 'text-[#3b82f6]', accent: '#3b82f6' },
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProductionStatus }) {
  const { label, color } = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}

// ─── Live timer (simulated) ───────────────────────────────────────────────────
// Shows elapsed time for items currently printing.
// This is a client-side simulation — not stored in the DB.
function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000))

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  return (
    <span className="text-[#3b82f6] text-xs font-mono tabular-nums">
      {h > 0 && `${h}h `}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ─── Printer status board ─────────────────────────────────────────────────────
// Each card tracks its own "started at" timestamp when a print is active.
function PrinterBoard({
  production,
  onStatusChange,
}: {
  production: ProductionItem[]
  onStatusChange: (item: ProductionItem, status: ProductionStatus) => void
}) {
  // Client-side start-time map (resets on navigation — that's fine for simulation)
  const [startTimes] = useState<Record<string, number>>(() => ({}))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {(['bambu', 'flashforge'] as PrinterName[]).map(printer => {
        const running = production.find(p => p.printer === printer && p.status === 'printing')
        const queued  = production.filter(p => p.printer === printer && p.status === 'waiting').length
        const total   = production.filter(p => p.printer === printer && p.status !== 'done').length
        const color   = printerConfig[printer].accent

        // Record start time when printing begins
        if (running && !startTimes[running.id]) {
          startTimes[running.id] = Date.now()
        }

        return (
          <div
            key={printer}
            className="relative overflow-hidden bg-[rgba(255,255,255,0.025)] border rounded-xl p-5 transition-all"
            style={{
              borderColor: running ? `${color}44` : 'rgba(255,255,255,0.07)',
              boxShadow:   running ? `0 0 24px ${color}18` : 'none',
            }}
          >
            {/* Background accent when printing */}
            {running && (
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${color}, transparent 70%)` }}
              />
            )}

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      running
                        ? 'animate-pulse shadow-[0_0_8px_currentColor]'
                        : queued > 0 ? '' : 'opacity-30'
                    }`}
                    style={{
                      backgroundColor: running ? color : queued > 0 ? '#f59e0b' : '#555566',
                      boxShadow: running ? `0 0 8px ${color}` : 'none',
                    }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: running ? color : '#f0f0f5' }}
                  >
                    {printerConfig[printer].label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Printer size={12} className="text-[#555566]" />
                  <span className="text-[#555566] text-xs">{total} restantes</span>
                </div>
              </div>

              {/* Current job */}
              {running ? (
                <div className="space-y-2">
                  <p className="text-[#f0f0f5] text-sm font-medium truncate">{running.item}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Timer size={11} className="text-[#555566]" />
                      <span className="text-[#555566] text-xs">{running.estimatedHours}h estimado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity size={11} style={{ color }} />
                      <ElapsedTimer startedAt={startTimes[running.id] ?? Date.now()} />
                    </div>
                  </div>
                  {running.clientName && (
                    <p className="text-[#444455] text-xs">{running.clientName}</p>
                  )}
                  <button
                    onClick={() => onStatusChange(running, 'done')}
                    className="mt-1 flex items-center gap-1.5 text-[#10b981] text-xs font-medium hover:text-[#34d399] transition-colors"
                  >
                    <CheckCircle2 size={12} /> Finalizar
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[#444455] text-sm">Livre</p>
                  {queued > 0 && (
                    <p className="text-[#555566] text-xs mt-1">{queued} na fila</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

type FormData = {
  clientName:     string
  item:           string
  printer:        PrinterName
  status:         ProductionStatus
  estimatedHours: string
  priority:       string
  orderId:        string
}

function ProductionForm({
  orders,
  initial,
  onSave,
  onClose,
}: {
  orders:   { id: string; clientName: string; item: string }[]
  initial?: FormData
  onSave:   (d: FormData) => void
  onClose:  () => void
}) {
  const [data, setData] = useState<FormData>(
    initial ?? {
      clientName: '', item: '', printer: 'bambu', status: 'waiting',
      estimatedHours: '4', priority: '1', orderId: '',
    },
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.item.trim()) return
    onSave(data)
    onClose()
  }

  const set =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData(prev => ({ ...prev, [k]: e.target.value }))

  function handleOrderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const orderId = e.target.value
    const order   = orders.find(o => o.id === orderId)
    setData(prev => ({
      ...prev,
      orderId,
      clientName: order?.clientName ?? prev.clientName,
      item:       order?.item       ?? prev.item,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {orders.length > 0 && (
        <FormField label="Vincular a Pedido (opcional)">
          <Select value={data.orderId} onChange={handleOrderChange}>
            <option value="">Sem pedido vinculado</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>{o.clientName} — {o.item}</option>
            ))}
          </Select>
        </FormField>
      )}
      <FormField label="Cliente">
        <Input value={data.clientName} onChange={set('clientName')} placeholder="Nome do cliente" />
      </FormField>
      <FormField label="Item a imprimir">
        <Input value={data.item} onChange={set('item')} placeholder="O que será impresso" required />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Impressora">
          <Select value={data.printer} onChange={set('printer')}>
            <option value="bambu">Bambu Lab</option>
            <option value="flashforge">Flashforge</option>
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="waiting">Aguardando</option>
            <option value="printing">Imprimindo</option>
            <option value="done">Finalizado</option>
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Tempo estimado (h)">
          <Input
            type="number"
            value={data.estimatedHours}
            onChange={set('estimatedHours')}
            min="0.5"
            step="0.5"
          />
        </FormField>
        <FormField label="Prioridade">
          <Input type="number" value={data.priority} onChange={set('priority')} min="1" />
        </FormField>
      </div>
      <SubmitButton>{initial ? 'Salvar' : 'Adicionar à Fila'}</SubmitButton>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductionPage() {
  const { state, dispatch, loading } = useStore()
  const [creating,      setCreating]      = useState(false)
  const [editing,       setEditing]       = useState<ProductionItem | null>(null)
  const [menuOpen,      setMenuOpen]      = useState<string | null>(null)
  const [filterPrinter, setFilterPrinter] = useState<PrinterName | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  const orderProjectId = (orderId: string) =>
    state.orders.find(o => o.id === orderId)?.projectId ?? ''
  const projectName = (id: string) =>
    state.projects.find(p => p.id === id)?.name ?? ''

  const byProject = filterProject === 'all'
    ? state.production
    : state.production.filter(p => orderProjectId(p.orderId) === filterProject)

  const items   = filterPrinter === 'all' ? byProject : byProject.filter(p => p.printer === filterPrinter)
  const active  = items.filter(p => p.status !== 'done').sort((a, b) => a.priority - b.priority)
  const done    = items.filter(p => p.status === 'done')
  const printing = state.production.filter(p => p.status === 'printing').length
  const waiting  = state.production.filter(p => p.status === 'waiting').length

  function handleCreate(data: FormData) {
    dispatch({
      type:    'ADD_PRODUCTION',
      payload: {
        id:             uid(),
        ...data,
        estimatedHours: parseFloat(data.estimatedHours) || 4,
        priority:       parseInt(data.priority) || 1,
      },
    })
  }

  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({
      type:    'UPDATE_PRODUCTION',
      payload: {
        ...editing,
        ...data,
        estimatedHours: parseFloat(data.estimatedHours) || 4,
        priority:       parseInt(data.priority) || 1,
      },
    })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_PRODUCTION', payload: id })
    setMenuOpen(null)
  }

  function changeStatus(item: ProductionItem, status: ProductionStatus) {
    dispatch({ type: 'UPDATE_PRODUCTION', payload: { ...item, status } })

    // Auto-consume filament + create expense when printing starts
    if (status === 'printing' && item.status !== 'printing') {
      const order   = state.orders.find(o => o.id === item.orderId)
      const product = order?.productId
        ? state.products.find(p => p.id === order.productId)
        : undefined
      const baseGrams  = product?.materialGrams ?? 0
      const filamentId = product?.inventoryItemId
      const filament   = filamentId ? state.inventory.find(i => i.id === filamentId) : undefined

      // Only consume from filament items marked for printing (or ambos, or not set)
      const uso = filament?.filamentUso
      const canConsume = !uso || uso === 'impressao' || uso === 'ambos'

      if (product && filament && baseGrams > 0 && filament.category === 'filament' && canConsume) {
        // Include failure-rate waste
        const totalGrams = baseGrams * (1 + (product.failureRate ?? 0.1))
        const delta = filament.unit === 'kg' ? -(totalGrams / 1000) : -totalGrams

        const movement: StockMovement = {
          id:        uid(),
          projectId: filament.projectId,
          itemId:    filament.id,
          type:      'out',
          quantity:  Math.abs(delta),
          reason:    'printing',
          date:      new Date().toISOString().slice(0, 10),
          notes:     `Impressão iniciada · ${product.name} (${totalGrams.toFixed(0)}g)`,
        }
        dispatch({ type: 'ADJUST_STOCK', payload: { movement, itemId: filament.id, delta } })

        // Create filament expense transaction (Etapa 5.3)
        const costPerUnit  = filament.costPrice ?? 0
        const filamentCost = filament.unit === 'kg'
          ? costPerUnit * (totalGrams / 1000)
          : costPerUnit * totalGrams
        if (filamentCost > 0) {
          const transaction: Transaction = {
            id:          uid(),
            projectId:   filament.projectId,
            type:        'expense',
            value:       Math.round(filamentCost * 100) / 100,
            category:    'filament',
            description: `Filamento: ${product.name} (${totalGrams.toFixed(0)}g)`,
            date:        new Date().toISOString().slice(0, 10),
            source:      'Auto-gerado ao iniciar impressão',
          }
          dispatch({ type: 'ADD_TRANSACTION', payload: transaction })
        }
      }
    }

    setMenuOpen(null)
  }

  const totalEstimatedHours = active.reduce((s, p) => s + p.estimatedHours, 0)

  if (loading) return null
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[#f0f0f5] font-semibold text-lg">Operação</h2>
          <p className="text-[#555566] text-sm">
            {printing > 0 ? (
              <span className="text-[#3b82f6]">{printing} imprimindo</span>
            ) : (
              <span>0 imprimindo</span>
            )}
            {' · '}
            {waiting} aguardando
            {totalEstimatedHours > 0 && ` · ${totalEstimatedHours.toFixed(1)}h restantes`}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]"
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>

      {/* ── Printer status board ─────────────────────────────────────────────── */}
      <PrinterBoard production={state.production} onStatusChange={changeStatus} />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#8888a0] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#7c3aed] cursor-pointer"
        >
          <option value="all">Todos os projetos</option>
          {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(['all', 'bambu', 'flashforge'] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilterPrinter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterPrinter === p
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                : 'text-[#8888a0] border-transparent hover:text-[#f0f0f5]'
            }`}
          >
            {p === 'all' ? 'Todas' : printerConfig[p].label}
          </button>
        ))}
      </div>

      {/* ── Active queue ──────────────────────────────────────────────────────── */}
      {active.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[#8888a0] text-xs font-medium uppercase tracking-wide">
            Fila Ativa ({active.length})
          </h3>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {active.map(item => (
              <div
                key={item.id}
                className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4"
                style={{
                  borderColor: item.status === 'printing'
                    ? `${printerConfig[item.printer].accent}44`
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-[#f0f0f5] text-sm font-medium">{item.item}</p>
                    <p className="text-[#555566] text-xs mt-0.5">{item.clientName}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-[#555566]">
                  <span style={{ color: printerConfig[item.printer].accent }}>
                    {printerConfig[item.printer].label}
                  </span>
                  <span>·</span>
                  <Clock size={10} /><span>{item.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  {item.status === 'waiting' && (
                    <button
                      onClick={() => changeStatus(item, 'printing')}
                      className="flex-1 py-2 rounded-lg bg-[#3b82f61a] text-[#3b82f6] text-xs font-medium hover:bg-[#3b82f633] transition-colors"
                    >
                      Iniciar
                    </button>
                  )}
                  {item.status === 'printing' && (
                    <button
                      onClick={() => changeStatus(item, 'done')}
                      className="flex-1 py-2 rounded-lg bg-[#10b9811a] text-[#10b981] text-xs font-medium hover:bg-[#10b98133] transition-colors"
                    >
                      Finalizar
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(item)}
                    className="p-2 text-[#555566] hover:text-[#f0f0f5] rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-[#555566] hover:text-[#ef4444] rounded-lg hover:bg-[#ef44441a] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop list */}
          <div className="hidden sm:block space-y-2">
            {active.map(item => (
              <div
                key={item.id}
                className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center gap-4 group hover:border-[rgba(255,255,255,0.12)] transition-all"
                style={{
                  borderColor: item.status === 'printing'
                    ? `${printerConfig[item.printer].accent}44`
                    : undefined,
                }}
              >
                <div className="text-[#3a3a4a] hidden sm:block">
                  <GripVertical size={16} />
                </div>
                <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#555566] text-xs font-bold shrink-0">
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0f0f5] text-sm font-medium">{item.item}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span style={{ color: printerConfig[item.printer].accent }} className="text-xs">
                      {printerConfig[item.printer].label}
                    </span>
                    <span className="text-[#3a3a4a]">·</span>
                    <Clock size={10} className="text-[#555566]" />
                    <span className="text-[#555566] text-xs">{item.estimatedHours}h</span>
                    {item.clientName && (
                      <>
                        <span className="text-[#3a3a4a]">·</span>
                        <span className="text-[#555566] text-xs">{item.clientName}</span>
                      </>
                    )}
                    {item.orderId && projectName(orderProjectId(item.orderId)) && (
                      <>
                        <span className="text-[#3a3a4a]">·</span>
                        <span className="text-[#555566] text-xs">
                          {projectName(orderProjectId(item.orderId))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <StatusBadge status={item.status} />
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                    className="p-1.5 text-[#555566] hover:text-[#f0f0f5] transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {menuOpen === item.id && (
                    <div className="absolute right-0 top-8 bg-[#0d0d12] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-10 w-44 overflow-hidden">
                      {item.status !== 'printing' && (
                        <button
                          onClick={() => changeStatus(item, 'printing')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#3b82f6] hover:bg-[#3b82f61a] transition-colors"
                        >
                          <Activity size={13} /> Iniciar Impressão
                        </button>
                      )}
                      {item.status !== 'done' && (
                        <button
                          onClick={() => changeStatus(item, 'done')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#10b981] hover:bg-[#10b9811a] transition-colors"
                        >
                          <CheckCircle2 size={13} /> Finalizado
                        </button>
                      )}
                      <button
                        onClick={() => { setEditing(item); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                      >
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Completed ──────────────────────────────────────────────────────────── */}
      {done.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[#8888a0] text-xs font-medium uppercase tracking-wide">
            Finalizados ({done.length})
          </h3>
          <div className="space-y-1.5">
            {done.map(item => (
              <div
                key={item.id}
                className="bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3 flex items-center gap-4 opacity-50 hover:opacity-70 transition-opacity"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#8888a0] text-sm">{item.item}</p>
                  <p className="text-[#444455] text-xs">
                    {printerConfig[item.printer].label}
                    {item.clientName && ` · ${item.clientName}`}
                  </p>
                </div>
                <StatusBadge status={item.status} />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-[#3a3a4a] hover:text-[#ef4444] transition-colors rounded-lg hover:bg-[#ef44441a]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────────── */}
      {state.production.length === 0 && (
        <div className="py-20 text-center">
          <Printer size={36} className="text-[#2a2a3a] mx-auto mb-4" />
          <p className="text-[#555566] text-sm">Fila vazia. Adicione um item de produção.</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-4 py-2.5 rounded-xl mx-auto transition-all"
          >
            <Plus size={15} /> Adicionar item
          </button>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Adicionar à Fila" onClose={() => setCreating(false)}>
          <ProductionForm
            orders={state.orders}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Item" onClose={() => setEditing(null)}>
          <ProductionForm
            orders={state.orders}
            initial={{
              clientName:     editing.clientName,
              item:           editing.item,
              printer:        editing.printer,
              status:         editing.status,
              estimatedHours: String(editing.estimatedHours),
              priority:       String(editing.priority),
              orderId:        editing.orderId,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
