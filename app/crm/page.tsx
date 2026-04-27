'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Lead, LeadStatus, ContactSource, Order } from '@/lib/types'
import { LEAD_STATUS_LABELS, CONTACT_SOURCE_LABELS } from '@/lib/types'
import { Plus, Pencil, Trash2, Users, Columns, LayoutList, UserCheck } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:         'text-[#888888] bg-[#88888818] border-[#88888833]',
  contacted:   'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]',
  negotiating: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]',
  won:         'text-[#10b981] bg-[#10b9811a] border-[#10b98133]',
  lost:        'text-[#ef4444] bg-[#ef44441a] border-[#ef444433]',
}
const STAGE_DOT: Record<LeadStatus, string> = {
  new: '#888888', contacted: '#3b82f6', negotiating: '#f59e0b', won: '#10b981', lost: '#ef4444',
}

function Badge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

type LeadFormData = {
  projectId: string
  name: string; contact: string; source: ContactSource; status: LeadStatus
  value: string; notes: string; date: string
}

function LeadForm({ projects, initial, onSave, onClose }: {
  projects: { id: string; name: string }[]
  initial?: LeadFormData
  onSave:   (d: LeadFormData) => void
  onClose:  () => void
}) {
  const [data, setData] = useState<LeadFormData>(initial ?? {
    projectId: projects[0]?.id ?? '',
    name: '', contact: '', source: 'instagram', status: 'new',
    value: '', notes: '', date: new Date().toISOString().slice(0, 10),
  })
  const set = (k: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nome">
          <Input value={data.name} onChange={set('name')} placeholder="Nome do lead" required />
        </FormField>
        <FormField label="Contato">
          <Input value={data.contact} onChange={set('contact')} placeholder="WhatsApp, @instagram..." />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Origem">
          <Select value={data.source} onChange={set('source')}>
            {Object.entries(CONTACT_SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor Estimado (R$)">
          <Input type="number" value={data.value} onChange={set('value')} placeholder="0" min="0" />
        </FormField>
        <FormField label="Data">
          <Input type="date" value={data.date} onChange={set('date')} />
        </FormField>
      </div>
      <FormField label="Observações">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas sobre o lead..." />
      </FormField>
      <SubmitButton>{initial ? 'Salvar' : 'Adicionar Lead'}</SubmitButton>
    </form>
  )
}

// ─── Client row (derived from delivered/paid orders + won leads) ─────────────
type Client = {
  key:       string
  name:      string
  projectId: string
  origin:    string
  total:     number
  orders:    number
  lastDate:  string
}

function deriveClients(orders: Order[], leads: Lead[]): Client[] {
  const map = new Map<string, Client>()

  for (const o of orders) {
    if (o.status !== 'delivered' && o.status !== 'paid') continue
    const key = `${o.projectId}::${o.clientName.trim().toLowerCase()}`
    const prev = map.get(key)
    if (prev) {
      prev.total    += o.value
      prev.orders   += 1
      if (o.date > prev.lastDate) prev.lastDate = o.date
    } else {
      map.set(key, {
        key, name: o.clientName, projectId: o.projectId,
        origin: o.origin, total: o.value, orders: 1, lastDate: o.date,
      })
    }
  }
  for (const l of leads) {
    if (l.status !== 'won') continue
    const key = `${l.projectId}::${l.name.trim().toLowerCase()}`
    if (map.has(key)) continue
    map.set(key, {
      key, name: l.name, projectId: l.projectId,
      origin: l.source, total: l.value, orders: 0, lastDate: l.date,
    })
  }
  return [...map.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate))
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'pipeline' | 'clients'

export default function GlobalCrmPage() {
  const { state, dispatch, loading } = useStore()
  const [tab,         setTab]         = useState<Tab>('pipeline')
  const [view,        setView]        = useState<'list' | 'kanban'>('kanban')
  const [filterProj,  setFilterProj]  = useState<string>('all')
  const [filterStat,  setFilterStat]  = useState<LeadStatus | 'all'>('all')
  const [creating,    setCreating]    = useState(false)
  const [editing,     setEditing]     = useState<Lead | null>(null)

  const leads = useMemo(
    () => filterProj === 'all' ? state.leads : state.leads.filter(l => l.projectId === filterProj),
    [state.leads, filterProj],
  )
  const filteredLeads = filterStat === 'all' ? leads : leads.filter(l => l.status === filterStat)
  const sortedLeads   = [...filteredLeads].sort((a, b) => b.date.localeCompare(a.date))

  const clients = useMemo(() => {
    const orders = filterProj === 'all' ? state.orders : state.orders.filter(o => o.projectId === filterProj)
    return deriveClients(orders, leads)
  }, [state.orders, leads, filterProj])

  const projectName = (id: string) => state.projects.find(p => p.id === id)?.name ?? '—'

  // ── Counters ────────────────────────────────────────────────────────────────
  const pipelineValue = leads
    .filter(l => l.status !== 'lost' && l.status !== 'won')
    .reduce((s, l) => s + l.value, 0)
  const wonValue = leads.filter(l => l.status === 'won').reduce((s, l) => s + l.value, 0)
  const clientsTotal = clients.reduce((s, c) => s + c.total, 0)

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function handleCreate(d: LeadFormData) {
    dispatch({
      type: 'ADD_LEAD',
      payload: {
        id: uid(), projectId: d.projectId, name: d.name, contact: d.contact,
        source: d.source, status: d.status, value: parseFloat(d.value) || 0,
        notes: d.notes, date: d.date,
      },
    })
  }
  function handleEdit(d: LeadFormData) {
    if (!editing) return
    dispatch({
      type: 'UPDATE_LEAD',
      payload: {
        ...editing, projectId: d.projectId, name: d.name, contact: d.contact,
        source: d.source, status: d.status, value: parseFloat(d.value) || 0,
        notes: d.notes, date: d.date,
      },
    })
    setEditing(null)
  }
  function handleDelete(id: string) { dispatch({ type: 'DELETE_LEAD', payload: id }) }
  function advance(l: Lead) {
    const order: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']
    const i = order.indexOf(l.status)
    if (i >= 0 && i < order.length - 1) dispatch({ type: 'UPDATE_LEAD', payload: { ...l, status: order[i + 1] } })
  }

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  if (loading) return null
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">CRM</h2>
          <p className="text-[#555555] text-sm">
            {leads.length} leads · {clients.length} clientes · pipeline {fmt(pipelineValue)}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Novo Lead
        </button>
      </div>

      {/* Summary — stage counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([s, label]) => {
          const count = leads.filter(l => l.status === s).length
          return (
            <button
              key={s}
              onClick={() => { setTab('pipeline'); setFilterStat(s) }}
              className="bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-3 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAGE_DOT[s] }} />
                <p className="text-[#555555] text-xs">{label}</p>
              </div>
              <p className="text-[#ebebeb] text-xl font-bold">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Project filter + Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'pipeline' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#888888] hover:text-[#ebebeb]'
            }`}
          >
            <Users size={14} /> Pipeline
          </button>
          <button
            onClick={() => setTab('clients')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'clients' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#888888] hover:text-[#ebebeb]'
            }`}
          >
            <UserCheck size={14} /> Clientes <span className="text-[#555555]">{clients.length}</span>
          </button>
        </div>

        <select
          value={filterProj}
          onChange={e => setFilterProj(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] transition-colors"
        >
          <option value="all">Todos os projetos</option>
          {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Pipeline tab */}
      {tab === 'pipeline' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterStat('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterStat === 'all' ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
              >
                Todos ({leads.length})
              </button>
              {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStat(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterStat === s ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
                >
                  {LEAD_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-0.5">
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                title="Lista"
              ><LayoutList size={13} /></button>
              <button
                onClick={() => setView('kanban')}
                className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                title="Kanban"
              ><Columns size={13} /></button>
            </div>
          </div>

          {view === 'list' && (
            <div className="space-y-2">
              {sortedLeads.length === 0 && (
                <p className="text-center text-[#555555] text-sm py-12">Nenhum lead encontrado.</p>
              )}
              {sortedLeads.map(l => (
                <div key={l.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 hover:border-[#3a3a3a] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge status={l.status} />
                      <span className="text-[#555555] text-xs">{CONTACT_SOURCE_LABELS[l.source]}</span>
                      <span className="text-[#3a3a3a] text-xs">· {projectName(l.projectId)}</span>
                      {l.value > 0 && <span className="text-[#10b981] text-xs font-medium">R$ {l.value}</span>}
                    </div>
                    <p className="text-[#ebebeb] text-sm font-medium">{l.name}</p>
                    {l.contact && <p className="text-[#555555] text-xs">{l.contact}</p>}
                    {l.notes && <p className="text-[#888888] text-xs mt-1">{l.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {l.status !== 'won' && l.status !== 'lost' && (
                      <button
                        onClick={() => advance(l)}
                        className="text-xs text-[#7c3aed] hover:text-[#a78bfa] px-2 py-1 rounded-lg hover:bg-[#7c3aed1a] transition-colors"
                      >Avançar →</button>
                    )}
                    <button onClick={() => setEditing(l)} className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(l.id)} className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'kanban' && (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([status, label]) => {
                  const stage = leads.filter(l => l.status === status)
                  const stageValue = stage.reduce((s, l) => s + l.value, 0)
                  const col = STAGE_DOT[status]
                  return (
                    <div key={status} className="w-64 shrink-0">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                          <span className="text-[#ebebeb] text-xs font-medium">{label}</span>
                          <span className="text-[#555555] text-xs">{stage.length}</span>
                        </div>
                        {stageValue > 0 && <span className="text-[#555555] text-xs">{fmt(stageValue)}</span>}
                      </div>
                      <div className="space-y-2">
                        {stage.map(l => (
                          <div key={l.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#3a3a3a] transition-colors">
                            <p className="text-[#ebebeb] text-sm font-medium mb-0.5">{l.name}</p>
                            <p className="text-[#3a3a3a] text-[10px] mb-1">{projectName(l.projectId)}</p>
                            {l.contact && <p className="text-[#555555] text-xs mb-1">{l.contact}</p>}
                            {l.notes && <p className="text-[#888888] text-xs mb-2 line-clamp-2">{l.notes}</p>}
                            <div className="flex items-center justify-between">
                              {l.value > 0
                                ? <span className="text-[#10b981] text-xs font-medium">R$ {l.value}</span>
                                : <span />
                              }
                              <div className="flex items-center gap-1">
                                {status !== 'won' && status !== 'lost' && (
                                  <button onClick={() => advance(l)} className="text-[10px] text-[#7c3aed] hover:text-[#a78bfa] px-1.5 py-0.5 rounded hover:bg-[#7c3aed1a] transition-colors">→</button>
                                )}
                                <button onClick={() => setEditing(l)} className="p-0.5 text-[#3a3a3a] hover:text-[#888888] transition-colors"><Pencil size={11} /></button>
                                <button onClick={() => handleDelete(l.id)} className="p-0.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors"><Trash2 size={11} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stage.length === 0 && (
                          <div className="border border-dashed border-[#2a2a2a] rounded-xl p-4 text-center">
                            <p className="text-[#3a3a3a] text-xs">Sem leads</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Clients tab (derived from delivered/paid orders + won leads) */}
      {tab === 'clients' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3">
              <p className="text-[#555555] text-xs">Clientes</p>
              <p className="text-[#ebebeb] text-xl font-bold">{clients.length}</p>
            </div>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3">
              <p className="text-[#555555] text-xs">Faturado</p>
              <p className="text-[#10b981] text-xl font-bold">{fmt(clientsTotal)}</p>
            </div>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3">
              <p className="text-[#555555] text-xs">Fechados (leads)</p>
              <p className="text-[#a78bfa] text-xl font-bold">{fmt(wonValue)}</p>
            </div>
          </div>

          {clients.length === 0 ? (
            <p className="text-center text-[#555555] text-sm py-12">
              Nenhum cliente ainda. Clientes aparecem automaticamente quando um pedido fica <span className="text-[#10b981]">Pago</span> ou <span className="text-[#a78bfa]">Entregue</span>.
            </p>
          ) : (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Projeto</th>
                    <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Origem</th>
                    <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Pedidos</th>
                    <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Total</th>
                    <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden sm:table-cell">Última</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.key} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
                      <td className="px-4 py-3 text-[#ebebeb] text-sm font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-[#888888] text-sm">{projectName(c.projectId)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#888888] text-sm capitalize">{c.origin}</td>
                      <td className="px-4 py-3 text-right text-[#ebebeb] text-sm">{c.orders}</td>
                      <td className="px-4 py-3 text-right text-[#10b981] text-sm font-semibold">{fmt(c.total)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell text-[#555555] text-xs">
                        {new Date(c.lastDate).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {creating && (
        <Modal title="Novo Lead" onClose={() => setCreating(false)}>
          <LeadForm projects={state.projects} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Editar Lead" onClose={() => setEditing(null)}>
          <LeadForm
            projects={state.projects}
            initial={{
              projectId: editing.projectId, name: editing.name, contact: editing.contact,
              source: editing.source, status: editing.status, value: String(editing.value),
              notes: editing.notes, date: editing.date,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
