'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import type { AdminConfig } from '@/lib/types'
import {
  Settings, DollarSign, Users, Package, Video,
  Save, RotateCcw, Check, ExternalLink, ShieldCheck,
  Printer, Store,
} from 'lucide-react'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'
import { GeneralTab } from './settings/GeneralTab'
import { FinanceTab } from './settings/FinanceTab'
import { CrmTab } from './settings/CrmTab'
import { InventoryTab } from './settings/InventoryTab'
import { ContentTab } from './settings/ContentTab'
import { ProductionTab } from './settings/ProductionTab'
import { StorefrontTab } from './settings/StorefrontTab'
import { IntegrationsTab } from './settings/IntegrationsTab'
import type { RemoteConfig } from './settings/types'

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

  async function persistGatewayCredentials() {
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
      await persistGatewayCredentials()
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
          <p className="text-[#ef4444] text-xs">{saveError}</p>
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

      {tab === 'general' && <GeneralTab draft={draft} setDraft={setDraft} projectsCount={projectsCount} ordersCount={ordersCount} transactionsCount={transactionsCount} />}
      {tab === 'finance' && <FinanceTab draft={draft} setDraft={setDraft} />}
      {tab === 'crm' && <CrmTab draft={draft} setDraft={setDraft} />}
      {tab === 'inventory' && <InventoryTab draft={draft} setDraft={setDraft} />}
      {tab === 'content' && <ContentTab draft={draft} setDraft={setDraft} />}
      {tab === 'production' && <ProductionTab draft={draft} setDraft={setDraft} />}
      {tab === 'storefront' && <StorefrontTab draft={draft} setDraft={setDraft} remoteConfigs={remoteConfigs} refreshRemoteConfigs={refreshRemoteConfigs} />}
      {tab === 'integrations' && <IntegrationsTab remoteConfigs={remoteConfigs} />}
    </div>
  )
}
