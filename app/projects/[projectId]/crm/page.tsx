'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import type { Lead, LeadStatus, ContactSource, Affiliate } from '@/lib/types'
import { LEAD_STATUS_LABELS, CONTACT_SOURCE_LABELS } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Users, TrendingUp, LayoutList, Columns } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:         'text-[#888888] bg-[#88888818] border-[#88888833]',
  contacted:   'text-[#3b82f6] bg-[#3b82f61a] border-[#3b82f633]',
  negotiating: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]',
  won:         'text-[#10b981] bg-[#10b9811a] border-[#10b98133]',
  lost:        'text-[#ef4444] bg-[#ef44441a] border-[#ef444433]',
}

function Badge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

type LeadFormData = {
  name: string; contact: string; source: ContactSource; status: LeadStatus; value: string; notes: string; date: string
}

function LeadForm({ initial, onSave, onClose }: { initial?: LeadFormData; onSave: (d: LeadFormData) => void; onClose: () => void }) {
  const [data, setData] = useState<LeadFormData>(initial ?? {
    name: '', contact: '', source: 'instagram', status: 'new',
    value: '', notes: '', date: new Date().toISOString().slice(0, 10),
  })
  const set = (k: keyof LeadFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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

type AffFormData = { name: string; platform: string; code: string; commission: string; status: 'active' | 'inactive'; date: string }

function AffiliateForm({ initial, onSave, onClose }: { initial?: AffFormData; onSave: (d: AffFormData) => void; onClose: () => void }) {
  const [data, setData] = useState<AffFormData>(initial ?? {
    name: '', platform: '', code: '', commission: '15', status: 'active',
    date: new Date().toISOString().slice(0, 10),
  })
  const set = (k: keyof AffFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
        <FormField label="Nome">
          <Input value={data.name} onChange={set('name')} placeholder="Nome do afiliado" required />
        </FormField>
        <FormField label="Plataforma">
          <Input value={data.platform} onChange={set('platform')} placeholder="Instagram, YouTube..." />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Código de Afiliado">
          <Input value={data.code} onChange={set('code')} placeholder="Ex: NOME15" />
        </FormField>
        <FormField label="Comissão (%)">
          <Input type="number" value={data.commission} onChange={set('commission')} min="0" max="100" />
        </FormField>
      </div>
      <FormField label="Status">
        <Select value={data.status} onChange={set('status')}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </FormField>
      <SubmitButton>{initial ? 'Salvar' : 'Adicionar Afiliado'}</SubmitButton>
    </form>
  )
}

type Tab = 'leads' | 'affiliates'
type LeadsView = 'list' | 'kanban'

export default function ProjectCrmPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('leads')
  const [leadsView, setLeadsView] = useState<LeadsView>('list')
  const [creating, setCreating] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [editingAff, setEditingAff] = useState<Affiliate | null>(null)
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const leads = state.leads.filter(l => l.projectId === projectId)
  const affiliates = state.affiliates.filter(a => a.projectId === projectId)

  const filteredLeads = filterStatus === 'all' ? leads : leads.filter(l => l.status === filterStatus)
  const sortedLeads = [...filteredLeads].sort((a, b) => b.date.localeCompare(a.date))

  function handleAddLead(data: LeadFormData) {
    dispatch({ type: 'ADD_LEAD', payload: { id: uid(), projectId, ...data, value: parseFloat(data.value) || 0 } })
  }
  function handleEditLead(data: LeadFormData) {
    if (!editingLead) return
    dispatch({ type: 'UPDATE_LEAD', payload: { ...editingLead, ...data, value: parseFloat(data.value) || 0 } })
    setEditingLead(null)
  }
  function handleDeleteLead(id: string) {
    dispatch({ type: 'DELETE_LEAD', payload: id })
    setMenuOpen(null)
  }
  function advanceLead(lead: Lead) {
    const order: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']
    const idx = order.indexOf(lead.status)
    if (idx < order.length - 1) dispatch({ type: 'UPDATE_LEAD', payload: { ...lead, status: order[idx + 1] } })
    setMenuOpen(null)
  }

  function handleAddAff(data: AffFormData) {
    dispatch({ type: 'ADD_AFFILIATE', payload: { id: uid(), projectId, ...data, totalSales: 0, commission: parseFloat(data.commission) || 15 } })
  }
  function handleDeleteAff(id: string) {
    dispatch({ type: 'DELETE_AFFILIATE', payload: id })
    setMenuOpen(null)
  }

  const totalLeadValue = leads.filter(l => l.status === 'won').reduce((s, l) => s + l.value, 0)
  const totalAffSales  = affiliates.reduce((s, a) => s + a.totalSales, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">CRM</h2>
          <p className="text-[#555555] text-sm">{leads.length} leads · {affiliates.length} afiliados</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> {tab === 'leads' ? 'Novo Lead' : 'Novo Afiliado'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([s, label]) => {
          const count = leads.filter(l => l.status === s).length
          return (
            <button
              key={s}
              onClick={() => { setTab('leads'); setFilterStatus(s) }}
              className={`bg-[#141414] border rounded-xl p-3 text-left transition-colors hover:border-[#3a3a3a] ${filterStatus === s && tab === 'leads' ? 'border-[#7c3aed44]' : 'border-[#2a2a2a]'}`}
            >
              <p className="text-[#ebebeb] text-xl font-bold">{count}</p>
              <p className="text-[#555555] text-xs">{label}</p>
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-1 w-fit">
        {(['leads', 'affiliates'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#888888] hover:text-[#ebebeb]'
            }`}
          >
            {t === 'leads' ? <Users size={14} /> : <TrendingUp size={14} />}
            {t === 'leads' ? 'Leads' : 'Afiliados'}
          </button>
        ))}
      </div>

      {/* Leads tab */}
      {tab === 'leads' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterStatus === 'all' ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
              >
                Todos ({leads.length})
              </button>
              {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterStatus === s ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
                >
                  {LEAD_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-0.5">
              <button
                onClick={() => setLeadsView('list')}
                className={`p-1.5 rounded-md transition-colors ${leadsView === 'list' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                title="Vista em lista"
              >
                <LayoutList size={13} />
              </button>
              <button
                onClick={() => setLeadsView('kanban')}
                className={`p-1.5 rounded-md transition-colors ${leadsView === 'kanban' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                title="Vista kanban"
              >
                <Columns size={13} />
              </button>
            </div>
          </div>

          {/* List view */}
          {leadsView === 'list' && (
            <div className="space-y-2">
              {sortedLeads.length === 0 && <p className="text-center text-[#555555] text-sm py-12">Nenhum lead encontrado.</p>}
              {sortedLeads.map(l => (
                <div key={l.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 group hover:border-[#3a3a3a] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge status={l.status} />
                      <span className="text-[#555555] text-xs">{CONTACT_SOURCE_LABELS[l.source]}</span>
                      {l.value > 0 && <span className="text-[#10b981] text-xs font-medium">R$ {l.value}</span>}
                    </div>
                    <p className="text-[#ebebeb] text-sm font-medium">{l.name}</p>
                    {l.contact && <p className="text-[#555555] text-xs">{l.contact}</p>}
                    {l.notes && <p className="text-[#888888] text-xs mt-1">{l.notes}</p>}
                    {l.lastContactAt && <p className="text-[#3a3a3a] text-xs mt-0.5">Último contato: {new Date(l.lastContactAt).toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {l.status !== 'won' && l.status !== 'lost' && (
                      <button
                        onClick={() => advanceLead(l)}
                        className="text-xs text-[#7c3aed] hover:text-[#a78bfa] px-2 py-1 rounded-lg hover:bg-[#7c3aed1a] transition-colors whitespace-nowrap"
                      >
                        Avançar →
                      </button>
                    )}
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === l.id ? null : l.id)} className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === l.id && (
                        <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                          <button onClick={() => { setEditingLead(l); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors">
                            <Pencil size={13} /> Editar
                          </button>
                          <button onClick={() => handleDeleteLead(l.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors">
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Kanban view */}
          {leadsView === 'kanban' && (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([status, label]) => {
                  const stageLead = leads.filter(l => l.status === status)
                  const stageValue = stageLead.reduce((s, l) => s + l.value, 0)
                  const stageColors: Record<LeadStatus, string> = {
                    new:         '#888888',
                    contacted:   '#3b82f6',
                    negotiating: '#f59e0b',
                    won:         '#10b981',
                    lost:        '#ef4444',
                  }
                  const col = stageColors[status]
                  return (
                    <div key={status} className="w-64 shrink-0">
                      {/* Column header */}
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
                          <span className="text-[#ebebeb] text-xs font-medium">{label}</span>
                          <span className="text-[#555555] text-xs">{stageLead.length}</span>
                        </div>
                        {stageValue > 0 && (
                          <span className="text-[#555555] text-xs">R$ {stageValue}</span>
                        )}
                      </div>
                      {/* Cards */}
                      <div className="space-y-2">
                        {stageLead.map(l => (
                          <div
                            key={l.id}
                            className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#3a3a3a] transition-colors"
                          >
                            <p className="text-[#ebebeb] text-sm font-medium mb-1">{l.name}</p>
                            {l.contact && <p className="text-[#555555] text-xs mb-1">{l.contact}</p>}
                            {l.notes && <p className="text-[#888888] text-xs mb-2 line-clamp-2">{l.notes}</p>}
                            <div className="flex items-center justify-between">
                              {l.value > 0
                                ? <span className="text-[#10b981] text-xs font-medium">R$ {l.value}</span>
                                : <span />
                              }
                              <div className="flex items-center gap-1">
                                {status !== 'won' && status !== 'lost' && (
                                  <button
                                    onClick={() => advanceLead(l)}
                                    className="text-[10px] text-[#7c3aed] hover:text-[#a78bfa] px-1.5 py-0.5 rounded hover:bg-[#7c3aed1a] transition-colors"
                                  >
                                    →
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingLead(l)}
                                  className="p-0.5 text-[#3a3a3a] hover:text-[#888888] transition-colors"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(l.id)}
                                  className="p-0.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stageLead.length === 0 && (
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

      {/* Affiliates tab */}
      {tab === 'affiliates' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div>
              <p className="text-[#ebebeb] font-semibold">{affiliates.filter(a => a.status === 'active').length} ativos</p>
              <p className="text-[#555555] text-xs">{totalAffSales} vendas totais</p>
            </div>
          </div>
          {affiliates.map(a => (
            <div key={a.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 group hover:border-[#3a3a3a] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#7c3aed1a] flex items-center justify-center text-[#a78bfa] font-bold text-sm shrink-0">
                {a.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#ebebeb] text-sm font-medium">{a.name}</p>
                <p className="text-[#555555] text-xs">{a.platform} · Código: {a.code || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-[#ebebeb] text-sm font-semibold">{a.totalSales} vendas</p>
                <p className="text-[#555555] text-xs">{a.commission}% comissão</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md ${a.status === 'active' ? 'text-[#10b981] bg-[#10b9811a]' : 'text-[#888888] bg-[#88888818]'}`}>
                {a.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              <button onClick={() => handleDeleteAff(a.id)} className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {affiliates.length === 0 && <p className="text-center text-[#555555] text-sm py-12">Nenhum afiliado ainda.</p>}
        </div>
      )}

      {creating && tab === 'leads' && (
        <Modal title="Novo Lead" onClose={() => setCreating(false)}>
          <LeadForm onSave={handleAddLead} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {creating && tab === 'affiliates' && (
        <Modal title="Novo Afiliado" onClose={() => setCreating(false)}>
          <AffiliateForm onSave={handleAddAff} onClose={() => setCreating(false)} />
        </Modal>
      )}
      {editingLead && (
        <Modal title="Editar Lead" onClose={() => setEditingLead(null)}>
          <LeadForm
            initial={{ name: editingLead.name, contact: editingLead.contact, source: editingLead.source, status: editingLead.status, value: String(editingLead.value), notes: editingLead.notes, date: editingLead.date }}
            onSave={handleEditLead}
            onClose={() => setEditingLead(null)}
          />
        </Modal>
      )}
    </div>
  )
}
