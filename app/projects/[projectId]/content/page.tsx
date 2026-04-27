'use client'

import { useParams } from 'next/navigation'
import { useStore, uid } from '@/lib/store'
import { useState, useCallback } from 'react'
import type { ContentItem, ContentStatus, ContentPlatform } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Eye, Users, ShoppingCart, ExternalLink, Heart, MessageCircle, Share2, Bookmark, RefreshCw } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'

// ─── Engagement helpers ───────────────────────────────────────────────────────
function calcEngagementRate(item: ContentItem): number {
  if (!item.views || item.views === 0) return 0
  const eng = (item.likes ?? 0) + (item.comments ?? 0) + (item.shares ?? 0) + (item.saves ?? 0)
  return (eng / item.views) * 100
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; next?: ContentStatus; nextLabel?: string }> = {
  idea:     { label: 'Ideia',   color: 'text-[#888888] bg-[#88888818] border-[#88888833]', next: 'recorded', nextLabel: 'Marcar Gravado' },
  recorded: { label: 'Gravado', color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]', next: 'posted', nextLabel: 'Marcar Postado' },
  posted:   { label: 'Postado', color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
}

const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: 'text-[#f59e0b]' },
  youtube:   { label: 'YouTube',   color: 'text-[#ef4444]' },
  tiktok:    { label: 'TikTok',    color: 'text-[#a78bfa]' },
}

function Badge({ status }: { status: ContentStatus }) {
  const { label, color } = STATUS_CONFIG[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{label}</span>
}

type FormData = {
  idea: string; status: ContentStatus; platform: ContentPlatform
  views: string; leads: string; salesGenerated: string; link: string; date: string
  likes: string; comments: string; shares: string; saves: string
}

function ContentForm({ initial, onSave, onClose }: { initial?: FormData; onSave: (d: FormData) => void; onClose: () => void }) {
  const [data, setData] = useState<FormData>(initial ?? {
    idea: '', status: 'idea', platform: 'instagram',
    views: '0', leads: '0', salesGenerated: '0', link: '',
    likes: '0', comments: '0', shares: '0', saves: '0',
    date: new Date().toISOString().slice(0, 10),
  })
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.idea.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Ideia / Título">
        <Textarea value={data.idea} onChange={set('idea')} placeholder="Descreva a ideia de conteúdo..." required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Plataforma">
          <Select value={data.platform} onChange={set('platform')}>
            {Object.entries(PLATFORM_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </FormField>
      </div>
      {data.status === 'posted' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Views"><Input type="number" value={data.views} onChange={set('views')} min="0" /></FormField>
            <FormField label="Leads"><Input type="number" value={data.leads} onChange={set('leads')} min="0" /></FormField>
            <FormField label="Vendas"><Input type="number" value={data.salesGenerated} onChange={set('salesGenerated')} min="0" /></FormField>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <FormField label="Curtidas"><Input type="number" value={data.likes} onChange={set('likes')} min="0" /></FormField>
            <FormField label="Comentários"><Input type="number" value={data.comments} onChange={set('comments')} min="0" /></FormField>
            <FormField label="Shares"><Input type="number" value={data.shares} onChange={set('shares')} min="0" /></FormField>
            <FormField label="Salvos"><Input type="number" value={data.saves} onChange={set('saves')} min="0" /></FormField>
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

export default function ProjectContentPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { state, dispatch, loading } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const items = state.content.filter(c => c.projectId === projectId)
  const filtered = filter === 'all' ? items : items.filter(c => c.status === filter)
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const totalViews = items.filter(c => c.status === 'posted').reduce((s, c) => s + c.views, 0)
  const totalLeads = items.filter(c => c.status === 'posted').reduce((s, c) => s + c.leads, 0)

  // ── Metrics sync ────────────────────────────────────────────────────────────
  const syncMetrics = useCallback(async () => {
    const toSync = items.filter(i => i.status === 'posted' && i.link)
    if (!toSync.length) { setSyncResult('Nenhum conteúdo postado com link.'); return }
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/content/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toSync.map(i => ({ id: i.id, link: i.link })) }),
      })
      const { synced, items: updated } = await res.json() as {
        synced: number
        items: Array<{ id: string; views: number; likes: number; comments: number; shares: number; saves: number }>
      }
      // Apply updated metrics back into store state
      for (const upd of (updated ?? [])) {
        const existing = items.find(i => i.id === upd.id)
        if (existing) {
          dispatch({
            type: 'UPDATE_CONTENT',
            payload: { ...existing, views: upd.views, likes: upd.likes, comments: upd.comments, shares: upd.shares, saves: upd.saves },
          })
        }
      }
      setSyncResult(`${synced} item(s) sincronizado(s)`)
    } catch {
      setSyncResult('Falha ao sincronizar métricas.')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncResult(null), 4000)
    }
  }, [items, dispatch])

  function parseEngagement(data: FormData) {
    return {
      views: parseInt(data.views) || 0,
      leads: parseInt(data.leads) || 0,
      salesGenerated: parseInt(data.salesGenerated) || 0,
      likes:    parseInt(data.likes)    || 0,
      comments: parseInt(data.comments) || 0,
      shares:   parseInt(data.shares)   || 0,
      saves:    parseInt(data.saves)    || 0,
    }
  }

  function handleCreate(data: FormData) {
    dispatch({ type: 'ADD_CONTENT', payload: { id: uid(), projectId, ...data, ...parseEngagement(data), link: data.link } })
  }
  function handleEdit(data: FormData) {
    if (!editing) return
    dispatch({ type: 'UPDATE_CONTENT', payload: { ...editing, ...data, ...parseEngagement(data), link: data.link } })
    setEditing(null)
  }
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_CONTENT', payload: id })
    setMenuOpen(null)
  }
  function advance(item: ContentItem) {
    const next = STATUS_CONFIG[item.status].next
    if (next) dispatch({ type: 'UPDATE_CONTENT', payload: { ...item, status: next } })
    setMenuOpen(null)
  }

  if (loading) return null
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Conteúdo</h2>
          <p className="text-[#555555] text-sm">{items.length} peças · {totalViews.toLocaleString('pt-BR')} views · {totalLeads} leads</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {syncResult && (
            <span className="text-[#10b981] text-xs">{syncResult}</span>
          )}
          <button
            onClick={syncMetrics}
            disabled={syncing}
            className="flex items-center gap-1.5 border border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            title="Sincronizar métricas de engajamento"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            <Plus size={15} /> <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['idea', 'recorded', 'posted'] as ContentStatus[]).map(s => (
          <div key={s} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <p className="text-[#ebebeb] text-xl font-bold">{items.filter(c => c.status === s).length}</p>
            <p className="text-[#555555] text-xs">{STATUS_CONFIG[s].label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'idea', 'recorded', 'posted'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filter === s ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]' : 'text-[#888888] border-transparent'}`}
          >
            {s === 'all' ? 'Todos' : STATUS_CONFIG[s as ContentStatus].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map(item => (
          <div key={item.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 group hover:border-[#3a3a3a] transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge status={item.status} />
                <span className={`text-xs font-medium ${PLATFORM_CONFIG[item.platform].color}`}>{PLATFORM_CONFIG[item.platform].label}</span>
              </div>
              <p className="text-[#ebebeb] text-sm leading-relaxed">{item.idea}</p>
              {item.status === 'posted' && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    {item.views > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><Eye size={11} /> {item.views.toLocaleString('pt-BR')}</span>}
                    {(item.likes ?? 0) > 0 && <span className="flex items-center gap-1 text-[#ef4444] text-xs"><Heart size={11} /> {item.likes}</span>}
                    {(item.comments ?? 0) > 0 && <span className="flex items-center gap-1 text-[#3b82f6] text-xs"><MessageCircle size={11} /> {item.comments}</span>}
                    {(item.shares ?? 0) > 0 && <span className="flex items-center gap-1 text-[#10b981] text-xs"><Share2 size={11} /> {item.shares}</span>}
                    {(item.saves ?? 0) > 0 && <span className="flex items-center gap-1 text-[#f59e0b] text-xs"><Bookmark size={11} /> {item.saves}</span>}
                    {item.leads > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><Users size={11} /> {item.leads} leads</span>}
                    {item.salesGenerated > 0 && <span className="flex items-center gap-1 text-[#555555] text-xs"><ShoppingCart size={11} /> {item.salesGenerated} vendas</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {item.views > 0 && (() => {
                      const er = calcEngagementRate(item)
                      return er > 0 ? (
                        <span className={`text-xs font-medium ${er >= 5 ? 'text-[#10b981]' : er >= 2 ? 'text-[#f59e0b]' : 'text-[#555555]'}`}>
                          {er.toFixed(1)}% eng.
                        </span>
                      ) : null
                    })()}
                    {item.views > 0 && item.salesGenerated > 0 && (
                      <span className="text-[#555555] text-xs">
                        {((item.salesGenerated / item.views) * 100).toFixed(2)}% conv.
                      </span>
                    )}
                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#7c3aed] hover:text-[#a78bfa] text-xs transition-colors"><ExternalLink size={11} /> Ver post</a>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {STATUS_CONFIG[item.status].next && (
                <button onClick={() => advance(item)} className="text-xs text-[#7c3aed] hover:text-[#a78bfa] px-2 py-1 rounded-lg hover:bg-[#7c3aed1a] transition-colors whitespace-nowrap">
                  {STATUS_CONFIG[item.status].nextLabel}
                </button>
              )}
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)} className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors">
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
        {sorted.length === 0 && <p className="text-center text-[#555555] text-sm py-12">Nenhum conteúdo ainda.</p>}
      </div>

      {creating && <Modal title="Novo Conteúdo" onClose={() => setCreating(false)}><ContentForm onSave={handleCreate} onClose={() => setCreating(false)} /></Modal>}
      {editing && (
        <Modal title="Editar Conteúdo" onClose={() => setEditing(null)}>
          <ContentForm
            initial={{
              idea: editing.idea, status: editing.status, platform: editing.platform,
              views: String(editing.views), leads: String(editing.leads),
              salesGenerated: String(editing.salesGenerated ?? 0), link: editing.link ?? '',
              likes: String(editing.likes ?? 0), comments: String(editing.comments ?? 0),
              shares: String(editing.shares ?? 0), saves: String(editing.saves ?? 0),
              date: editing.date,
            }}
            onSave={handleEdit} onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
