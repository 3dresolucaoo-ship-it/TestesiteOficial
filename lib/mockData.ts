import type { AppState } from './types'
import { DEFAULT_ADMIN_CONFIG } from '@/core/admin/config'

export const initialData: AppState = {
  projects: [
    {
      id: 'p1', name: '3D Resolução', status: 'active',
      description: 'Impressão 3D sob demanda e produtos customizados',
      type: '3d_printing', modules: ['finance', 'operations', 'content', 'decisions'],
      color: '#7c3aed',
    },
    {
      id: 'p2', name: 'Héshiley', status: 'active',
      description: 'Marketing, afiliados e vendas de produtos',
      type: 'marketing', modules: ['finance', 'crm', 'content', 'decisions'],
      color: '#f59e0b',
    },
    {
      id: 'p3', name: 'Hequison', status: 'active',
      description: 'Negócios e soluções técnicas com gestão de estoque',
      type: 'business', modules: ['finance', 'operations', 'inventory', 'decisions'],
      color: '#3b82f6',
    },
    {
      id: 'p4', name: 'Gabriel', status: 'paused',
      description: 'Projeto de conteúdo em desenvolvimento',
      type: 'content_creator', modules: ['finance', 'content', 'decisions'],
      color: '#10b981',
    },
  ],

  orders: [
    { id: 'o1', projectId: 'p1', clientName: 'Carlos Silva',  origin: 'whatsapp',  item: 'Suporte celular customizado', value: 85,  status: 'paid',       date: '2026-04-15' },
    { id: 'o2', projectId: 'p1', clientName: 'Ana Souza',     origin: 'instagram', item: 'Porta-retratos 3D',           value: 120, status: 'delivered',  date: '2026-04-14' },
    { id: 'o3', projectId: 'p1', clientName: 'Pedro Lima',    origin: 'whatsapp',  item: 'Case para controle',          value: 60,  status: 'quote_sent', date: '2026-04-17' },
    { id: 'o4', projectId: 'p2', clientName: 'Maria Costa',   origin: 'instagram', item: 'Kit acessórios',              value: 200, status: 'lead',       date: '2026-04-17' },
    { id: 'o5', projectId: 'p1', clientName: 'João Ferreira', origin: 'facebook',  item: 'Miniatura personalizada',     value: 150, status: 'paid',       date: '2026-04-16' },
  ],

  production: [
    { id: 'pr1', orderId: 'o1', clientName: 'Carlos Silva',  item: 'Suporte celular customizado', printer: 'bambu',      status: 'printing', estimatedHours: 3, priority: 1 },
    { id: 'pr2', orderId: 'o5', clientName: 'João Ferreira', item: 'Miniatura personalizada',     printer: 'bambu',      status: 'waiting',  estimatedHours: 8, priority: 2 },
    { id: 'pr3', orderId: 'o3', clientName: 'Pedro Lima',    item: 'Case para controle',          printer: 'flashforge', status: 'waiting',  estimatedHours: 4, priority: 3 },
  ],

  content: [
    { id: 'c1', projectId: 'p1', idea: 'Timelapse da impressão do suporte de celular', status: 'posted',   platform: 'instagram', views: 1240, leads: 8,  salesGenerated: 3, link: 'https://instagram.com/p/example1', date: '2026-04-10' },
    { id: 'c2', projectId: 'p1', idea: 'Como funciona a Bambu Lab X1C',               status: 'recorded', platform: 'youtube',   views: 0,    leads: 0,  salesGenerated: 0, link: '', date: '2026-04-15' },
    { id: 'c3', projectId: 'p1', idea: 'Miniaturas para presentes personalizados',    status: 'idea',     platform: 'instagram', views: 0,    leads: 0,  salesGenerated: 0, link: '', date: '2026-04-17' },
    { id: 'c4', projectId: 'p2', idea: 'Lançamento da nova coleção de produtos',      status: 'idea',     platform: 'instagram', views: 0,    leads: 0,  salesGenerated: 0, link: '', date: '2026-04-17' },
    { id: 'c5', projectId: 'p2', idea: 'Como ser afiliado Héshiley — tutorial',       status: 'posted',   platform: 'instagram', views: 3450, leads: 22, salesGenerated: 8, link: 'https://instagram.com/p/example5', date: '2026-04-08' },
    { id: 'c6', projectId: 'p4', idea: 'Rotina de criador de conteúdo iniciante',     status: 'recorded', platform: 'youtube',   views: 0,    leads: 0,  salesGenerated: 0, link: '', date: '2026-04-16' },
  ],

  decisions: [
    { id: 'd1', projectId: 'p1', decision: 'Focar em miniaturas e produtos customizados como carro-chefe', impact: 'Alto — define posicionamento de mercado', date: '2026-04-01', status: 'active' },
    { id: 'd2', projectId: 'p1', decision: 'Usar apenas WhatsApp e Instagram para captação de leads',     impact: 'Médio — simplifica processo de vendas',    date: '2026-04-05', status: 'active' },
    { id: 'd3', projectId: 'p2', decision: 'Lançar programa de afiliados com comissão de 15%',            impact: 'Alto — escala de vendas sem custo fixo',   date: '2026-04-10', status: 'active' },
    { id: 'd4', projectId: 'p3', decision: 'Comprar Flashforge adicional para aumentar capacidade',       impact: 'Alto — dobra capacidade produtiva',        date: '2026-04-12', status: 'active' },
  ],

  // ─── Finance ────────────────────────────────────────────────────────────────
  transactions: [
    // 3D Resolução — income
    { id: 't1',  projectId: 'p1', type: 'income',  category: 'product_sale',  description: 'Suporte celular — Carlos',   value: 85,  date: '2026-04-15', source: 'WhatsApp' },
    { id: 't2',  projectId: 'p1', type: 'income',  category: 'product_sale',  description: 'Porta-retratos — Ana',       value: 120, date: '2026-04-14', source: 'Instagram' },
    { id: 't3',  projectId: 'p1', type: 'income',  category: 'product_sale',  description: 'Miniatura — João',           value: 150, date: '2026-04-16', source: 'Facebook' },
    { id: 't4',  projectId: 'p1', type: 'income',  category: 'product_sale',  description: 'Pedido anterior - lote',     value: 320, date: '2026-03-28', source: 'WhatsApp' },
    // 3D Resolução — expenses
    { id: 't5',  projectId: 'p1', type: 'expense', category: 'filament',      description: 'PLA+ 5kg preto',             value: 180, date: '2026-04-02', source: 'Amazon' },
    { id: 't6',  projectId: 'p1', type: 'expense', category: 'shipping',      description: 'Frete pedidos abril',        value: 45,  date: '2026-04-15', source: 'Correios' },
    // Héshiley — income
    { id: 't7',  projectId: 'p2', type: 'income',  category: 'affiliate_income', description: 'Comissões afiliados abril', value: 520, date: '2026-04-10', source: 'Hotmart' },
    { id: 't8',  projectId: 'p2', type: 'income',  category: 'product_sale',  description: 'Kit acessórios — Maria',    value: 200, date: '2026-04-17', source: 'Instagram' },
    { id: 't9',  projectId: 'p2', type: 'income',  category: 'affiliate_income', description: 'Comissões março',        value: 380, date: '2026-03-30', source: 'Hotmart' },
    // Héshiley — expenses
    { id: 't10', projectId: 'p2', type: 'expense', category: 'ads',           description: 'Anúncios Instagram abril',  value: 250, date: '2026-04-01', source: 'Meta Ads' },
    { id: 't11', projectId: 'p2', type: 'expense', category: 'software',      description: 'Plataforma de afiliados',   value: 60,  date: '2026-04-01', source: 'Hotmart' },
    // Hequison — income
    { id: 't12', projectId: 'p3', type: 'income',  category: 'service_sale',  description: 'Consultoria técnica',       value: 800, date: '2026-04-08', source: 'Direto' },
    { id: 't13', projectId: 'p3', type: 'income',  category: 'service_sale',  description: 'Projeto impressão lote',    value: 450, date: '2026-03-25', source: 'Indicação' },
    // Hequison — expenses
    { id: 't14', projectId: 'p3', type: 'expense', category: 'equipment',     description: 'Peças manutenção impressora', value: 120, date: '2026-04-05', source: 'AliExpress' },
    { id: 't15', projectId: 'p3', type: 'expense', category: 'software',      description: 'Assinatura CAD',            value: 80,  date: '2026-04-01', source: 'Autodesk' },
    // Gabriel — income
    { id: 't16', projectId: 'p4', type: 'income',  category: 'other_income',  description: 'Monetização YouTube',       value: 45,  date: '2026-04-12', source: 'YouTube' },
    // Gabriel — expenses
    { id: 't17', projectId: 'p4', type: 'expense', category: 'software',      description: 'Adobe Creative Cloud',      value: 120, date: '2026-04-01', source: 'Adobe' },
  ],

  // ─── CRM ────────────────────────────────────────────────────────────────────
  leads: [
    { id: 'l1', projectId: 'p2', name: 'Fernanda Rocha',   contact: '@fernanda_r',  source: 'instagram', status: 'new',         value: 250, notes: 'Interesse em kit premium',         date: '2026-04-16' },
    { id: 'l2', projectId: 'p2', name: 'Rafael Moura',     contact: '11 98765-4321',source: 'whatsapp',  status: 'contacted',   value: 150, notes: 'Solicitou catálogo completo',      date: '2026-04-15' },
    { id: 'l3', projectId: 'p2', name: 'Juliana Santos',   contact: '@ju_santos',   source: 'instagram', status: 'negotiating', value: 400, notes: 'Quer comprar 3 kits no atacado',   date: '2026-04-13' },
    { id: 'l4', projectId: 'p2', name: 'Bruno Cardoso',    contact: '21 99123-4567',source: 'facebook',  status: 'won',         value: 200, notes: 'Fechou kit básico',                date: '2026-04-10' },
    { id: 'l5', projectId: 'p2', name: 'Camila Nunes',     contact: '@camila.nunes',source: 'instagram', status: 'lost',        value: 0,   notes: 'Desistiu por preço',               date: '2026-04-09' },
    { id: 'l6', projectId: 'p2', name: 'Diego Alves',      contact: '31 98456-7890',source: 'shopee',    status: 'new',         value: 350, notes: 'Encontrou via Shopee',             date: '2026-04-17' },
  ],

  affiliates: [
    { id: 'af1', projectId: 'p2', name: 'Mariana Lima',    platform: 'Instagram',  code: 'MARI15',   totalSales: 12, commission: 180, status: 'active',   date: '2026-02-01' },
    { id: 'af2', projectId: 'p2', name: 'Thiago Pereira',  platform: 'YouTube',    code: 'THIAGO10', totalSales: 8,  commission: 120, status: 'active',   date: '2026-02-15' },
    { id: 'af3', projectId: 'p2', name: 'Letícia Costa',   platform: 'TikTok',     code: 'LETI20',   totalSales: 3,  commission: 45,  status: 'inactive', date: '2026-03-01' },
  ],

  // ─── Inventory ──────────────────────────────────────────────────────────────
  inventory: [
    { id: 'inv1', projectId: 'p1', category: 'filament',  name: 'PLA+ Preto 1kg',            sku: 'FIL-PLA-BLK', quantity: 3,  unit: 'kg', costPrice: 85,   salePrice: 0,   notes: 'Bambu filament',       minStock: 2 },
    { id: 'inv2', projectId: 'p1', category: 'filament',  name: 'PLA+ Branco 1kg',           sku: 'FIL-PLA-WHT', quantity: 2,  unit: 'kg', costPrice: 85,   salePrice: 0,   notes: 'Bambu filament',       minStock: 2 },
    { id: 'inv3', projectId: 'p1', category: 'filament',  name: 'PETG Transparente 1kg',     sku: 'FIL-PET-CLR', quantity: 1,  unit: 'kg', costPrice: 95,   salePrice: 0,   notes: 'Quase acabando',       minStock: 2 },
    { id: 'inv4', projectId: 'p1', category: 'equipment', name: 'Bambu Lab X1C',             sku: 'EQP-BBL-X1C', quantity: 1,  unit: 'un', costPrice: 4200, salePrice: 0,   notes: 'Impressora principal', minStock: 1 },
    { id: 'inv5', projectId: 'p1', category: 'equipment', name: 'Flashforge Creator 4',      sku: 'EQP-FLF-CR4', quantity: 1,  unit: 'un', costPrice: 3800, salePrice: 0,   notes: 'Impressora secundária',minStock: 1 },
    { id: 'inv6', projectId: 'p3', category: 'product',   name: 'Suporte Monitor Ajustável', sku: 'PRD-SMN-001', quantity: 5,  unit: 'un', costPrice: 40,   salePrice: 120, notes: '',                     minStock: 3 },
    { id: 'inv7', projectId: 'p3', category: 'product',   name: 'Case Raspberry Pi 4',       sku: 'PRD-RPI-004', quantity: 2,  unit: 'un', costPrice: 15,   salePrice: 45,  notes: 'Estoque baixo',        minStock: 3 },
    { id: 'inv8', projectId: 'p3', category: 'filament',  name: 'ABS Preto 1kg',             sku: 'FIL-ABS-BLK', quantity: 4,  unit: 'kg', costPrice: 90,   salePrice: 0,   notes: '',                     minStock: 2 },
    { id: 'inv9', projectId: 'p3', category: 'filament',  name: 'PETG Preto 1kg',            sku: 'FIL-PET-BLK', quantity: 3,  unit: 'kg', costPrice: 95,   salePrice: 0,   notes: '',                     minStock: 2 },
    { id: 'inv10',projectId: 'p3', category: 'equipment', name: 'Bambu Lab P1S',             sku: 'EQP-BBL-P1S', quantity: 1,  unit: 'un', costPrice: 3200, salePrice: 0,   notes: 'Impressora principal', minStock: 1 },
    { id: 'inv11',projectId: 'p3', category: 'equipment', name: 'Flashforge Adventurer 5M',  sku: 'EQP-FLF-A5M', quantity: 1,  unit: 'un', costPrice: 2800, salePrice: 0,   notes: 'Impressora secundária',minStock: 1 },
    { id: 'inv12',projectId: 'p3', category: 'product',   name: 'Suporte Vertical Notebook', sku: 'PRD-SVN-001', quantity: 8,  unit: 'un', costPrice: 25,   salePrice: 75,  notes: '',                     minStock: 3 },
    { id: 'inv13',projectId: 'p3', category: 'other',     name: 'Resina ABS-Like 500ml',     sku: 'RES-ABS-500', quantity: 6,  unit: 'un', costPrice: 55,   salePrice: 0,   notes: 'Para impressão SLA',   minStock: 2 },
  ],

  // ─── Stock Movements ────────────────────────────────────────────────────────
  movements: [
    { id: 'mv1', projectId: 'p3', itemId: 'inv6', type: 'in',  quantity: 5,  reason: 'purchase',   date: '2026-03-15', notes: 'Compra inicial de estoque', orderId: undefined },
    { id: 'mv2', projectId: 'p3', itemId: 'inv7', type: 'in',  quantity: 5,  reason: 'purchase',   date: '2026-03-15', notes: 'Compra inicial de estoque', orderId: undefined },
    { id: 'mv3', projectId: 'p3', itemId: 'inv12',type: 'in',  quantity: 8,  reason: 'purchase',   date: '2026-03-20', notes: 'Lote novo',                 orderId: undefined },
    { id: 'mv4', projectId: 'p3', itemId: 'inv6', type: 'out', quantity: 2,  reason: 'sale',       date: '2026-04-02', notes: 'Venda para cliente direto', orderId: undefined },
    { id: 'mv5', projectId: 'p3', itemId: 'inv7', type: 'out', quantity: 3,  reason: 'sale',       date: '2026-04-05', notes: 'Venda via indicação',       orderId: undefined },
    { id: 'mv6', projectId: 'p3', itemId: 'inv8', type: 'in',  quantity: 4,  reason: 'purchase',   date: '2026-04-01', notes: 'Reposição filamento',       orderId: undefined },
    { id: 'mv7', projectId: 'p3', itemId: 'inv8', type: 'out', quantity: 0,  reason: 'printing',   date: '2026-04-08', notes: 'Impressão lote consultoria', orderId: undefined },
    { id: 'mv8', projectId: 'p1', itemId: 'inv1', type: 'in',  quantity: 5,  reason: 'purchase',   date: '2026-03-10', notes: 'Compra Bambu Store',        orderId: undefined },
    { id: 'mv9', projectId: 'p1', itemId: 'inv1', type: 'out', quantity: 2,  reason: 'printing',   date: '2026-04-15', notes: 'Pedidos Carlos + João',     orderId: undefined },
  ],

  // ─── Admin Config ────────────────────────────────────────────────────────────
  config: DEFAULT_ADMIN_CONFIG,

  // ─── Products (print templates) ─────────────────────────────────────────────
  products: [],

  // ─── Catalogs ────────────────────────────────────────────────────────────────
  catalogs: [],
}
