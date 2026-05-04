'use client'

import { useState } from 'react'
import { SectionCard, FieldLabel, TextInput, SecretInput } from './shared'
import type { AdminConfig } from '@/lib/types'
import type { SettingsTabProps, RemoteConfig } from './types'

interface Props extends SettingsTabProps {
  remoteConfigs: RemoteConfig[]
  refreshRemoteConfigs: () => Promise<void>
}

export function StorefrontTab({ draft, setDraft, remoteConfigs, refreshRemoteConfigs }: Props) {
  const mpRemote = remoteConfigs.find(c => c.provider === 'mercadopago')
  const [mpManual, setMpManual] = useState(false)

  function updateStorefront(patch: Partial<AdminConfig['storefront']>) {
    setDraft(d => ({ ...d, storefront: { ...d.storefront, ...patch } }))
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
            <p className="text-[#555555] text-xs">Exibe o botão "Comprar" nos catálogos públicos</p>
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
              <button
                type="button"
                onClick={async () => {
                  if (!mpRemote) return
                  await fetch(`/api/payment-configs?id=${mpRemote.id}`, { method: 'DELETE' })
                  await refreshRemoteConfigs()
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-[#2a2a2a] hover:border-[#ef4444] text-[#888] hover:text-[#ef4444] text-xs font-medium transition-colors"
              >
                Desconectar Mercado Pago
              </button>
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
                Armazenado no banco. Prefira usar variável de ambiente <code className="text-[#a78bfa]">STRIPE_SECRET_KEY</code> em produção.
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
  )
}
