'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { SectionCard, FieldLabel, TextInput, SecretInput } from './shared'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps, RemoteConfig } from './types'

interface Props extends SettingsTabProps {
  remoteConfigs: RemoteConfig[]
  refreshRemoteConfigs: () => Promise<void>
}

type FeedbackKind = 'idle' | 'saving' | 'success' | 'error'
interface Feedback { kind: FeedbackKind; msg?: string }

export function StorefrontTab({ draft, setDraft, remoteConfigs, refreshRemoteConfigs }: Props) {
  const mpRemote     = remoteConfigs.find(c => c.provider === 'mercadopago')
  const stripeRemote = remoteConfigs.find(c => c.provider === 'stripe')

  const [mpManual, setMpManual] = useState(false)

  // ── Stripe local form state (only used until first save) ────────────────────
  const [stripeForm, setStripeForm] = useState({
    publicKey:     '',
    secretKey:     '',
    webhookSecret: '',
    sandbox:       true,
  })
  const [stripeFb, setStripeFb] = useState<Feedback>({ kind: 'idle' })

  function updateStorefront(patch: Partial<AdminConfig['storefront']>) {
    setDraft(d => ({ ...d, storefront: { ...d.storefront, ...patch } }))
  }

  async function saveStripe() {
    if (stripeForm.secretKey.trim().length < 8) {
      setStripeFb({ kind: 'error', msg: 'Secret Key inválida (mín. 8 caracteres).' })
      return
    }
    setStripeFb({ kind: 'saving' })
    try {
      const res = await fetch('/api/payment-configs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:            stripeRemote?.id,
          provider:      'stripe',
          accessToken:   stripeForm.secretKey.trim(),
          publicKey:     stripeForm.publicKey.trim()     || undefined,
          webhookSecret: stripeForm.webhookSecret.trim() || undefined,
          sandbox:       stripeForm.sandbox,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha ao salvar')

      setStripeForm({ publicKey: '', secretKey: '', webhookSecret: '', sandbox: true })
      setStripeFb({ kind: 'success', msg: 'Stripe salvo. Clique em Ativar pra usar como provider.' })
      await refreshRemoteConfigs()
    } catch (e) {
      setStripeFb({ kind: 'error', msg: e instanceof Error ? e.message : 'Erro desconhecido' })
    }
  }

  async function activateProvider(configId: string) {
    setStripeFb({ kind: 'saving' })
    try {
      const res = await fetch('/api/payment-configs', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: configId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha ao ativar')
      setStripeFb({ kind: 'success', msg: 'Provider ativado.' })
      await refreshRemoteConfigs()
    } catch (e) {
      setStripeFb({ kind: 'error', msg: e instanceof Error ? e.message : 'Erro desconhecido' })
    }
  }

  async function disconnectStripe() {
    if (!stripeRemote) return
    if (!confirm('Tem certeza que quer desconectar o Stripe? Pagamentos via Stripe vão parar.')) return
    setStripeFb({ kind: 'saving' })
    try {
      const res = await fetch(`/api/payment-configs?id=${stripeRemote.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? 'Falha ao desconectar')
      }
      setStripeFb({ kind: 'idle' })
      await refreshRemoteConfigs()
    } catch (e) {
      setStripeFb({ kind: 'error', msg: e instanceof Error ? e.message : 'Erro desconhecido' })
    }
  }

  return (
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
            <p className="text-[#555555] text-xs">Exibe o botão &quot;Comprar&quot; nos catálogos públicos</p>
          </div>
        </label>
      </SectionCard>

      {draft.storefront.paymentProvider === 'mercadopago' && (
        <SectionCard title="Mercado Pago">
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mpRemote?.isActive ? 'bg-[#10b981]' : mpRemote ? 'bg-[#f59e0b]' : 'bg-[#555555]'}`} />
                <span className="text-[#ebebeb] text-xs font-medium">
                  {mpRemote?.isActive
                    ? mpRemote.hasRefreshToken
                      ? `Conectado via OAuth${mpRemote.mpUserId ? ` · conta ${mpRemote.mpUserId}` : ''}`
                      : 'Conectado e ativo'
                    : mpRemote ? 'Salvo, inativo' : 'Não conectado'}
                </span>
              </div>
              {mpRemote && (
                <span className="text-[#555555] text-xs font-mono">{mpRemote.accessToken}</span>
              )}
            </div>

            {!mpRemote ? (
              <a
                href="/api/integrations/mercadopago/connect"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#009ee3] hover:bg-[#007ec1] text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
                Conectar com Mercado Pago
              </a>
            ) : (
              <div className="flex gap-2">
                {!mpRemote.isActive && (
                  <button
                    type="button"
                    onClick={() => activateProvider(mpRemote.id)}
                    className="flex-1 py-2 px-4 rounded-lg bg-[#7c3aed] hover:bg-[#8b5cf6] text-white text-xs font-medium transition-colors"
                  >
                    Ativar como provider principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!mpRemote) return
                    if (!confirm('Desconectar o Mercado Pago?')) return
                    await fetch(`/api/payment-configs?id=${mpRemote.id}`, { method: 'DELETE' })
                    await refreshRemoteConfigs()
                  }}
                  className="flex-1 py-2 px-4 rounded-lg border border-[#2a2a2a] hover:border-[#ef4444] text-[#888] hover:text-[#ef4444] text-xs font-medium transition-colors"
                >
                  Desconectar
                </button>
              </div>
            )}

            <p className="text-[#3a3a3a] text-xs">
              Webhook: <code className="text-[#a78bfa]">/api/webhooks/payment?merchant={'<seu-user-id>'}</code>
            </p>

            <button
              type="button"
              onClick={() => setMpManual(v => !v)}
              className="text-[#555] hover:text-[#888] text-xs underline-offset-2 hover:underline transition-colors"
            >
              {mpManual ? 'Ocultar campos manuais' : 'Inserir token manualmente'}
            </button>

            {mpManual && (
              <div className="space-y-3 pt-1 border-t border-[#1a1a1a]">
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
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {draft.storefront.paymentProvider === 'stripe' && (
        <SectionCard title="Stripe">
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  stripeRemote?.isActive ? 'bg-[#10b981]'
                  : stripeRemote ? 'bg-[#f59e0b]'
                  : 'bg-[#555555]'
                }`} />
                <span className="text-[#ebebeb] text-xs font-medium">
                  {stripeRemote?.isActive
                    ? `Conectado e ativo${stripeRemote.sandbox ? ' · Test mode' : ''}`
                    : stripeRemote ? `Salvo, inativo${stripeRemote.sandbox ? ' · Test mode' : ''}` : 'Não conectado'}
                </span>
              </div>
              {stripeRemote && (
                <span className="text-[#555555] text-xs font-mono">{stripeRemote.accessToken}</span>
              )}
            </div>

            {/* Form de credenciais */}
            {!stripeRemote && (
              <div className="space-y-3 pt-1 border-t border-[#1a1a1a]">
                <div>
                  <FieldLabel>Publishable Key</FieldLabel>
                  <TextInput
                    value={stripeForm.publicKey}
                    onChange={v => setStripeForm(f => ({ ...f, publicKey: v }))}
                    placeholder={stripeForm.sandbox ? 'pk_test_...' : 'pk_live_...'}
                  />
                </div>
                <div>
                  <FieldLabel>Secret Key</FieldLabel>
                  <SecretInput
                    value={stripeForm.secretKey}
                    onChange={v => setStripeForm(f => ({ ...f, secretKey: v }))}
                    placeholder={stripeForm.sandbox ? 'sk_test_...' : 'sk_live_...'}
                  />
                  <p className="text-[#3a3a3a] text-xs mt-1">
                    Encontre em <code className="text-[#a78bfa]">dashboard.stripe.com/apikeys</code>. Armazenada criptografada.
                  </p>
                </div>
                <div>
                  <FieldLabel>Webhook Secret (opcional)</FieldLabel>
                  <SecretInput
                    value={stripeForm.webhookSecret}
                    onChange={v => setStripeForm(f => ({ ...f, webhookSecret: v }))}
                    placeholder="whsec_..."
                  />
                  <p className="text-[#3a3a3a] text-xs mt-1">
                    Configure o endpoint <code className="text-[#a78bfa]">/api/webhooks/payment?merchant={'<seu-user-id>'}</code> no painel Stripe e cole o signing secret aqui.
                  </p>
                </div>

                {/* Toggle sandbox */}
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <div
                    onClick={() => setStripeForm(f => ({ ...f, sandbox: !f.sandbox }))}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      stripeForm.sandbox ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      stripeForm.sandbox ? 'translate-x-0.5' : 'translate-x-4'
                    }`} />
                  </div>
                  <div>
                    <p className="text-[#ebebeb] text-sm">
                      {stripeForm.sandbox ? 'Modo Teste (sk_test_)' : 'Modo Produção (sk_live_)'}
                    </p>
                    <p className="text-[#555555] text-xs">
                      {stripeForm.sandbox
                        ? 'Use cartões de teste do Stripe. Nenhum valor real cobrado.'
                        : 'Cobranças reais. Garanta que sua conta Stripe está aprovada.'}
                    </p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={saveStripe}
                  disabled={stripeFb.kind === 'saving' || stripeForm.secretKey.trim().length < 8}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#635bff] hover:bg-[#7a73ff] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white text-sm font-medium transition-colors"
                >
                  {stripeFb.kind === 'saving' ? <Loader2 size={14} className="animate-spin" /> : null}
                  {stripeFb.kind === 'saving' ? 'Salvando...' : 'Salvar credenciais Stripe'}
                </button>
              </div>
            )}

            {/* Ações quando já tem config salva */}
            {stripeRemote && (
              <div className="flex gap-2">
                {!stripeRemote.isActive && (
                  <button
                    type="button"
                    onClick={() => activateProvider(stripeRemote.id)}
                    disabled={stripeFb.kind === 'saving'}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#635bff] hover:bg-[#7a73ff] disabled:opacity-50 text-white text-xs font-medium transition-colors"
                  >
                    {stripeFb.kind === 'saving' ? <Loader2 size={12} className="animate-spin" /> : null}
                    Ativar como provider principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={disconnectStripe}
                  disabled={stripeFb.kind === 'saving'}
                  className="flex-1 py-2 px-4 rounded-lg border border-[#2a2a2a] hover:border-[#ef4444] text-[#888] hover:text-[#ef4444] disabled:opacity-50 text-xs font-medium transition-colors"
                >
                  Desconectar Stripe
                </button>
              </div>
            )}

            {/* Feedback */}
            {stripeFb.kind === 'success' && stripeFb.msg && (
              <div className="flex items-start gap-2 bg-[#10b9810f] border border-[#10b98133] rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-[#10b981] mt-0.5 shrink-0" />
                <p className="text-[#10b981] text-xs">{stripeFb.msg}</p>
              </div>
            )}
            {stripeFb.kind === 'error' && stripeFb.msg && (
              <div className="flex items-start gap-2 bg-[#ef44440f] border border-[#ef444433] rounded-lg px-3 py-2">
                <AlertCircle size={14} className="text-[#ef4444] mt-0.5 shrink-0" />
                <p className="text-[#ef4444] text-xs">{stripeFb.msg}</p>
              </div>
            )}

            <p className="text-[#3a3a3a] text-xs pt-1">
              Webhook endpoint: <code className="text-[#a78bfa]">/api/webhooks/payment?merchant={'<seu-user-id>'}</code>
            </p>
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
  )
}
