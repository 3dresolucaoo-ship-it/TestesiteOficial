'use client'

import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import { useState } from 'react'
import type { ProductionItem, ProductionStatus, PrinterName, Order } from '@/lib/types'
import { Plus, Trash2, MoreHorizontal, Clock, GripVertical } from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

const STATUS_CONFIG: Record<ProductionStatus, { label: string; color: string }> = {
  waiting:  { label: 'Aguardando', color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]' },
  printing: { label: 'Imprimindo', color: 'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]' },
  done:     { label: 'Finalizado', color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
}

const PRINTER_CONFIG: Record<PrinterName, { label: string; color: string }> = {
  bambu:      { label: 'Bambu Lab',  color: 'text-[#10b981]' },
  flashforge: { label: 'Flashforge', color: 'text-[#3b82f6]' },
}

function Badge({ status }: { status: ProductionStatus }) {
  const { label, color } = STATUS_CONFIG[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{label}</span>
}

type FormData = { item: string; clientName: string; printer: PrinterName; status: ProductionStatus; estimatedHours: string; priority: string; orderId: string }

function ProdForm({ orders, onSave, onClose }: { orders: Order[]; onSave: (d: FormData) => void; onClose: () => void }) {
  const [data, setData] = useState<FormData>({
    item: '', clientName: '', printer: 'bambu', status: 'waiting',
    estimatedHours: '4', priority: '1', orderId: '',
  })
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  function handleOrderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const order = orders.find(o => o.id === id)
    setData(p => ({ ...p, orderId: id, clientName: order?.clientName ?? p.clientName, item: order?.item ?? p.item }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.item.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {orders.length > 0 && (
        <FormField label="Vincular Pedido (opcional)">
          <Select value={data.orderId} onChange={handleOrderChange}>
            <option value="">Sem pedido</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.clientName} — {o.item}</option>)}
          </Select>
        </FormField>
      )}
      <FormField label="Item a Imprimir">
        <Input value={data.item} onChange={set('item')} placeholder="O que será impresso" required />
      </FormField>
      <FormField label="Cliente">
        <Input value={data.clientName} onChange={set('clientName')} placeholder="Nome do cliente" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tempo estimado (h)">
          <Input type="number" value={data.estimatedHours} onChange={set('estimatedHours')} min="0.5" step="0.5" />
        </FormField>
        <FormField label="Prioridade">
          <Input type="number" value={data.priority} onChange={set('priority')} min="1" />
        </FormField>
      </div>
      <SubmitButton>Adicionar à Fila</SubmitButton>
    </form>
  )
}

export default function ProjectOperationsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { state, dispatch } = useStore()
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const projectOrders = state.orders.filter(o => o.projectId === projectId)
  const orderIds = new Set(projectOrders.map(o => o.id))

  const allProd = state.production.filter(p => !p.orderId || orderIds.has(p.orderId))
  const active = allProd.filter(p => p.status !== 'done').sort((a, b) => a.priority - b.priority)
  const done   = allProd.filter(p => p.status === 'done')

  function handleCreate(data: FormData) {
    dispatch({
      type: 'ADD_PRODUCTION',
      payload: { id: uid(), ...data, estimatedHours: parseFloat(data.estimatedHours) || 4, priority: parseInt(data.priority) || 1 },
    })
  }

  function changeStatus(item: ProductionItem, status: ProductionStatus) {
    dispatch({ type: 'UPDATE_PRODUCTION', payload: { ...item, status } })
    setMenuOpen(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_PRODUCTION', payload: id })
    setMenuOpen(null)
  }

  const printing = state.production.filter(p => p.status === 'printing')
  const bambuBusy = printing.find(p => p.printer === 'bambu')
  const ffBusy    = printing.find(p => p.printer === 'flashforge')

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Operação</h2>
          <p className="text-[#555555] text-sm">
            {active.length} na fila · {printing.length} imprimindo
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Adicionar
        </button>
      </div>

      {/* Printer status */}
      <div className="grid grid-cols-2 gap-3">
        {(['bambu', 'flashforge'] as PrinterName[]).map(printer => {
          const busy = printer === 'bambu' ? bambuBusy : ffBusy
          const queued = state.production.filter(p => p.printer === printer && p.status === 'waiting').length
          return (
            <div key={printer} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${busy ? 'bg-[#3b82f6] animate-pulse' : queued > 0 ? 'bg-[#f59e0b]' : 'bg-[#3a3a3a]'}`} />
                <span className={`text-sm font-medium ${PRINTER_CONFIG[printer].color}`}>{PRINTER_CONFIG[printer].label}</span>
              </div>
              {busy ? (
                <p className="text-[#888888] text-xs truncate">{busy.item}</p>
              ) : (
                <p className="text-[#555555] text-xs">Livre</p>
              )}
              {queued > 0 && <p className="text-[#555555] text-xs mt-1">{queued} na fila</p>}
            </div>
          )
        })}
      </div>

      {/* Active queue */}
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest">Fila Ativa</p>
          {active.map(item => (
            <div key={item.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3 group hover:border-[#3a3a3a] transition-colors">
              <GripVertical size={16} className="text-[#3a3a3a] hidden sm:block shrink-0" />
              <div className="w-6 h-6 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-[#555555] text-xs font-bold shrink-0">
                {item.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#ebebeb] text-sm font-medium">{item.item}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs ${PRINTER_CONFIG[item.printer].color}`}>{PRINTER_CONFIG[item.printer].label}</span>
                  <span className="text-[#3a3a3a]">·</span>
                  <Clock size={10} className="text-[#555555]" />
                  <span className="text-[#555555] text-xs">{item.estimatedHours}h</span>
                  {item.clientName && <><span className="text-[#3a3a3a]">·</span><span className="text-[#555555] text-xs">{item.clientName}</span></>}
                </div>
              </div>
              <Badge status={item.status} />
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)} className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors">
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen === item.id && (
                  <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-44 overflow-hidden">
                    {item.status !== 'printing' && (
                      <button onClick={() => changeStatus(item, 'printing')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#3b82f6] hover:bg-[#3b82f61a] transition-colors">
                        Iniciar Impressão
                      </button>
                    )}
                    {item.status !== 'done' && (
                      <button onClick={() => changeStatus(item, 'done')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#10b981] hover:bg-[#10b9811a] transition-colors">
                        Marcar Finalizado
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors">
                      <Trash2 size={13} /> Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest">Finalizados</p>
          {done.map(item => (
            <div key={item.id} className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-xl p-4 flex items-center gap-3 opacity-50">
              <div className="flex-1 min-w-0">
                <p className="text-[#888888] text-sm">{item.item}</p>
                <p className="text-[#555555] text-xs">{PRINTER_CONFIG[item.printer].label} · {item.clientName}</p>
              </div>
              <Badge status={item.status} />
              <button onClick={() => handleDelete(item.id)} className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {allProd.length === 0 && (
        <div className="py-16 text-center text-[#555555] text-sm">Fila vazia.</div>
      )}

      {creating && (
        <Modal title="Adicionar à Fila" onClose={() => setCreating(false)}>
          <ProdForm orders={projectOrders} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  )
}
