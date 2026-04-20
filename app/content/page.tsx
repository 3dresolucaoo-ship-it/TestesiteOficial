'use client'

import { useState } from 'react'
import { useStore, uid } from '@/lib/store'
import type { ContentItem, ContentStatus, ContentPlatform } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Eye, Users, ShoppingCart, ExternalLink } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

const statusConfig: Record<ContentStatus, { label: string; color: string; next?: ContentStatus; nextLabel?: string }> = {
  idea:     { label: 'Ideia',    color: 'text-[#888888] bg-[#88888818] border-[#88888833]', next: 'recorded', nextLabel: 'Marcar Gravado' },
  recorded: { label: 'Gravado',  color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]', next: 'posted', nextLabel: 'Marcar Postado' },
  posted:   { label: 'Postado',  color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
}

const platformConfig: Record<ContentPlatform, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: 'text-[#f59e0b]' },
  youtube:   { label: 'YouTube',   color: 'text-[#ef4444]' },
  tiktok:    { label: 'TikTok',    color: 'text-[#a78bfa]' },
}

function Badge({ status }: { status: ContentStatus }) {
  const { label, color } = statusConfig[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{label}</span>
}

type FormData = {
  projectId: string; idea: string; status: ContentStatus
  platform: ContentPlatform; views: string; leads: string; salesGenerated: string; link: string; date: string
}

function ContentForm({ projects, initial, onSave, onClose }: {
  projects: { id: string; name: string }[]
  initial?: FormData; onSave: (d: FormData) => void; onClose: () => void
}) {
  const [data, setData] = useState<FormData>(initial ?? {
    projectId: projects[0]?.id ?? '', idea: '', status: 'idea',
    platform: 'instagram', views: '0', leads: '0', salesGenerated: '0', link: '',
    date: new Date().toISOString().slice(0, 10)
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.idea.trim()) return
    onSave(data)
    onClose()
  }

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={set('projectId')}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Ideia / Título">
        <Textarea value={data.idea} onChange={set('idea')} placeholder="Descreva a ideia de conteúdo..." required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Plataforma">
          <Select value={data.platform} onChange={set('platform')}>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="idea">Ideia</option>
            <option value="recorded">Gravado</option>
            <option value="posted">Postado</option>
          </Select>
        </FormField>
      </div>
      {data.status === 'posted' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Views">
              <Input type="number" value={data.views} onChange={set('views')} min="0" />
            </FormField>
            <FormField label="Leads">
              <Input type="number" value={data.leads} onChange={set('leads')} min="0" />
            </FormField>
            <FormField label="Vendas">
              <Input type="number" value={data.salesGenerated} onChange={set('salesGenerated')} min="0" />
            </FormField>
          </div>
          <FormField label="Link">
            <Input value={data.link} onChange={set('link')} placeholder="https://..." />
          </FormField>
        </>
      )}
      <SubmitButton>{initial ? 'Salvar' : 'Criar Conteúdo'}</SubmitButton>
    </form>
  )
}

export default function ContentPage() {
  const { state, dispatch } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  function handleCreate(data: FormData) {
    dispatch({ type: 'ADD_CONTENT', payload: { id: uid(), ...data, views: parseInt(data.views) || 0, leads: parseInt(data.leads) || 0, salesGenerated: parseInt(data.salesGenerated) || 0, link: data.link } })
  }

  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({ type: 'UPDATE_CONTENT', payload: { ...editing, ...data, views: parseInt(data.views) || 0, leads: parseInt(data.leads) || 0, salesGenerated: parseInt(data.salesGenerated) || 0, link: data.link } })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_CONTENT', payload: id })
    setMenuOpen(null)
  }

  function advanceStatus(item: ContentItem) {
    const next = statusConfig[item.status].next
    if (next) dispatch({ type: 'UPDATE_CONTENT', payload: { ...item, status: next } })
    setMenuOpen(null)
  }

  const byProject = filterProject === 'all' ? state.content : state.content.filter(c => c.projectId === filterProject)
  const items = filter === 'all' ? byProject : byProject.filter(c => c.status === filter)
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))
  const projectName = (id: string) => state.projects.find(p => p.id === id)?.name ?? '—'

  const totalViews = byProject.filter(c => c.status === 'posted').reduce((s, c) => s + c.views, 0)
  const totalLeads = byProject.filter(c => c.status === 'posted').reduce((s, c) => s + c.leads, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Conteúdo</h2>
          <p className="text-[#555555] text-sm">{byProject.length} peças · {totalViews.toLocaleString('pt-BR')} views · {totalLeads} leads</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Novo
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

      {/* Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'idea', 'recorded', 'posted'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]' : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'}`}
          >
            {s === 'all' ? 'Todos' : statusConfig[s as ContentStatus].label}
            <span className="text-[#555555]">
              {s === 'all' ? byProject.length : byProject.filter(c => c.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map(item => (
          <div key={item.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 group hover:border-[#3a3a3a] transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge status={item.status} />
                <span className={`text-xs font-medium ${platformConfig[item.platform].color}`}>
                  {platformConfig[item.platform].label}
                </span>
                <span className="text-[#3a3a3a] text-xs">·</span>
                <span className="text-[#555555] text-xs">{projectName(item.projectId)}</span>
              </div>
              <p className="text-[#ebebeb] text-sm leading-relaxed">{item.idea}</p>
              {item.status === 'posted' && (item.views > 0 || item.leads > 0 || item.salesGenerated > 0) && (
                <div className="flex items-center gap-4 mt-2">
                  {item.views > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><Eye size={11} /> {item.views.toLocaleString('pt-BR')} views</span>}
                  {item.leads > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><Users size={11} /> {item.leads} leads</span>}
                  {item.salesGenerated > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><ShoppingCart size={11} /> {item.salesGenerated} vendas</span>}
                  {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#7c3aed] hover:text-[#a78bfa] text-xs transition-colors"><ExternalLink size={11} /> Ver post</a>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {statusConfig[item.status].next && (
                <button
                  onClick={() => advanceStatus(item)}
                  className="text-xs text-[#7c3aed] hover:text-[#a78bfa] px-2 py-1 rounded-lg hover:bg-[#7c3aed1a] transition-colors whitespace-nowrap"
                >
                  {statusConfig[item.status].nextLabel}
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                  className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"
                >
                  <MoreHorizontal size={15} />
                </button>
                {menuOpen === item.id && (
                  <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                    <button onClick={() => { setEditing(item); setMenuOpen(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors">
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors">
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#555555] text-sm">Nenhum conteúdo ainda.</p>
          </div>
        )}
      </div>

      {creating && (
        <Modal title="Novo Conteúdo" onClose={() => setCreating(false)}>
          <ContentForm projects={state.projects} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Conteúdo" onClose={() => setEditing(null)}>
          <ContentForm
            projects={state.projects}
            initial={{ projectId: editing.projectId, idea: editing.idea, status: editing.status, platform: editing.platform, views: String(editing.views), leads: String(editing.leads), salesGenerated: String(editing.salesGenerated ?? 0), link: editing.link ?? '', date: editing.date }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
