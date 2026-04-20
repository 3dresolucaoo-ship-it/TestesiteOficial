// ─── Admin Configuration System ──────────────────────────────────────────────
// Stores all dynamic module configurations in global state so they can be
// edited from /settings without a redeploy.

export interface CategoryEntry {
  key: string
  label: string
}

export interface FinanceConfig {
  incomeCategories:   CategoryEntry[]
  expenseCategories:  CategoryEntry[]
  defaultCurrency:    'BRL' | 'USD' | 'EUR'
  profitMarginTarget: number   // % — used for alerts/badges
}

export interface CRMConfig {
  leadStages: Array<{ key: string; label: string; color: string }>
  contactSources:         CategoryEntry[]
  defaultCommissionRate:  number   // %
}

export interface InventoryConfig {
  categories:              CategoryEntry[]
  defaultUnit:             string
  defaultLowStockThreshold: number
  markupDefault:           number   // % over cost price
}

export interface ContentConfig {
  platforms: Array<{ key: string; label: string; color: string }>
  statuses:  Array<{ key: string; label: string; color: string }>
  trackEngagement: boolean
}

export interface AdminConfig {
  companyName: string
  timezone:    string
  finance:     FinanceConfig
  crm:         CRMConfig
  inventory:   InventoryConfig
  content:     ContentConfig
}

// ─── Defaults (mirrors current hardcoded values) ─────────────────────────────
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  companyName: 'BVaz Hub',
  timezone:    'America/Sao_Paulo',

  finance: {
    incomeCategories: [
      { key: 'product_sale',     label: 'Venda de Produto' },
      { key: 'service_sale',     label: 'Venda de Serviço' },
      { key: 'affiliate_income', label: 'Renda de Afiliado' },
      { key: 'other_income',     label: 'Outra Receita' },
    ],
    expenseCategories: [
      { key: 'filament',      label: 'Filamento' },
      { key: 'equipment',     label: 'Equipamento' },
      { key: 'ads',           label: 'Anúncios' },
      { key: 'shipping',      label: 'Frete' },
      { key: 'software',      label: 'Software' },
      { key: 'commission',    label: 'Comissão' },
      { key: 'other_expense', label: 'Outra Despesa' },
    ],
    defaultCurrency:    'BRL',
    profitMarginTarget: 20,
  },

  crm: {
    leadStages: [
      { key: 'new',         label: 'Novo',       color: '#888888' },
      { key: 'contacted',   label: 'Contatado',  color: '#3b82f6' },
      { key: 'negotiating', label: 'Negociando', color: '#f59e0b' },
      { key: 'won',         label: 'Ganho',      color: '#10b981' },
      { key: 'lost',        label: 'Perdido',    color: '#ef4444' },
    ],
    contactSources: [
      { key: 'instagram', label: 'Instagram' },
      { key: 'whatsapp',  label: 'WhatsApp' },
      { key: 'facebook',  label: 'Facebook' },
      { key: 'shopee',    label: 'Shopee' },
      { key: 'referral',  label: 'Indicação' },
      { key: 'other',     label: 'Outro' },
    ],
    defaultCommissionRate: 15,
  },

  inventory: {
    categories: [
      { key: 'filament',  label: 'Filamento' },
      { key: 'equipment', label: 'Equipamento' },
      { key: 'product',   label: 'Produto' },
      { key: 'other',     label: 'Outro' },
    ],
    defaultUnit:              'un',
    defaultLowStockThreshold: 3,
    markupDefault:            200,
  },

  content: {
    platforms: [
      { key: 'instagram', label: 'Instagram', color: 'text-[#f59e0b]' },
      { key: 'youtube',   label: 'YouTube',   color: 'text-[#ef4444]' },
      { key: 'tiktok',    label: 'TikTok',    color: 'text-[#a78bfa]' },
    ],
    statuses: [
      { key: 'idea',     label: 'Ideia',   color: 'text-[#888888]' },
      { key: 'recorded', label: 'Gravado', color: 'text-[#f59e0b]' },
      { key: 'posted',   label: 'Postado', color: 'text-[#10b981]' },
    ],
    trackEngagement: true,
  },
}
