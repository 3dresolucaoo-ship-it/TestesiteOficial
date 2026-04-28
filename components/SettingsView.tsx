'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import type { AdminConfig } from '@/lib/types'
import type { CategoryEntry } from '@/core/admin/config'
import {
  Settings, DollarSign, Users, Package, Video,
  Plus, Trash2, Save, RotateCcw, Check, ExternalLink, ShieldCheck,
  Printer, Store, Eye, EyeOff,
} from 'lucide-react'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import * as InstagramAdapter from '@/core/integrations/instagramAdapter'
import * as YouTubeAdapter from '@/core/integrations/youtubeAdapter'
import * as BlingAdapter from '@/core/integrations/blingAdapter'

// ─── Shared micro-components ─────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
      <h3 className="text-[#ebebeb] font-medium text-sm">{title}</h3>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[#555555] text-xs font-medium uppercase tracking-wide mb-1.5">{children}</p>
}

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
    />
  )
}

function NumberInput({ value, onChange, min, max }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
    />
  )
}

function SecretInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 pr-10 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

// ─── Category list editor ─────────────────────────────────────────────────────
function CategoryListEditor({
  items,
  onChange,
  keyPrefix,
}: {
  items: CategoryEntry[]
  onChange: (items: CategoryEntry[]) => void
  keyPrefix: string
}) {
  const [newLabel, setNewLabel] = useState('')

  function add() {
    const label = newLabel.trim()
    if (!label) return
    const key = `${keyPrefix}_${label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`
    onChange([...items, { key, label }])
    setNewLabel('')
  }

  function remove(key: string) {
    onChange(items.filter(i => i.key !== key))
  }

  function updateLabel(key: string, label: string) {
    onChange(items.map(i => i.key === key ? { ...i, label } : i))
  }

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <input
            value={item.label}
            onChange={e => updateLabel(item.key, e.target.value)}
            className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
          />
          <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{item.key}</span>
          <button
            onClick={() => remove(item.key)}
            className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Nova categoria..."
          className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] border-dashed rounded-lg px-3 py-1.5 text-[#888888] text-sm outline-none focus:border-[#7c3aed] transition-colors placeholder:text-[#3a3a3a]"
        />
        <button
          onClick={add}
          className="p-1.5 text-[#555555] hover:text-[#a78bfa] hover:bg-[#7c3aed1a] rounded-lg transition-colors shrink-0"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
type SettingsTab = 'general' | 'finance' | 'crm' | 'inventory' | 'content' | 'production' | 'storefront' | 'integrations'

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
  { id: 'general',      label: 'Geral',         icon: Settings },
  { id: 'finance',      label: 'Finanças',       icon: DollarSign },
  { id: 'crm',          label: 'CRM',            icon: Users },
  { id: 'inventory',    label: 'Estoque',        icon: Package },
  { id: 'content',      label: 'Conteúdo',       icon: Video },
  { id: 'production',   label: 'Produção',       icon: Printer },
  { id: 'storefront',   label: 'Vitrine',        icon: Store },
  { id: 'integrations', label: 'Integrações',    icon: ExternalLink },
]

// ─── Settings view ────────────────────────────────────────────────────────────
export function SettingsView({
  initialConfig,
  projectsCount,
  ordersCount,
  transactionsCount,
}: {
  initialConfig:     AdminConfig
  projectsCount:     number
  ordersCount:       number
  transactionsCount: number
}) {
  const { dispatch } = useStore()
  const { role } = useAuth()
  const [tab, setTab] = useState<SettingsTab>('general')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [draft, setDraft] = useState<AdminConfig>(initialConfig)

  // ── Payment configs (DB-backed, separate from AdminConfig jsonb) ────────────
  type RemoteConfig = {
    id: string
    provider: 'mercadopago' | 'stripe' | 'infinitypay'
    accessToken: string   // masked from server
    publicKey?: string
    sandbox: boolean
    isActive: boolean
  }
  const [remoteConfigs, setRemoteConfigs] = useState<RemoteConfig[]>([])
  const mpRemote     = remoteConfigs.find(c => c.provider === 'mercadopago')
  const stripeRemote = remoteConfigs.find(c => c.provider === 'stripe')

  async function refreshRemoteConfigs() {
    try {
      const res  = await fetch('/api/payment-configs', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && Array.isArray(json.configs)) {
        setRemoteConfigs(json.configs)
      }
    } catch {
      // silent — UI degrades gracefully
    }
  }

  useEffect(() => { refreshRemoteConfigs() }, [])

  function updateFinance(patch: Partial<AdminConfig['finance']>) {
    setDraft(d => ({ ...d, finance: { ...d.finance, ...patch } }))
  }
  function updateCRM(patch: Partial<AdminConfig['crm']>) {
    setDraft(d => ({ ...d, crm: { ...d.crm, ...patch } }))
  }
  function updateInventory(patch: Partial<AdminConfig['inventory']>) {
    setDraft(d => ({ ...d, inventory: { ...d.inventory, ...patch } }))
  }
  function updateContent(patch: Partial<AdminConfig['content']>) {
    setDraft(d => ({ ...d, content: { ...d.content, ...patch } }))
  }
  function updateProduction(patch: Partial<AdminConfig['production']>) {
    setDraft(d => ({ ...d, production: { ...d.production, ...patch } }))
  }
  function updateStorefront(patch: Partial<AdminConfig['storefront']>) {
    setDraft(d => ({ ...d, storefront: { ...d.storefront, ...patch } }))
  }

  async function persistGatewayCredentials() {
    // Send Mercado Pago / Stripe creds to /api/payment-configs when filled.
    // Empty fields → skip. Already-masked values → skip (user didn't change).
    const sf = draft.storefront
    const tasks: Array<{ provider: 'mercadopago' | 'stripe'; token: string; pub?: string; existingId?: string }> = []

    if (sf.mpAccessToken && !sf.mpAccessToken.startsWith('****')) {
      tasks.push({
        provider:   'mercadopago',
        token:      sf.mpAccessToken,
        pub:        sf.mpPublicKey || undefined,
        existingId: mpRemote?.id,
      })
    }
    if (sf.stripeSecretKey && !sf.stripeSecretKey.startsWith('****')) {
      tasks.push({
        provider:   'stripe',
        token:      sf.stripeSecretKey,
        pub:        sf.stripePublicKey || undefined,
        existingId: stripeRemote?.id,
      })
    }

    for (const t of tasks) {
      const res = await fetch('/api/payment-configs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:          t.existingId,
          provider:    t.provider,
          accessToken: t.token,
          publicKey:   t.pub,
          sandbox:     false,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(`${t.provider}: ${err.error ?? res.statusText}`)
      }
    }

    // Activate the selected provider (if it now exists in DB)
    if (sf.paymentProvider !== 'none') {
      await refreshRemoteConfigs()
      const fresh = await (await fetch('/api/payment-configs', { cache: 'no-store' })).json()
      const target = (fresh.configs as RemoteConfig[]).find(c => c.provider === sf.paymentProvider)
      if (target && !target.isActive) {
        await fetch('/api/payment-configs', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id: target.id }),
        })
      }
    }
  }

  async function save() {
    setSaveError(null)
    try {
      // 1. Persist gateway credentials to payment_configs (server-side, masked)
      await persistGatewayCredentials()
      // 2. Strip raw secrets before saving the AdminConfig jsonb (jsonb is not the
      //    source of truth for gateway creds anymore — payment_configs is).
      const sanitized: AdminConfig = {
        ...draft,
        storefront: {
          ...draft.storefront,
          mpAccessToken:   '',
          stripeSecretKey: '',
        },
      }
      dispatch({ type: 'UPDATE_CONFIG', payload: sanitized })
      setDraft(sanitized)
      await refreshRemoteConfigs()

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  function reset() {
    setDraft(DEFAULT_ADMIN_CONFIG)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[#ebebeb] font-semibold text-lg">Configurações</h2>
            {role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]">
                <ShieldCheck size={10} /> Admin
              </span>
            )}
          </div>
          <p className="text-[#555555] text-sm">Personalize módulos, categorias e integrações</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-[#2a2a2a] text-[#888888] hover:text-[#ebebeb] hover:border-[#3a3a3a] text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={13} /> Restaurar
          </button>
          <button
            onClick={save}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              saved
                ? 'bg-[#10b9811a] text-[#10b981] border border-[#10b98133]'
                : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
            }`}
          >
            {saved ? <><Check size={13} /> Salvo!</> : <><Save size={13} /> Salvar</>}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="bg-[#ef444408] border border-[#ef444433] rounded-xl px-4 py-3">
          <p className="text-[#ef4444] text-xs">⚠️ {saveError}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              tab === t.id
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border-[#7c3aed33]'
                : 'text-[#888888] hover:text-[#ebebeb] border-transparent'
            }`}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── General ─────────────────────────────────────────────────────────── */}
      {tab === 'general' && (
        <div className="space-y-4">
          <SectionCard title="Informações do Sistema">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Nome da empresa</FieldLabel>
                <TextInput
                  value={draft.companyName}
                  onChange={v => setDraft(d => ({ ...d, companyName: v }))}
                  placeholder="Minha Empresa"
                />
              </div>
              <div>
                <FieldLabel>Fuso Horário</FieldLabel>
                <select
                  value={draft.timezone}
                  onChange={e => setDraft(d => ({ ...d, timezone: e.target.value }))}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
                >
                  <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                  <option value="America/Manaus">Manaus (UTC-4)</option>
                  <option value="America/Belem">Belém (UTC-3)</option>
                  <option value="America/Fortaleza">Fortaleza (UTC-3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Aparência">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>URL do Logo (opcional)</FieldLabel>
                <TextInput
                  value={draft.brand?.logoUrl ?? ''}
                  onChange={v => setDraft(d => ({ ...d, brand: { ...d.brand, logoUrl: v } }))}
                  placeholder="https://..."
                />
                <p className="text-[#3a3a3a] text-xs mt-1">Substitui o ícone no topo da barra lateral</p>
              </div>
              <div>
                <FieldLabel>Cor de Destaque</FieldLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.brand?.accentColor ?? '#3b82f6'}
                    onChange={e => setDraft(d => ({ ...d, brand: { ...d.brand, accentColor: e.target.value } }))}
                    className="w-10 h-9 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <TextInput
                    value={draft.brand?.accentColor ?? '#3b82f6'}
                    onChange={v => setDraft(d => ({ ...d, brand: { ...d.brand, accentColor: v } }))}
                    placeholder="#3b82f6"
                  />
                </div>
                <p className="text-[#3a3a3a] text-xs mt-1">Aplicado a botões, links e destaques</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Módulos Ativos">
            <p className="text-[#555555] text-xs -mt-2">Desative módulos que você não usa — eles somem da barra lateral.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {([
                ['finance',    'Finanças'],
                ['orders',     'Vendas'],
                ['crm',        'CRM'],
                ['products',   'Produtos'],
                ['inventory',  'Estoque'],
                ['production', 'Produção'],
                ['content',    'Conteúdo'],
                ['decisions',  'Decisões'],
                ['metrics',    'Métricas'],
              ] as const).map(([key, label]) => {
                const enabled = draft.modules?.[key] ?? true
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#1c1c1c] transition-colors">
                    <div
                      onClick={() =>
                        setDraft(d => ({
                          ...d,
                          modules: { ...d.modules, [key]: !enabled },
                        }))
                      }
                      className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                        enabled ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                        enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className="text-[#ebebeb] text-sm">{label}</span>
                  </label>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard title="Sobre o BVaz Hub">
            <div className="space-y-2 text-[#555555] text-sm">
              <p>Sistema Operacional v0.3 — construído para gerenciar múltiplos projetos com finanças, estoque, CRM e conteúdo integrados.</p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  ['Projetos', projectsCount],
                  ['Pedidos', ordersCount],
                  ['Transações', transactionsCount],
                ].map(([label, value]) => (
                  <div key={String(label)} className="bg-[#0f0f0f] rounded-lg p-3 text-center">
                    <p className="text-[#ebebeb] font-bold text-lg">{value}</p>
                    <p className="text-[#555555] text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Finance ─────────────────────────────────────────────────────────── */}
      {tab === 'finance' && (
        <div className="space-y-4">
          <SectionCard title="Categorias de Receita">
            <CategoryListEditor
              items={draft.finance.incomeCategories}
              onChange={v => updateFinance({ incomeCategories: v })}
              keyPrefix="income"
            />
          </SectionCard>
          <SectionCard title="Categorias de Despesa">
            <CategoryListEditor
              items={draft.finance.expenseCategories}
              onChange={v => updateFinance({ expenseCategories: v })}
              keyPrefix="expense"
            />
          </SectionCard>
          <SectionCard title="Metas e Alertas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Meta de margem de lucro (%)</FieldLabel>
                <NumberInput
                  value={draft.finance.profitMarginTarget}
                  onChange={v => updateFinance({ profitMarginTarget: v })}
                  min={0} max={100}
                />
                <p className="text-[#3a3a3a] text-xs mt-1">Projetos abaixo desta margem recebem alerta no dashboard</p>
              </div>
              <div>
                <FieldLabel>Moeda padrão</FieldLabel>
                <select
                  value={draft.finance.defaultCurrency}
                  onChange={e => updateFinance({ defaultCurrency: e.target.value as 'BRL' | 'USD' | 'EUR' })}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
                >
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── CRM ─────────────────────────────────────────────────────────────── */}
      {tab === 'crm' && (
        <div className="space-y-4">
          <SectionCard title="Estágios do Pipeline de Leads">
            <div className="space-y-1.5">
              {draft.crm.leadStages.map((stage, idx) => (
                <div key={stage.key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stage.color}
                    onChange={e => {
                      const stages = [...draft.crm.leadStages]
                      stages[idx] = { ...stage, color: e.target.value }
                      updateCRM({ leadStages: stages })
                    }}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    title="Cor do estágio"
                  />
                  <input
                    value={stage.label}
                    onChange={e => {
                      const stages = [...draft.crm.leadStages]
                      stages[idx] = { ...stage, label: e.target.value }
                      updateCRM({ leadStages: stages })
                    }}
                    className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
                  />
                  <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{stage.key}</span>
                  {draft.crm.leadStages.length > 2 && (
                    <button
                      onClick={() => updateCRM({ leadStages: draft.crm.leadStages.filter((_, i) => i !== idx) })}
                      className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Origens de Contato">
            <CategoryListEditor
              items={draft.crm.contactSources}
              onChange={v => updateCRM({ contactSources: v })}
              keyPrefix="source"
            />
          </SectionCard>
          <SectionCard title="Afiliados">
            <div>
              <FieldLabel>Comissão padrão (%)</FieldLabel>
              <div className="max-w-[160px]">
                <NumberInput
                  value={draft.crm.defaultCommissionRate}
                  onChange={v => updateCRM({ defaultCommissionRate: v })}
                  min={0} max={100}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Inventory ───────────────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <SectionCard title="Categorias de Estoque">
            <CategoryListEditor
              items={draft.inventory.categories}
              onChange={v => updateInventory({ categories: v })}
              keyPrefix="cat"
            />
          </SectionCard>
          <SectionCard title="Padrões">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FieldLabel>Unidade padrão</FieldLabel>
                <TextInput
                  value={draft.inventory.defaultUnit}
                  onChange={v => updateInventory({ defaultUnit: v })}
                  placeholder="un"
                />
              </div>
              <div>
                <FieldLabel>Estoque mínimo padrão</FieldLabel>
                <NumberInput
                  value={draft.inventory.defaultLowStockThreshold}
                  onChange={v => updateInventory({ defaultLowStockThreshold: v })}
                  min={0}
                />
              </div>
              <div>
                <FieldLabel>Markup padrão (%)</FieldLabel>
                <NumberInput
                  value={draft.inventory.markupDefault}
                  onChange={v => updateInventory({ markupDefault: v })}
                  min={0}
                />
                <p className="text-[#3a3a3a] text-xs mt-1">Aplicado ao sugerir preço de venda</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {tab === 'content' && (
        <div className="space-y-4">
          <SectionCard title="Plataformas">
            <div className="space-y-1.5">
              {draft.content.platforms.map((p, idx) => (
                <div key={p.key} className="flex items-center gap-2">
                  <input
                    value={p.label}
                    onChange={e => {
                      const platforms = [...draft.content.platforms]
                      platforms[idx] = { ...p, label: e.target.value }
                      updateContent({ platforms })
                    }}
                    className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#ebebeb] text-sm outline-none focus:border-[#7c3aed] transition-colors"
                  />
                  <span className="text-[#3a3a3a] text-xs font-mono shrink-0 hidden sm:block">{p.key}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Métricas de Engajamento">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => updateContent({ trackEngagement: !draft.content.trackEngagement })}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  draft.content.trackEngagement ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  draft.content.trackEngagement ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
              <div>
                <p className="text-[#ebebeb] text-sm">Rastrear engajamento (curtidas, comentários, shares, salvos)</p>
                <p className="text-[#555555] text-xs">Campos extras aparecem no formulário de conteúdo postado</p>
              </div>
            </label>
          </SectionCard>
        </div>
      )}

      {/* ── Production ──────────────────────────────────────────────────────── */}
      {tab === 'production' && (
        <div className="space-y-4">
          <SectionCard title="Tipos de Impressora">
            <p className="text-[#555555] text-xs -mt-2">Modelos de impressoras que você usa. Aparece no cadastro de tarefas de produção.</p>
            <CategoryListEditor
              items={draft.production.printerTypes}
              onChange={v => updateProduction({ printerTypes: v })}
              keyPrefix="printer"
            />
          </SectionCard>

          <SectionCard title="Tipos de Filamento">
            <p className="text-[#555555] text-xs -mt-2">Materiais disponíveis no seu estoque. Usado para calcular custos automaticamente.</p>
            <CategoryListEditor
              items={draft.production.filamentTypes}
              onChange={v => updateProduction({ filamentTypes: v })}
              keyPrefix="filament"
            />
          </SectionCard>

          <SectionCard title="Alertas de Estoque">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => updateProduction({ lowStockAlertEnabled: !draft.production.lowStockAlertEnabled })}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    draft.production.lowStockAlertEnabled ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    draft.production.lowStockAlertEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <div>
                  <p className="text-[#ebebeb] text-sm">Alertar quando filamento estiver baixo</p>
                  <p className="text-[#555555] text-xs">Exibe aviso no dashboard quando o estoque de filamento ficar abaixo do limite</p>
                </div>
              </label>
              {draft.production.lowStockAlertEnabled && (
                <div className="max-w-[200px]">
                  <FieldLabel>Limite mínimo (gramas)</FieldLabel>
                  <NumberInput
                    value={draft.production.lowStockGrams}
                    onChange={v => updateProduction({ lowStockGrams: v })}
                    min={0}
                  />
                  <p className="text-[#3a3a3a] text-xs mt-1">Alerta aparece abaixo desta quantidade</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Storefront (Vitrine) ──────────────────────────────────────────── */}
      {tab === 'storefront' && (
        <div className="space-y-4">
          <SectionCard title="Provider de Pagamento">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['none', 'mercadopago', 'stripe'] as const).map(p => {
                const labels = { none: 'Nenhum', mercadopago: 'Mercado Pago', stripe: 'Stripe' }
                const sel = draft.storefront.paymentProvider === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateStorefront({ paymentProvider: p })}
                    className="px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                    style={{
                      background:  sel ? '#7c3aed1a' : '#0f0f0f',
                      borderColor: sel ? '#7c3aed66' : '#2a2a2a',
                      color:       sel ? '#a78bfa'   : '#888888',
                    }}
                  >
                    {labels[p]}
                  </button>
                )
              })}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => updateStorefront({ checkoutEnabled: !draft.storefront.checkoutEnabled })}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  draft.storefront.checkoutEnabled ? 'bg-[#7c3aed]' : 'bg-[#2a2a2a]'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  draft.storefront.checkoutEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
              <div>
                <p className="text-[#ebebeb] text-sm">Habilitar checkout nos catálogos</p>
                <p className="text-[#555555] text-xs">Exibe o botão "Comprar" nos catálogos públicos</p>
              </div>
            </label>
          </SectionCard>

          {draft.storefront.paymentProvider === 'mercadopago' && (
            <SectionCard title="Mercado Pago">
              <div className="space-y-3">
                {/* Connection status (from payment_configs) */}
                <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${mpRemote?.isActive ? 'bg-[#10b981]' : mpRemote ? 'bg-[#f59e0b]' : 'bg-[#555555]'}`} />
                    <span className="text-[#ebebeb] text-xs font-medium">
                      {mpRemote?.isActive ? 'Conectado e ativo' : mpRemote ? 'Salvo, inativo' : 'Não conectado'}
                    </span>
                  </div>
                  {mpRemote && (
                    <span className="text-[#555555] text-xs font-mono">{mpRemote.accessToken}</span>
                  )}
                </div>

                <div>
                  <FieldLabel>Chave Pública (Public Key)</FieldLabel>
                  <TextInput
                    value={draft.storefront.mpPublicKey}
                    onChange={v => updateStorefront({ mpPublicKey: v })}
                    placeholder={mpRemote?.publicKey ?? 'APP_USR-...'}
                  />
                </div>
                <div>
                  <FieldLabel>Access Token</FieldLabel>
                  <SecretInput
                    value={draft.storefront.mpAccessToken}
                    onChange={v => updateStorefront({ mpAccessToken: v })}
                    placeholder={mpRemote ? mpRemote.accessToken + ' (deixe em branco para manter)' : 'APP_USR-... (token de produção)'}
                  />
                  <p className="text-[#3a3a3a] text-xs mt-1">
                    Token salvo de forma segura em <code className="text-[#a78bfa]">payment_configs</code> (RLS por usuário). Webhook: <code className="text-[#a78bfa]">/api/webhooks/payment?merchant={'<id>'}</code>
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {draft.storefront.paymentProvider === 'stripe' && (
            <SectionCard title="Stripe">
              <div className="space-y-3">
                <div>
                  <FieldLabel>Chave Pública (Publishable Key)</FieldLabel>
                  <TextInput
                    value={draft.storefront.stripePublicKey}
                    onChange={v => updateStorefront({ stripePublicKey: v })}
                    placeholder="pk_live_..."
                  />
                </div>
                <div>
                  <FieldLabel>Chave Secreta (Secret Key)</FieldLabel>
                  <SecretInput
                    value={draft.storefront.stripeSecretKey}
                    onChange={v => updateStorefront({ stripeSecretKey: v })}
                    placeholder="sk_live_..."
                  />
                  <p className="text-[#3a3a3a] text-xs mt-1">
                    ⚠️ Armazenado no banco. Prefira usar variável de ambiente <code className="text-[#a78bfa]">STRIPE_SECRET_KEY</code> em produção.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard title="WhatsApp Padrão">
            <FieldLabel>Número padrão para catálogos (com DDI)</FieldLabel>
            <TextInput
              value={draft.storefront.defaultWhatsapp}
              onChange={v => updateStorefront({ defaultWhatsapp: v })}
              placeholder="5511999999999"
            />
            <p className="text-[#3a3a3a] text-xs mt-1">
              Usado quando o catálogo não tem WhatsApp próprio configurado.
            </p>
          </SectionCard>
        </div>
      )}

      {/* ── Integrations ────────────────────────────────────────────────────── */}
      {tab === 'integrations' && (
        <div className="space-y-4">
          {[
            {
              name: 'Instagram',
              description: 'Sincronize métricas de posts automaticamente via Meta Graph API.',
              status: InstagramAdapter.isConfigured() ? 'configured' : 'not_configured',
              color: '#f59e0b',
              docs: 'https://developers.facebook.com/docs/instagram-api',
            },
            {
              name: 'YouTube',
              description: 'Importe visualizações, likes e comentários via YouTube Data API v3.',
              status: YouTubeAdapter.isConfigured() ? 'configured' : 'not_configured',
              color: '#ef4444',
              docs: 'https://developers.google.com/youtube/v3',
            },
            {
              name: 'Bling ERP',
              description: 'Sincronize pedidos, produtos e estoque com o Bling via API v3.',
              status: BlingAdapter.isConfigured() ? 'configured' : 'not_configured',
              color: '#3b82f6',
              docs: 'https://developer.bling.com.br/referencia',
            },
            {
              name: 'Mercado Pago',
              description: mpRemote?.isActive
                ? `Ativo • ${mpRemote.accessToken} • PIX, cartão e boleto.`
                : 'Receba pagamentos via PIX, cartão e boleto. Configure as chaves na aba Vitrine.',
              status: mpRemote?.isActive ? 'configured' : mpRemote ? 'inactive' : 'not_configured',
              color: '#00b1ea',
              docs: 'https://www.mercadopago.com.br/developers/pt/docs',
            },
            {
              name: 'NFSe',
              description: 'Emissão automática de Nota Fiscal de Serviço Eletrônica ao concluir pedidos.',
              status: 'not_configured' as const,
              color: '#10b981',
              docs: 'https://www.nfse.gov.br/',
            },
          ].map(integration => (
            <div key={integration.name} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: integration.color + '22', color: integration.color }}
              >
                {integration.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[#ebebeb] font-medium text-sm">{integration.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${
                    integration.status === 'configured'
                      ? 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]'
                      : integration.status === 'inactive'
                      ? 'text-[#f59e0b] bg-[#f59e0b1a] border-[#f59e0b33]'
                      : 'text-[#555555] bg-[#1c1c1c] border-[#2a2a2a]'
                  }`}>
                    {integration.status === 'configured' ? 'Conectado' : integration.status === 'inactive' ? 'Inativo' : 'Em breve'}
                  </span>
                </div>
                <p className="text-[#555555] text-xs">{integration.description}</p>
              </div>
              <a
                href={integration.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#7c3aed] hover:text-[#a78bfa] text-xs transition-colors shrink-0"
              >
                <ExternalLink size={12} /> Docs
              </a>
            </div>
          ))}

          <div className="bg-[#f59e0b08] border border-[#f59e0b22] rounded-xl px-4 py-3">
            <p className="text-[#f59e0b] text-sm font-medium mb-0.5">Como configurar integrações</p>
            <p className="text-[#888888] text-xs">
              <strong className="text-[#aaaaaa]">Mercado Pago:</strong> configure as chaves na aba <strong className="text-[#a78bfa]">Vitrine</strong> acima.{' '}
              <strong className="text-[#aaaaaa]">Instagram / YouTube / Bling:</strong> configure via código nos adapters em{' '}
              <code className="text-[#a78bfa]">core/integrations/</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
