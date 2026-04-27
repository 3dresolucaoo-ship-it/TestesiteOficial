'use client'

import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import { useState } from 'react'
import type { Decision, DecisionStatus } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Ativa',      color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', icon: CheckCircle2 },
  discarded: { label: 'Descartada', color: 'text-[#888888] bg-[#88888818] border-[#88888833]', icon: XCircle },
}

function Badge({ status }: { status: DecisionStatus }) {
  const { label, color, icon: Icon } = STATUS_CONFIG[status]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}><Icon size={10} />{label}</span>
}

type FormData = { decision: string; impact: string; status: DecisionStatus; date: string }

function DecisionForm({ initial, onSave, onClose }: { initial?: FormData; onSave: (d: FormData) => void; onClose: () => void }) {
  const [data, setData] = useState<FormData>(initial ?? {
    decision: '', impact: '', status: 'active', date: new Date().toISOString().slice(0, 10),
  })
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.decision.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Decisão">
        <Textarea value={data.decision} onChange={set('decision')} placeholder="Descreva a decisão tomada..." required />
      </FormField>
      <FormField label="Impacto">
        <Input value={data.impact} onChange={set('impact')} placeholder="Alto / Médio / Baixo — descrição" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="active">Ativa</option>
            <option value="discarded">Descartada</option>
          </Select>
        </FormField>
        <FormField label="Data">
          <Input type="date" value={data.date} onChange={set('date')} />
        </FormField>
      </div>
      <SubmitButton>{initial ? 'Salvar' : 'Registrar Decisão'}</SubmitButton>
    </form>
  )
}

export default function ProjectDecisionsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { state, dispatch, loading } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Decision | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<DecisionStatus | 'all'>('all')

  const decisions = state.decisions.filter(d => d.projectId === projectId)
  const filtered  = filter === 'all' ? decisions : decisions.filter(d => d.status === filter)
  const sorted    = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  function handleCreate(data: FormData) {
    dispatch({ type: 'ADD_DECISION', payload: { id: uid(), projectId, ...data } })
  }
  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({ type: 'UPDATE_DECISION', payload: { ...editing, ...data } })
    setEditing(null)
  }
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_DECISION', payload: id })
    setMenuOpen(null)
  }
  function toggleStatus(d: Decision) {
    dispatch({ type: 'UPDATE_DECISION', payload: { ...d, status: d.status === 'active' ? 'discarded' : 'active' } })
    setMenuOpen(null)
  }

  if (loading) return null
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Decisões</h2>
          <p className="text-[#555555] text-sm">{decisions.filter(d => d.status === 'active').length} ativas</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Registrar
        </button>
      </div>

      <div className="flex items-center gap-1">
        {(['all', 'active', 'discarded'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filter === s ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
          >
            {s === 'all' ? 'Todas' : STATUS_CONFIG[s as DecisionStatus].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map(d => (
          <div key={d.id} className={`bg-[#141414] border rounded-xl p-5 group hover:border-[#3a3a3a] transition-colors ${d.status === 'discarded' ? 'opacity-50 border-[#1c1c1c]' : 'border-[#2a2a2a]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge status={d.status} />
                  <span className="text-[#555555] text-xs">{new Date(d.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-[#ebebeb] text-sm leading-relaxed">{d.decision}</p>
                {d.impact && <p className="text-[#555555] text-xs mt-1.5">Impacto: {d.impact}</p>}
              </div>
              <div className="relative shrink-0">
                <button onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)} className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen === d.id && (
                  <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-40 overflow-hidden">
                    <button onClick={() => toggleStatus(d)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors">
                      {d.status === 'active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      {d.status === 'active' ? 'Descartar' : 'Reativar'}
                    </button>
                    <button onClick={() => { setEditing(d); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors">
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors">
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-center text-[#555555] text-sm py-12">Nenhuma decisão registrada.</p>}
      </div>

      {creating && <Modal title="Registrar Decisão" onClose={() => setCreating(false)}><DecisionForm onSave={handleCreate} onClose={() => setCreating(false)} /></Modal>}
      {editing && (
        <Modal title="Editar Decisão" onClose={() => setEditing(null)}>
          <DecisionForm initial={{ decision: editing.decision, impact: editing.impact, status: editing.status, date: editing.date }} onSave={handleEdit} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
