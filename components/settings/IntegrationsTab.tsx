'use client'

import { ExternalLink } from 'lucide-react'
import * as InstagramAdapter from '@/core/integrations/instagramAdapter'
import * as YouTubeAdapter from '@/core/integrations/youtubeAdapter'
import * as BlingAdapter from '@/core/integrations/blingAdapter'
import type { RemoteConfig } from './types'

interface Props {
  remoteConfigs: RemoteConfig[]
}

export function IntegrationsTab({ remoteConfigs }: Props) {
  const mpRemote = remoteConfigs.find(c => c.provider === 'mercadopago')

  const integrations = [
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
  ]

  return (
    <div className="space-y-4">
      {integrations.map(integration => (
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
  )
}
