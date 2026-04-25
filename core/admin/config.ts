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

export interface ProductionConfig {
  printerTypes:         CategoryEntry[]   // printer models/types
  filamentTypes:        CategoryEntry[]   // material types (PLA, PETG, TPU...)
  lowStockAlertEnabled: boolean           // show alerts when filament is low
  lowStockGrams:        number            // threshold in grams
}

export interface StorefrontConfig {
  paymentProvider:  'stripe' | 'mercadopago' | 'none'
  stripePublicKey:  string
  stripeSecretKey:  string
  mpPublicKey:      string
  mpAccessToken:    string
  defaultWhatsapp:  string   // default number for catalog WhatsApp buttons
  checkoutEnabled:  boolean
}

export interface BrandConfig {
  logoUrl:     string
  accentColor: string   // hex, applied as --t-accent at runtime
}

export interface ModulesConfig {
  finance:    boolean
  orders:     boolean
  crm:        boolean
  products:   boolean
  inventory:  boolean
  production: boolean
  content:    boolean
  decisions:  boolean
  metrics:    boolean
}

export interface AdminConfig {
  companyName: string
  timezone:    string
  brand:       BrandConfig
  modules:     ModulesConfig
  finance:     FinanceConfig
  crm:         CRMConfig
  inventory:   InventoryConfig
  content:     ContentConfig
  production:  ProductionConfig
  storefront:  StorefrontConfig
}

// ─── Defaults (mirrors current hardcoded values) ─────────────────────────────
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  companyName: 'BVaz Hub',
  timezone:    'America/Sao_Paulo',

  brand: {
    logoUrl:     '',
    accentColor: '#3b82f6',
  },

  modules: {
    finance:    true,
    orders:     true,
    crm:        true,
    products:   true,
    inventory:  true,
    production: true,
    content:    true,
    decisions:  true,
    metrics:    true,
  },

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

  production: {
    printerTypes: [
      { key: 'bambu_x1c', label: 'Bambu Lab X1C' },
      { key: 'bambu_p1s', label: 'Bambu Lab P1S' },
      { key: 'bambu_a1',  label: 'Bambu Lab A1' },
      { key: 'ender_3',   label: 'Creality Ender 3' },
      { key: 'other',     label: 'Outro' },
    ],
    filamentTypes: [
      { key: 'pla',    label: 'PLA' },
      { key: 'petg',   label: 'PETG' },
      { key: 'abs',    label: 'ABS' },
      { key: 'tpu',    label: 'TPU' },
      { key: 'asa',    label: 'ASA' },
      { key: 'pa',     label: 'Nylon (PA)' },
      { key: 'resin',  label: 'Resina' },
    ],
    lowStockAlertEnabled: true,
    lowStockGrams:        200,
  },

  storefront: {
    paymentProvider: 'none',
    stripePublicKey: '',
    stripeSecretKey: '',
    mpPublicKey:     '',
    mpAccessToken:   '',
    defaultWhatsapp: '',
    checkoutEnabled: false,
  },
}
