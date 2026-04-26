'use client'

import { useState } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Project, ProjectStatus } from '@/lib/types'
import { getProjectColor } from '@/lib/moduleConfig'
import { calcRevenue, calcProfit } from '@/core/finance/engine'
import { Plus, ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Modal, FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { PROJECT_MODULES_BY_TYPE } from '@/lib/types'
import type { ProjectType, ProjectModule } from '@/lib/types'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Ativo', paused: 'Pausado', done: 'Finalizado',
}

const TYPE_LABELS: Record<ProjectType, string> = {
  '3d_printing':     'Impressão 3D',
  'marketing':       'Marketing',
  'business':        'Negócios',
  'content_creator': 'Criador de Conteúdo',
}

const MODULE_LABELS: Record<ProjectModule, string> = {
  finance: 'Finanças', crm: 'CRM', inventory: 'Estoque',
  content: 'Conteúdo', operations: 'Operação', decisions: 'Decisões',
}

type FormData = { name: string; status: ProjectStatus; type: ProjectType; description: string; color: string }

function ProjectForm({ initial, onSave, onClose }: { initial?: FormData; onSave: (d: FormData) => void; onClose: () => void }) {
  const [data, setData] = useState<FormData>(initial ?? {
    name: '', status: 'active', type: '3d_printing', description: '', color: '#7c3aed',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return
    onSave(data)
    onClose()
  }

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nome do Projeto">
        <Input value={data.name} onChange={set('name')} placeholder="Ex: Meu Negócio" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo">
          <Select value={data.type} onChange={set('type')}>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="done">Finalizado</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Cor">
        <div className="flex items-center gap-3">
          <input type="color" value={data.color} onChange={set('color')} className="w-10 h-9 rounded-lg border border-[#2a2a2a] bg-transparent cursor-pointer" />
          <span className="text-[#555555] text-xs">Escolha a cor do projeto</span>
        </div>
      </FormField>
      <FormField label="Descrição">
        <Textarea value={data.description} onChange={set('description')} placeholder="Sobre o projeto..." />
      </FormField>
      <div className="bg-[#1c1c1c] rounded-lg p-3">
        <p className="text-[#555555] text-xs font-medium uppercase tracking-wide mb-2">Módulos incluídos</p>
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_MODULES_BY_TYPE[data.type].map(m => (
            <span key={m} className="text-[#a78bfa] bg-[#7c3aed1a] border border-[#7c3aed33] px-2 py-0.5 rounded-md text-xs">
              {MODULE_LABELS[m]}
            </span>
          ))}
        </div>
      </div>
      <SubmitButton>{initial ? 'Salvar' : 'Criar Projeto'}</SubmitButton>
    </form>
  )
}

export function ProjectsView({ initialProjects }: { initialProjects: Project[] }) {
  const { state, loading, dispatch } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // Use SSR data while the store hydrates, then seamlessly switch to live store state
  const projects = loading ? initialProjects : state.projects

  function handleCreate(data: FormData) {
    const modules = PROJECT_MODULES_BY_TYPE[data.type]
    dispatch({ type: 'ADD_PROJECT', payload: { id: uid(), ...data, modules } })
  }

  function handleEdit(data: FormData) {
    if (!editing) return
    const modules = PROJECT_MODULES_BY_TYPE[data.type]
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...editing, ...data, modules } })
    setEditing(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_PROJECT', payload: id })
    setMenuOpen(null)
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const otherProjects  = projects.filter(p => p.status !== 'active')

  function ProjectCard({ p }: { p: Project }) {
    const color   = getProjectColor(p)
    const revenue = calcRevenue(state.transactions, p.id)
    const profit  = calcProfit(state.transactions, p.id)
    const orders  = state.orders.filter(o => o.projectId === p.id).length

    return (
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors group relative">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
            className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen === p.id && (
            <div className="absolute right-0 top-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
              <button
                onClick={() => { setEditing(p); setMenuOpen(null) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: color }}
          >
            {p.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[#ebebeb] font-semibold text-sm">{p.name}</h3>
            <p className="text-[#555555] text-xs">{p.type ? TYPE_LABELS[p.type] : '—'}</p>
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0"
            style={{ color, borderColor: color + '44', backgroundColor: color + '11' }}
          >
            {STATUS_LABELS[p.status]}
          </span>
        </div>

        {p.description && <p className="text-[#555555] text-xs mb-4 leading-relaxed">{p.description}</p>}

        <div className="flex flex-wrap gap-1 mb-4">
          {(p.modules ?? []).map(m => (
            <span key={m} className="text-[#555555] bg-[#1c1c1c] px-2 py-0.5 rounded-md text-[11px]">
              {MODULE_LABELS[m]}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-[#1c1c1c]">
          <div>
            <p className="text-[#ebebeb] text-sm font-semibold">R$ {revenue.toFixed(0)}</p>
            <p className="text-[#555555] text-[11px]">receita</p>
          </div>
          <div>
            <p className={`text-sm font-semibold ${profit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>R$ {profit.toFixed(0)}</p>
            <p className="text-[#555555] text-[11px]">lucro</p>
          </div>
          <div>
            <p className="text-[#ebebeb] text-sm font-semibold">{orders}</p>
            <p className="text-[#555555] text-[11px]">pedidos</p>
          </div>
          <Link
            href={`/projects/${p.id}`}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color, backgroundColor: color + '15' }}
          >
            Abrir <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Projetos</h2>
          <p className="text-[#555555] text-sm">{projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Novo Projeto
        </button>
      </div>

      {activeProjects.length > 0 && (
        <div>
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest mb-3">Ativos</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeProjects.map(p => <ProjectCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {otherProjects.length > 0 && (
        <div>
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest mb-3">Outros</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherProjects.map(p => <ProjectCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-[#555555] text-sm">Nenhum projeto ainda.</p>
          <button onClick={() => setCreating(true)} className="mt-3 text-[#7c3aed] text-sm hover:text-[#a78bfa] transition-colors">
            Criar primeiro projeto →
          </button>
        </div>
      )}

      {creating && (
        <Modal title="Novo Projeto" onClose={() => setCreating(false)}>
          <ProjectForm onSave={handleCreate} onClose={() => setCreating(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Projeto" onClose={() => setEditing(null)}>
          <ProjectForm
            initial={{ name: editing.name, status: editing.status, type: editing.type ?? '3d_printing', description: editing.description, color: getProjectColor(editing) }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
