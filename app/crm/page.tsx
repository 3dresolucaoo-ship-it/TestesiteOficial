'use client'

/**
 * app/crm/page.tsx — Modulo CRM V4
 *
 * Migrado para ModuleShell em 2026-05-20 (pattern de /orders).
 * Funcionalidade 100% preservada: kanban, lista, clientes derivados, CRUD de leads.
 *
 * Estrutura:
 *   ModuleShell (PageHeader + KpiRow + FilterBar)
 *     children:
 *       - ProjectFilter (select de projeto)
 *       - LeadKanbanBoard  (tab pipeline, view kanban)
 *       - LeadListView     (tab pipeline, view lista — inline, pequeno)
 *       - CustomerList     (tab clients)
 *       - CrmEmptyState    (quando vazio)
 *   Modal Novo Lead
 *   Modal Editar Lead
 *
 * Convencoes: zero em-dash, PT-BR em UI, TypeScript estrito, zero any.
 */

import { useState, useMemo, useCallback, useTransition } from 'react'
import { useStore, useStoreModule, uid }  from '@/lib/store'
// Server Actions pro golden path (fix auth client travando em prod, 01/06/2026).
// Workflow G7 wv1c1yo49 cravou essa rota como Plano A pre soft launch 13/06.
import { createLead, convertLeadToOrder } from './actions'
import type { Lead, LeadStatus, Order }   from '@/lib/types'
import CrmLoading                         from './loading'
import { LEAD_STATUS_LABELS, CONTACT_SOURCE_LABELS } from '@/lib/types'
import { Plus, Pencil, Trash2, ShoppingCart, CheckCircle } from 'lucide-react'
import { Modal }                          from '@/components/Modal'
import { ModuleShell, V4ThemeProvider }   from '@/components/dashboard/v4'

import '../globals-v4.css'

import { LeadForm }              from './_components/LeadForm'
import { LeadKanbanBoard }       from './_components/LeadKanbanBoard'
import { CustomerList }          from './_components/CustomerList'
import { CrmEmptyState }         from './_components/CrmEmptyState'
import { fmtBRL }                from './_components/helpers'
import type { LeadFormData }     from './_components/helpers'
import type { DerivedClient }    from './_components/CustomerRow'
import { STATUS_BADGE_CLASS }    from './_components/helpers'
import { ConvertToOrderModal }   from './_components/ConvertToOrderModal'
import type { ConvertFormData }  from './_components/ConvertToOrderModal'
import { leadsService }          from '@/services/leads'

// ---------------------------------------------------------------------------
// Tipo de tab
// ---------------------------------------------------------------------------

type CrmTab = 'pipeline' | 'clients'

// ---------------------------------------------------------------------------
// Helper: deriveClients (puro TS — sem side-effects)
// ---------------------------------------------------------------------------

function deriveClients(orders: Order[], leads: Lead[]): DerivedClient[] {
  const map = new Map<string, DerivedClient>()

  for (const o of orders) {
    if (o.status !== 'delivered' && o.status !== 'paid') continue
    const key  = `${o.projectId}::${o.clientName.trim().toLowerCase()}`
    const prev = map.get(key)
    if (prev) {
      prev.total   += o.value
      prev.orders  += 1
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

// ---------------------------------------------------------------------------
// Sub-componente inline: filtro de projeto
// ---------------------------------------------------------------------------

interface ProjectFilterProps {
  projects: { id: string; name: string }[]
  value:    string
  onChange: (v: string) => void
}

function ProjectFilter({ projects, value, onChange }: ProjectFilterProps) {
  if (projects.length <= 1) return null
  return (
    <div className="mb-4">
      <label htmlFor="crm-project-filter" className="sr-only">
        Filtrar por projeto
      </label>
      <select
        id="crm-project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[hsl(173_58%_35%)] transition-colors"
        aria-label="Filtrar leads por projeto"
      >
        <option value="all">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente inline: view lista (tabela simples de leads)
// ---------------------------------------------------------------------------

interface LeadListViewProps {
  leads:       Lead[]
  projectName: (id: string) => string
  onEdit:      (l: Lead) => void
  onDelete:    (id: string) => void
  onAdvance:   (l: Lead) => void
  onConvert:   (l: Lead) => void
}

const ADVANCE_ORDER: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']

function LeadListView({ leads, projectName, onEdit, onDelete, onAdvance, onConvert }: LeadListViewProps) {
  return (
    <div className="space-y-2">
      {leads.map((l) => (
        <div
          key={l.id}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 hover:border-[#3a3a3a] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_BADGE_CLASS[l.status]}`}
              >
                {LEAD_STATUS_LABELS[l.status]}
              </span>
              <span className="text-[#555555] text-xs">{CONTACT_SOURCE_LABELS[l.source]}</span>
              <span className="text-[#3a3a3a] text-xs">· {projectName(l.projectId)}</span>
              {l.value > 0 && (
                <span className="text-[#10b981] text-xs font-medium">{fmtBRL(l.value)}</span>
              )}
            </div>
            <p className="text-[#ebebeb] text-sm font-medium">{l.name}</p>
            {l.contact && <p className="text-[#555555] text-xs">{l.contact}</p>}
            {l.notes && <p className="text-[#888888] text-xs mt-1">{l.notes}</p>}
            {/* Badge de convertido */}
            {l.convertedOrderId && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={10} className="text-[#10b981]" aria-hidden="true" />
                <span className="text-[#10b981] text-[10px] font-medium">Pedido criado</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Botao converter (so quando nao convertido) */}
            {!l.convertedOrderId && (
              <button
                type="button"
                onClick={() => onConvert(l)}
                className="flex items-center gap-1 text-xs text-[hsl(173_58%_45%)] hover:text-[hsl(173_58%_60%)] px-2 py-1 rounded-lg hover:bg-[hsl(173_58%_28%_/_0.12)] transition-colors"
                aria-label={`Converter lead ${l.name} em pedido`}
              >
                <ShoppingCart size={11} aria-hidden="true" />
                Pedido
              </button>
            )}
            {l.status !== 'won' && l.status !== 'lost' && ADVANCE_ORDER.includes(l.status) && (
              <button
                type="button"
                onClick={() => onAdvance(l)}
                className="text-xs text-[#7c3aed] hover:text-[#a78bfa] px-2 py-1 rounded-lg hover:bg-[#7c3aed1a] transition-colors"
                aria-label={`Avancar lead ${l.name}`}
              >
                Avancar →
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(l)}
              className="p-1 text-[#555555] hover:text-[#ebebeb] transition-colors"
              aria-label={`Editar lead ${l.name}`}
            >
              <Pencil size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(l.id)}
              className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors"
              aria-label={`Excluir lead ${l.name}`}
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principal
// ---------------------------------------------------------------------------

export default function GlobalCrmPage() {
  // rawDispatch = reducer-only, SEM Supabase sync. Usado apos Server Actions
  // ja terem persistido no DB (caso contrario dispatch normal dispararia
  // syncAction -> leadsService.create() -> requireUserId() que trava em prod).
  const { state, dispatch, rawDispatch } = useStore()
  const [, startTransition] = useTransition()
  // P2.2 — lazy load dos modulos leads + orders (CRM usa ambos).
  // isLoading true enquanto qualquer um dos dois ainda nao carregou.
  const { isLoading: leadsLoading }  = useStoreModule('leads')
  const { isLoading: ordersLoading } = useStoreModule('orders')
  const crmLoading = leadsLoading || ordersLoading

  // Estado de UI
  const [activeTab,     setActiveTab]     = useState<CrmTab>('pipeline')
  const [view,          setView]          = useState<'kanban' | 'list'>('kanban')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [searchQuery,   setSearchQuery]   = useState<string>('')
  const [creating,       setCreating]      = useState(false)
  const [editing,        setEditing]       = useState<Lead | null>(null)
  const [converting,     setConverting]    = useState<Lead | null>(null)
  const [convertLoading, setConvertLoading] = useState(false)

  // ---------------------------------------------------------------------------
  // Derivacoes
  // ---------------------------------------------------------------------------

  const byProject = useMemo(
    () =>
      filterProject === 'all'
        ? state.leads
        : state.leads.filter((l) => l.projectId === filterProject),
    [state.leads, filterProject],
  )

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return byProject
    const q = searchQuery.toLowerCase()
    return byProject.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.contact.toLowerCase().includes(q),
    )
  }, [byProject, searchQuery])

  const sortedLeads = useMemo(
    () => [...filteredLeads].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredLeads],
  )

  const clients = useMemo(() => {
    const orders =
      filterProject === 'all'
        ? state.orders
        : state.orders.filter((o) => o.projectId === filterProject)
    return deriveClients(orders, byProject)
  }, [state.orders, byProject, filterProject])

  // ---------------------------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------------------------

  /** Leads ativos no pipeline (excluindo ganhos e perdidos). */
  const activeLeads = byProject.filter(
    (l) => l.status !== 'won' && l.status !== 'lost',
  )

  /** Conversao: leads ganhos / total de leads (%). */
  const wonLeads    = byProject.filter((l) => l.status === 'won')
  const convRate    = byProject.length > 0
    ? Math.round((wonLeads.length / byProject.length) * 100)
    : 0

  /** Ticket medio dos clientes (LTV proxy). */
  const avgTicket   = clients.length > 0
    ? clients.reduce((s, c) => s + c.total, 0) / clients.length
    : 0

  /** Leads cold: sem atividade ha 14d+ (usa campo `date` como proxy). */
  const cutoff      = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  const coldLeads   = activeLeads.filter(
    (l) => new Date(l.date) < cutoff,
  ).length

  // Eyebrow
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()

  // ---------------------------------------------------------------------------
  // Tabs para ModuleShell FilterBar
  // ---------------------------------------------------------------------------

  const tabs = useMemo(
    () => [
      { id: 'pipeline', label: 'Pipeline', count: byProject.length, active: activeTab === 'pipeline' },
      { id: 'clients',  label: 'Clientes', count: clients.length,   active: activeTab === 'clients'  },
    ],
    [byProject.length, clients.length, activeTab],
  )

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const projectName = useCallback(
    (id: string) => state.projects.find((p) => p.id === id)?.name ?? 'Projeto',
    [state.projects],
  )

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as CrmTab)
  }, [])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
  }, [])

  const handleAdvance = useCallback(
    (l: Lead) => {
      const order: LeadStatus[] = ['new', 'contacted', 'negotiating', 'won']
      const i = order.indexOf(l.status)
      if (i >= 0 && i < order.length - 1) {
        dispatch({ type: 'UPDATE_LEAD', payload: { ...l, status: order[i + 1] } })
      }
    },
    [dispatch],
  )

  const handleCreate = useCallback(
    (d: LeadFormData) => {
      // Server Action (cookie-based auth, funciona em prod).
      // Apos persistir, rawDispatch atualiza store local SEM disparar
      // syncAction (que tem o bug do auth client travado).
      const leadId = uid()
      const leadPayload = {
        id:        leadId,
        projectId: d.projectId,
        name:      d.name,
        contact:   d.contact,
        source:    d.source,
        status:    d.status,
        value:     parseFloat(d.value) || 0,
        notes:     d.notes,
        date:      d.date,
      }

      startTransition(async () => {
        const result = await createLead(leadPayload)
        if (!result.success) {
          console.error('[CRM] createLead Server Action falhou:', result.error)
          // TODO: substituir por toast quando tivermos sistema de notificacao
          alert('Erro ao criar lead: ' + result.error)
          return
        }
        // Update store local SEM sync DB (DB ja foi escrito pelo Server Action)
        rawDispatch({ type: 'ADD_LEAD', payload: result.lead })
        setCreating(false)
      })
    },
    [rawDispatch],
  )

  const handleEdit = useCallback(
    (d: LeadFormData) => {
      if (!editing) return
      dispatch({
        type: 'UPDATE_LEAD',
        payload: {
          ...editing,
          projectId: d.projectId,
          name:      d.name,
          contact:   d.contact,
          source:    d.source,
          status:    d.status,
          value:     parseFloat(d.value) || 0,
          notes:     d.notes,
          date:      d.date,
        },
      })
      setEditing(null)
    },
    [editing, dispatch],
  )

  const handleDelete = useCallback(
    (id: string) => dispatch({ type: 'DELETE_LEAD', payload: id }),
    [dispatch],
  )

  /**
   * Handler de conversao lead → pedido.
   * Chama leadsService.convertToOrder (atomico) e sincroniza o store local:
   *  - ADD_ORDER  → pedido novo aparece em /orders
   *  - UPDATE_LEAD → lead recebe convertedOrderId + status 'won'
   */
  const handleConvertSubmit = useCallback(
    async (d: ConvertFormData) => {
      if (!converting) return
      setConvertLoading(true)
      try {
        // Server Action pro golden path (cookie-based, funciona em prod).
        // rawDispatch atualiza store local SEM disparar syncAction bugado.
        const orderId = uid()
        const result = await convertLeadToOrder({
          leadId:    converting.id,
          projectId: converting.projectId,
          orderId,
          item:      d.item,
          value:     parseFloat(d.value) || 0,
          status:    d.status,
          date:      d.date,
        })

        if (!result.success) {
          console.error('[CRM] convertLeadToOrder Server Action falhou:', result.error)
          alert('Erro ao converter lead em pedido: ' + result.error)
          return
        }

        if (!result.alreadyConverted) {
          // Update store local SEM sync DB (DB ja foi escrito pelo Server Action)
          rawDispatch({ type: 'ADD_ORDER', payload: result.order })
          rawDispatch({
            type: 'UPDATE_LEAD',
            payload: {
              ...converting,
              status:           'won',
              convertedOrderId: result.order.id,
            },
          })
        }
        setConverting(null)
      } catch (err) {
        console.error('[CRM] convertLeadToOrder erro inesperado', err)
        alert('Erro inesperado ao converter lead.')
      } finally {
        setConvertLoading(false)
      }
    },
    [converting, rawDispatch],
  )

  // ---------------------------------------------------------------------------
  // Guard de loading (P2.2)
  // Exibe skeleton V4 enquanto leads + orders carregam lazy.
  // ---------------------------------------------------------------------------

  if (crmLoading) return <CrmLoading />

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <V4ThemeProvider />
      <ModuleShell
        eyebrow={`${mesAtual} · ${activeLeads.length} NO PIPELINE · ${clients.length} CLIENTES`}
        title="CRM"
        titleItalicSuffix="seu funil"
        livePhrase={
          byProject.length === 0
            ? 'Nenhum lead ainda. Registre o primeiro contato.'
            : `${byProject.length} ${byProject.length === 1 ? 'lead registrado' : 'leads registrados'}, ${wonLeads.length} ${wonLeads.length === 1 ? 'convertido' : 'convertidos'}.`
        }
        primaryAction={{
          label:   'Novo Lead',
          onClick: () => setCreating(true),
          icon:    <Plus size={15} aria-hidden="true" />,
        }}
        heroKpi={{
          label:       'LEADS ATIVOS (PIPELINE)',
          value:       String(activeLeads.length),
          description: `${byProject.filter((l) => l.status === 'new').length} novos, ${byProject.filter((l) => l.status === 'negotiating').length} em negociacao.`,
        }}
        satelliteKpis={[
          {
            label:       'CONVERSAO',
            value:       byProject.length > 0 ? `${convRate}%` : 'sem dados',
            description: `${wonLeads.length} de ${byProject.length} leads ganhos.`,
            tone:        convRate >= 30 ? 'petrol' : convRate > 0 ? 'neutral' : 'neutral',
          },
          {
            label:       'TICKET MEDIO',
            value:       clients.length > 0 ? fmtBRL(avgTicket) : 'sem dados',
            description: 'media dos clientes ativos.',
            tone:        'neutral',
          },
          {
            label:     'LEADS FRIOS',
            value:     String(coldLeads),
            alertText: coldLeads > 0 ? 'sem contato ha 14d+' : undefined,
            tone:      coldLeads > 0 ? 'ember' : 'neutral',
          },
        ]}
        tabs={tabs}
        onTabChange={handleTabChange}
        searchPlaceholder="Buscar lead, contato..."
        onSearch={handleSearch}
      >
        {/* Filtro de projeto */}
        <ProjectFilter
          projects={state.projects}
          value={filterProject}
          onChange={setFilterProject}
        />

        {/* Tab: pipeline */}
        {activeTab === 'pipeline' && (
          <>
            {/* Toggle kanban / lista */}
            <div className="flex items-center justify-end mb-3">
              <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setView('kanban')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${view === 'kanban' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                  aria-pressed={view === 'kanban'}
                >
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${view === 'list' ? 'bg-[#2a2a2a] text-[#ebebeb]' : 'text-[#555555] hover:text-[#ebebeb]'}`}
                  aria-pressed={view === 'list'}
                >
                  Lista
                </button>
              </div>
            </div>

            {sortedLeads.length === 0 ? (
              <CrmEmptyState tab="pipeline" onCreateLead={() => setCreating(true)} />
            ) : view === 'kanban' ? (
              <LeadKanbanBoard
                leads={filteredLeads}
                projectName={projectName}
                onEdit={setEditing}
                onDelete={handleDelete}
                onAdvance={handleAdvance}
                onConvert={setConverting}
              />
            ) : (
              <LeadListView
                leads={sortedLeads}
                projectName={projectName}
                onEdit={setEditing}
                onDelete={handleDelete}
                onAdvance={handleAdvance}
                onConvert={setConverting}
              />
            )}
          </>
        )}

        {/* Tab: clients */}
        {activeTab === 'clients' && (
          clients.length === 0 ? (
            <CrmEmptyState tab="clients" />
          ) : (
            <CustomerList
              clients={clients}
              projectName={projectName}
            />
          )
        )}
      </ModuleShell>

      {/* Modal: novo lead */}
      {creating && (
        <Modal title="Novo Lead" onClose={() => setCreating(false)}>
          <LeadForm
            projects={state.projects}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {/* Modal: editar lead */}
      {editing && (
        <Modal title="Editar Lead" onClose={() => setEditing(null)}>
          <LeadForm
            projects={state.projects}
            initial={{
              projectId: editing.projectId,
              name:      editing.name,
              contact:   editing.contact,
              source:    editing.source,
              status:    editing.status,
              value:     String(editing.value),
              notes:     editing.notes,
              date:      editing.date,
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Modal: converter lead em pedido */}
      {converting && (
        <Modal
          title="Converter em Pedido"
          onClose={() => !convertLoading && setConverting(null)}
        >
          <ConvertToOrderModal
            lead={converting}
            onSave={handleConvertSubmit}
            onClose={() => setConverting(null)}
            loading={convertLoading}
          />
        </Modal>
      )}
    </>
  )
}
