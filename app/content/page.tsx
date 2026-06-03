'use client'

/**
 * app/content/page.tsx — Modulo de Conteudo V4
 *
 * Migrado para ModuleShell em 2026-06-03 (debito #4 ADR 032).
 * Funcionalidade 100% preservada: filtros, modais, advanceStatus, KPIs.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - ProjectFilter (select de projeto)
 *       - PlatformFilter (Instagram/YouTube/TikTok)
 *       - Lista de cards de conteudo (com botao Avancar status)
 *   Modais: Novo / Editar Conteudo
 *
 * KPIs V4:
 *   Hero  — pecas publicadas (de total)
 *   Sat 1 — total de views (todas postadas)
 *   Sat 2 — leads gerados (todas postadas)
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { ContentItem, ContentStatus, ContentPlatform } from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, Eye, Users, ShoppingCart, ExternalLink,
} from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { ModuleShell, V4ThemeProvider } from '@/components/dashboard/v4'
import { UnderlineMarker } from '@/components/visual-library'
import { ContentEmptyState } from './_components/ContentEmptyState'

import '../globals-v4.css'

// ─── Config status + plataforma ─────────────────────────────────────────────

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; next?: ContentStatus; nextLabel?: string }> = {
  idea:     { label: 'Ideia',    color: 'text-[#888888] bg-[#88888818] border-[#88888833]', next: 'recorded', nextLabel: 'Gravado' },
  recorded: { label: 'Gravado',  color: 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]', next: 'posted',   nextLabel: 'Postado' },
  posted:   { label: 'Postado',  color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]' },
}

const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: 'text-[#f59e0b]' },
  youtube:   { label: 'YouTube',   color: 'text-[#ef4444]' },
  tiktok:    { label: 'TikTok',    color: 'text-[#a78bfa]' },
}

type ContentTab = 'all' | ContentStatus

const CONTENT_TABS: Array<{ id: ContentTab; label: string }> = [
  { id: 'all',      label: 'Todos' },
  { id: 'idea',     label: 'Ideia' },
  { id: 'recorded', label: 'Gravado' },
  { id: 'posted',   label: 'Postado' },
]

// ─── Badge ──────────────────────────────────────────────────────────────────

function Badge({ status }: { status: ContentStatus }) {
  const { label, color } = STATUS_CONFIG[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>{label}</span>
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

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
    date: new Date().toISOString().slice(0, 10),
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
      <FormField label="Ideia / Titulo">
        <Textarea value={data.idea} onChange={set('idea')} placeholder="Tipo: video mostrando o pedido da semana, antes/depois do chaveiro, etc." required />
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
      <SubmitButton>{initial ? 'Salvar' : 'Criar conteudo'}</SubmitButton>
    </form>
  )
}

// ─── Helpers de filtro ──────────────────────────────────────────────────────

interface ProjectFilterProps {
  projects: { id: string; name: string }[]
  value:    string
  onChange: (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="content-project-filter" className="sr-only">Filtrar por projeto</label>
      <select
        id="content-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar conteudo por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  )
}

interface PlatformFilterProps {
  value: ContentPlatform | 'all'
  onChange: (v: ContentPlatform | 'all') => void
}

function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  const options: Array<{ id: ContentPlatform | 'all'; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'tiktok', label: 'TikTok' },
  ]
  return (
    <div className="mb-4 flex items-center gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === o.id
              ? 'bg-[hsl(173_58%_28%/0.18)] text-[hsl(173_58%_60%)] border border-[hsl(173_58%_28%/0.35)]'
              : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Page principal ─────────────────────────────────────────────────────────

export default function ContentPage() {
  const { state, dispatch, loading } = useStore()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<ContentTab>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<ContentPlatform | 'all'>('all')
  const [search, setSearch] = useState('')

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback((data: FormData) => {
    dispatch({
      type: 'ADD_CONTENT',
      payload: {
        id: uid(), ...data,
        views: parseInt(data.views) || 0,
        leads: parseInt(data.leads) || 0,
        salesGenerated: parseInt(data.salesGenerated) || 0,
        link: data.link,
      },
    })
  }, [dispatch])

  const handleEdit = useCallback((data: FormData) => {
    if (!editing) return
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: {
        ...editing, ...data,
        views: parseInt(data.views) || 0,
        leads: parseInt(data.leads) || 0,
        salesGenerated: parseInt(data.salesGenerated) || 0,
        link: data.link,
      },
    })
    setEditing(null)
  }, [editing, dispatch])

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: id })
    setMenuOpen(null)
  }, [dispatch])

  const advanceStatus = useCallback((item: ContentItem) => {
    const next = STATUS_CONFIG[item.status].next
    if (next) dispatch({ type: 'UPDATE_CONTENT', payload: { ...item, status: next } })
    setMenuOpen(null)
  }, [dispatch])

  // ── Derivações ────────────────────────────────────────────────────────────

  const scopedByProject = useMemo(
    () => filterProject === 'all' ? state.content : state.content.filter(c => c.projectId === filterProject),
    [state.content, filterProject],
  )

  const scopedByPlatform = useMemo(
    () => filterPlatform === 'all' ? scopedByProject : scopedByProject.filter(c => c.platform === filterPlatform),
    [scopedByProject, filterPlatform],
  )

  const filtered = useMemo(() => {
    let list = filterTab === 'all' ? scopedByPlatform : scopedByPlatform.filter(c => c.status === filterTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.idea.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [scopedByPlatform, filterTab, search])

  const projectName = useCallback(
    (id: string) => state.projects.find(p => p.id === id)?.name ?? '-',
    [state.projects],
  )

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const postedItems = useMemo(
    () => scopedByProject.filter(c => c.status === 'posted'),
    [scopedByProject],
  )

  const totalPublished = postedItems.length
  const totalViews     = postedItems.reduce((s, c) => s + c.views, 0)
  const totalLeads     = postedItems.reduce((s, c) => s + c.leads, 0)
  const totalSales     = postedItems.reduce((s, c) => s + (c.salesGenerated ?? 0), 0)
  const totalIdeas     = scopedByProject.filter(c => c.status === 'idea').length

  // ── Tabs com contagem ─────────────────────────────────────────────────────

  const tabs = useMemo(
    () => CONTENT_TABS.map(t => ({
      id: t.id,
      label: t.label,
      count: t.id === 'all'
        ? scopedByPlatform.length
        : scopedByPlatform.filter(c => c.status === t.id).length,
      active: filterTab === t.id,
    })),
    [scopedByPlatform, filterTab],
  )

  // ── Frase viva ────────────────────────────────────────────────────────────

  const livePhrase = useMemo(() => {
    if (scopedByProject.length === 0) {
      return (
        <>
          Nenhum conteudo registrado.{' '}
          <UnderlineMarker tone="petrol">A primeira ideia vira nota aqui</UnderlineMarker>.
        </>
      )
    }
    if (totalPublished === 0 && totalIdeas > 0) {
      return (
        <>
          <UnderlineMarker tone="ember">{totalIdeas} {totalIdeas === 1 ? 'ideia' : 'ideias'} parada</UnderlineMarker>
          {' '}sem virar post. Grava 1 hoje?
        </>
      )
    }
    if (totalLeads > 0) {
      return (
        <>
          {totalPublished} {totalPublished === 1 ? 'post publicado' : 'posts publicados'},{' '}
          <UnderlineMarker tone="petrol">{totalLeads} {totalLeads === 1 ? 'lead' : 'leads'} chegou daqui</UnderlineMarker>
          {totalSales > 0 && (<>{' '}e {totalSales} {totalSales === 1 ? 'venda' : 'vendas'}</>)}.
        </>
      )
    }
    return (
      <>
        {totalPublished} {totalPublished === 1 ? 'post publicado' : 'posts publicados'}, {totalViews.toLocaleString('pt-BR')} views.
      </>
    )
  }, [scopedByProject.length, totalPublished, totalIdeas, totalLeads, totalSales, totalViews])

  // ── Eyebrow ───────────────────────────────────────────────────────────────

  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()
  const eyebrow  = `${mesAtual} · ${totalIdeas} ${totalIdeas === 1 ? 'IDEIA' : 'IDEIAS'} · ${totalPublished} ${totalPublished === 1 ? 'POSTADO' : 'POSTADOS'}`

  // ── Handlers tab + search ─────────────────────────────────────────────────

  const handleTabChange = useCallback((id: string) => setFilterTab(id as ContentTab), [])
  const handleSearch    = useCallback((q: string) => setSearch(q), [])

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading) return null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={eyebrow}
        title="Conteudo"
        titleItalicSuffix="que da retorno"
        livePhrase={livePhrase}
        primaryAction={{
          label: 'Ideia nova',
          onClick: () => setCreating(true),
          icon: <Plus size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label: `PUBLICADOS (${mesAtual})`,
          value: String(totalPublished),
          description: totalPublished === 0
            ? 'nenhum post ainda no periodo.'
            : `${totalViews.toLocaleString('pt-BR')} views no total.`,
        }}
        satelliteKpis={[
          {
            label:       'LEADS GERADOS',
            value:       String(totalLeads),
            description: totalLeads > 0 ? 'leads veio do conteudo.' : 'nenhum lead daqui ainda.',
            tone:        totalLeads > 0 ? 'petrol' : 'neutral',
          },
          {
            label:       'VENDAS GERADAS',
            value:       String(totalSales),
            description: totalSales > 0 ? 'vendas vieram dos posts.' : 'sem venda atribuida ainda.',
            tone:        'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar ideia, titulo..."
        onSearch={handleSearch}
      >
        <ProjectFilter
          projects={state.projects}
          value={filterProject}
          onChange={setFilterProject}
        />

        <PlatformFilter
          value={filterPlatform}
          onChange={setFilterPlatform}
        />

        {/* Lista */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-[var(--v4-surface-1)] border border-[var(--v4-border-soft)] rounded-xl p-4 flex items-start gap-4 group hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge status={item.status} />
                  <span className={`text-xs font-medium ${PLATFORM_CONFIG[item.platform].color}`}>
                    {PLATFORM_CONFIG[item.platform].label}
                  </span>
                  <span className="text-[#3a3a3a] text-xs">·</span>
                  <span className="text-[#555555] text-xs">{projectName(item.projectId)}</span>
                </div>
                <p className="text-[#ebebeb] text-sm leading-relaxed">{item.idea}</p>
                {item.status === 'posted' && (item.views > 0 || item.leads > 0 || (item.salesGenerated ?? 0) > 0) && (
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {item.views > 0 && (
                      <span className="flex items-center gap-1 text-[#555555] text-xs">
                        <Eye size={11} aria-hidden="true" /> {item.views.toLocaleString('pt-BR')} views
                      </span>
                    )}
                    {item.leads > 0 && (
                      <span className="flex items-center gap-1 text-[#555555] text-xs">
                        <Users size={11} aria-hidden="true" /> {item.leads} leads
                      </span>
                    )}
                    {(item.salesGenerated ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-[#555555] text-xs">
                        <ShoppingCart size={11} aria-hidden="true" /> {item.salesGenerated} vendas
                      </span>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[hsl(173_58%_55%)] hover:text-[hsl(173_58%_65%)] text-xs transition-colors"
                      >
                        <ExternalLink size={11} aria-hidden="true" /> Ver post
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {STATUS_CONFIG[item.status].next && (
                  <button
                    type="button"
                    onClick={() => advanceStatus(item)}
                    className="text-xs text-[hsl(173_58%_60%)] hover:text-[hsl(173_58%_70%)] px-2 py-1 rounded-lg hover:bg-[hsl(173_58%_28%/0.12)] transition-colors whitespace-nowrap"
                    aria-label={`Marcar como ${STATUS_CONFIG[item.status].nextLabel}`}
                  >
                    Marcar {STATUS_CONFIG[item.status].nextLabel}
                  </button>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                    className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"
                    aria-label="Mais opcoes"
                  >
                    <MoreHorizontal size={15} aria-hidden="true" />
                  </button>
                  {menuOpen === item.id && (
                    <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => { setEditing(item); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Pencil size={13} aria-hidden="true" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                      >
                        <Trash2 size={13} aria-hidden="true" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && scopedByProject.length === 0 && (
            <ContentEmptyState onCreateClick={() => setCreating(true)} />
          )}
          {filtered.length === 0 && scopedByProject.length > 0 && (
            <div className="py-16 text-center">
              <p className="text-[#555555] text-sm">Nenhum conteudo nesse filtro.</p>
            </div>
          )}
        </div>
      </ModuleShell>

      {/* Modals */}
      {creating && (
        <Modal title="Nova ideia de conteudo" onClose={() => setCreating(false)}>
          <ContentForm projects={state.projects} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar conteudo" onClose={() => setEditing(null)}>
          <ContentForm
            projects={state.projects}
            initial={{
              projectId: editing.projectId,
              idea: editing.idea,
              status: editing.status,
              platform: editing.platform,
              views: String(editing.views),
              leads: String(editing.leads),
              salesGenerated: String(editing.salesGenerated ?? 0),
              link: editing.link ?? '',
              date: editing.date,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  )
}
