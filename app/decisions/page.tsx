'use client'

/**
 * app/decisions/page.tsx — Modulo de Decisoes V4
 *
 * Migrado para ModuleShell em 2026-06-03 (debito #4 ADR 032).
 * Funcionalidade 100% preservada: filtros, modais, toggle status, KPIs.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - ProjectFilter (select de projeto)
 *       - Lista de cards de decisao (badge + impacto + opacity 50% se descartada)
 *   Modais: Registrar / Editar Decisao
 *
 * KPIs V4:
 *   Hero  — decisoes ativas (de total)
 *   Sat 1 — descartadas (neutral)
 *   Sat 2 — registradas nos ultimos 30d
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Decision, DecisionStatus } from '@/lib/types'
import {
  Plus, Pencil, Trash2, MoreHorizontal, CheckCircle2, XCircle,
} from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { ModuleShell, V4ThemeProvider } from '@/components/dashboard/v4'
import { UnderlineMarker } from '@/components/visual-library'
import { DecisionsEmptyState } from './_components/DecisionsEmptyState'

import '../globals-v4.css'

// ─── Config status ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Ativa',      color: 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]', icon: CheckCircle2 },
  discarded: { label: 'Descartada', color: 'text-[#888888] bg-[#88888818] border-[#88888833]', icon: XCircle },
}

type DecisionTab = 'all' | DecisionStatus

const DECISION_TABS: Array<{ id: DecisionTab; label: string }> = [
  { id: 'all',       label: 'Todas' },
  { id: 'active',    label: 'Ativas' },
  { id: 'discarded', label: 'Descartadas' },
]

// ─── Badge ──────────────────────────────────────────────────────────────────

function Badge({ status }: { status: DecisionStatus }) {
  const { label, color, icon: Icon } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      <Icon size={10} aria-hidden="true" />
      {label}
    </span>
  )
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

type FormData = {
  projectId: string; decision: string; impact: string; status: DecisionStatus; date: string
}

function DecisionForm({ projects, initial, onSave, onClose }: {
  projects: { id: string; name: string }[]
  initial?: FormData; onSave: (d: FormData) => void; onClose: () => void
}) {
  const [data, setData] = useState<FormData>(initial ?? {
    projectId: projects[0]?.id ?? '',
    decision: '',
    impact: '',
    status: 'active',
    date: new Date().toISOString().slice(0, 10),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.decision.trim()) return
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
      <FormField label="Decisao">
        <Textarea value={data.decision} onChange={set('decision')} placeholder="Tipo: parei de fazer cosplay armor pq da muito trabalho e pouco lucro" required />
      </FormField>
      <FormField label="Impacto esperado">
        <Input value={data.impact} onChange={set('impact')} placeholder="Alto, medio, baixo + descricao curta" />
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
      <SubmitButton>{initial ? 'Salvar' : 'Registrar decisao'}</SubmitButton>
    </form>
  )
}

// ─── Filtro projeto ─────────────────────────────────────────────────────────

interface ProjectFilterProps {
  projects: { id: string; name: string }[]
  value:    string
  onChange: (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="decisions-project-filter" className="sr-only">Filtrar por projeto</label>
      <select
        id="decisions-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar decisoes por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Page principal ─────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const { state, dispatch, loading } = useStore()

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Decision | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<DecisionTab>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [search, setSearch] = useState('')

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback((data: FormData) => {
    dispatch({ type: 'ADD_DECISION', payload: { id: uid(), ...data } })
  }, [dispatch])

  const handleEdit = useCallback((data: FormData) => {
    if (!editing) return
    dispatch({ type: 'UPDATE_DECISION', payload: { ...editing, ...data } })
    setEditing(null)
  }, [editing, dispatch])

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DECISION', payload: id })
    setMenuOpen(null)
  }, [dispatch])

  const toggleStatus = useCallback((d: Decision) => {
    const next: DecisionStatus = d.status === 'active' ? 'discarded' : 'active'
    dispatch({ type: 'UPDATE_DECISION', payload: { ...d, status: next } })
    setMenuOpen(null)
  }, [dispatch])

  // ── Derivações ────────────────────────────────────────────────────────────

  const scopedByProject = useMemo(
    () => filterProject === 'all' ? state.decisions : state.decisions.filter(d => d.projectId === filterProject),
    [state.decisions, filterProject],
  )

  const filtered = useMemo(() => {
    let list = filterTab === 'all' ? scopedByProject : scopedByProject.filter(d => d.status === filterTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d => d.decision.toLowerCase().includes(q) || d.impact.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [scopedByProject, filterTab, search])

  const projectName = useCallback(
    (id: string) => state.projects.find(p => p.id === id)?.name ?? '-',
    [state.projects],
  )

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const totalActive    = scopedByProject.filter(d => d.status === 'active').length
  const totalDiscarded = scopedByProject.filter(d => d.status === 'discarded').length
  const totalAll       = scopedByProject.length

  // Decisoes nos ultimos 30 dias
  const recent30 = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return scopedByProject.filter(d => d.date >= cutoffStr).length
  }, [scopedByProject])

  // ── Tabs com contagem ─────────────────────────────────────────────────────

  const tabs = useMemo(
    () => DECISION_TABS.map(t => ({
      id: t.id,
      label: t.label,
      count: t.id === 'all'
        ? scopedByProject.length
        : scopedByProject.filter(d => d.status === t.id).length,
      active: filterTab === t.id,
    })),
    [scopedByProject, filterTab],
  )

  // ── Frase viva ────────────────────────────────────────────────────────────

  const livePhrase = useMemo(() => {
    if (totalAll === 0) {
      return (
        <>
          Nenhuma decisao registrada.{' '}
          <UnderlineMarker tone="petrol">A memoria do negocio comeca aqui</UnderlineMarker>.
        </>
      )
    }
    if (recent30 === 0) {
      return (
        <>
          {totalActive} {totalActive === 1 ? 'decisao ativa' : 'decisoes ativas'},{' '}
          <UnderlineMarker tone="ember">nada novo nos ultimos 30 dias</UnderlineMarker>.
        </>
      )
    }
    return (
      <>
        <UnderlineMarker tone="petrol">{recent30} {recent30 === 1 ? 'decisao registrada' : 'decisoes registradas'} no ultimo mes</UnderlineMarker>
        {', '}{totalActive} {totalActive === 1 ? 'ativa' : 'ativas'} no total.
      </>
    )
  }, [totalAll, totalActive, recent30])

  // ── Eyebrow ───────────────────────────────────────────────────────────────

  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()
  const eyebrow  = `${mesAtual} · ${totalActive} ${totalActive === 1 ? 'ATIVA' : 'ATIVAS'} · ${totalAll} TOTAL`

  // ── Handlers tab + search ─────────────────────────────────────────────────

  const handleTabChange = useCallback((id: string) => setFilterTab(id as DecisionTab), [])
  const handleSearch    = useCallback((q: string) => setSearch(q), [])

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading) return null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={eyebrow}
        title="Decisoes"
        titleItalicSuffix="que sustentaram o negocio"
        livePhrase={livePhrase}
        primaryAction={{
          label: 'Registrar',
          onClick: () => setCreating(true),
          icon: <Plus size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label: 'DECISOES ATIVAS',
          value: String(totalActive),
          description: totalActive > 0
            ? `${totalAll} no historico total.`
            : 'nenhuma decisao ativa.',
        }}
        satelliteKpis={[
          {
            label:       'NOS ULTIMOS 30D',
            value:       String(recent30),
            description: recent30 > 0 ? 'registradas no mes.' : 'nada novo no periodo.',
            tone:        recent30 > 0 ? 'petrol' : 'neutral',
          },
          {
            label:       'DESCARTADAS',
            value:       String(totalDiscarded),
            description: totalDiscarded > 0
              ? `${totalDiscarded} que foram revistas.`
              : 'nenhuma descartada ainda.',
            tone:        'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar decisao, impacto..."
        onSearch={handleSearch}
      >
        <ProjectFilter
          projects={state.projects}
          value={filterProject}
          onChange={setFilterProject}
        />

        {/* Lista */}
        <div className="space-y-2">
          {filtered.map(d => (
            <div
              key={d.id}
              className={`bg-[var(--v4-surface-1)] border rounded-xl p-5 group hover:border-[#3a3a3a] transition-colors ${
                d.status === 'discarded' ? 'opacity-50 border-[#1c1c1c]' : 'border-[var(--v4-border-soft)]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge status={d.status} />
                    <span className="text-[#555555] text-xs">{projectName(d.projectId)}</span>
                    <span className="text-[#3a3a3a] text-xs">·</span>
                    <span className="text-[#555555] text-xs">{new Date(d.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-[#ebebeb] text-sm leading-relaxed mb-2">{d.decision}</p>
                  {d.impact && (
                    <p className="text-[#555555] text-xs">
                      <span className="text-[#3a3a3a]">Impacto:</span> {d.impact}
                    </p>
                  )}
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                    className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Mais opcoes"
                  >
                    <MoreHorizontal size={15} aria-hidden="true" />
                  </button>
                  {menuOpen === d.id && (
                    <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-44 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleStatus(d)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                      >
                        {d.status === 'active' ? <XCircle size={13} aria-hidden="true" /> : <CheckCircle2 size={13} aria-hidden="true" />}
                        {d.status === 'active' ? 'Descartar' : 'Reativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(d); setMenuOpen(null) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Pencil size={13} aria-hidden="true" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
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
            <DecisionsEmptyState onCreateClick={() => setCreating(true)} />
          )}
          {filtered.length === 0 && scopedByProject.length > 0 && (
            <div className="py-16 text-center">
              <p className="text-[#555555] text-sm">Nenhuma decisao nesse filtro.</p>
            </div>
          )}
        </div>
      </ModuleShell>

      {/* Modals */}
      {creating && (
        <Modal title="Registrar decisao" onClose={() => setCreating(false)}>
          <DecisionForm projects={state.projects} onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar decisao" onClose={() => setEditing(null)}>
          <DecisionForm
            projects={state.projects}
            initial={{
              projectId: editing.projectId,
              decision: editing.decision,
              impact: editing.impact,
              status: editing.status,
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
