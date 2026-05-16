'use client'

/**
 * ProductForm — formulário de cadastro/edição de produto.
 *
 * Extraído de app/products/page.tsx em 2026-05-16 (Felipe + Diego).
 * Paleta corrigida nos hardcodes roxos banidos:
 *   #7c3aed/#a78bfa → petrol-500/petrol-300 (Diego audit)
 */

import { useState, useRef } from 'react'
import { Loader2, ImageIcon, Trash2 } from 'lucide-react'
import { uid } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import type { CheckoutMode, ProductVariantGroup, InventoryItem } from '@/lib/types'
import { FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { productsService } from '@/services/products'
import { CostPreview } from './CostPreview'

export type ProductFormData = {
  projectId:         string
  name:              string
  materialGrams:     string
  printTimeHours:    string
  failureRate:       string
  energyCostPerHour: string
  supportCost:       string
  marginPercentage:  string
  salePrice:         string
  inventoryItemId:   string
  notes:             string
  imageUrl:          string
  checkoutMode:      CheckoutMode
  variants:          ProductVariantGroup[]
  allowsCustom:      boolean
}

export const CHECKOUT_MODE_META: Record<CheckoutMode, { label: string; desc: string }> = {
  direct:       { label: 'Comprar agora',     desc: 'Preço fixo, checkout direto (Stripe / Mercado Pago)' },
  variant:      { label: 'Personalizar',      desc: 'Cliente escolhe variantes (cor, tamanho…) antes de pagar' },
  quote:        { label: 'Solicitar orçamento', desc: 'Customizado / projeto — gera Lead no CRM, sem pagamento direto' },
  contact_only: { label: 'Apenas exibir',     desc: 'Sem botão de compra, só vitrine + WhatsApp' },
}

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface ProductFormProps {
  projects:  { id: string; name: string }[]
  inventory: InventoryItem[]
  initial?:  ProductFormData
  onSave:    (d: ProductFormData) => void
  onClose:   () => void
}

export function ProductForm({
  projects,
  inventory,
  initial,
  onSave,
  onClose,
}: ProductFormProps) {
  const [data, setData] = useState<ProductFormData>(
    initial ?? {
      projectId:         projects[0]?.id ?? '',
      name:              '',
      materialGrams:     '100',
      printTimeHours:    '2',
      failureRate:       '10',
      energyCostPerHour: '0.50',
      supportCost:       '0',
      marginPercentage:  '30',
      salePrice:         '',
      inventoryItemId:   '',
      notes:             '',
      imageUrl:          '',
      checkoutMode:      'direct',
      variants:          [],
      allowsCustom:      false,
    },
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingProductId = useRef<string>(uid())

  const set =
    (k: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isSupabaseConfigured) {
      setUploadError('Upload de foto temporariamente indisponível. Continue sem foto por enquanto.')
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const url = await productsService.uploadImage(pendingProductId.current, file)
      setData(p => ({ ...p, imageUrl: url }))
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Não conseguimos enviar agora. Tenta de novo.'
      setUploadError(msg)
      console.error('[uploadImage]', err)
    } finally {
      setUploading(false)
    }
  }

  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setData(p => ({ ...p, projectId: e.target.value, inventoryItemId: '' }))
  }

  const projectFilaments = inventory.filter(
    i => i.projectId === data.projectId && i.category === 'filament',
  )
  const selectedFilament = projectFilaments.find(i => i.id === data.inventoryItemId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={handleProjectChange}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>

      <FormField label="Nome do Produto">
        <Input
          value={data.name}
          onChange={set('name')}
          placeholder="Ex: Suporte Celular Ajustável"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Material (g/peça)">
          <Input type="number" value={data.materialGrams} onChange={set('materialGrams')} min="0" step="0.1" placeholder="100" />
        </FormField>
        <FormField label="Tempo de Impressão (h)">
          <Input type="number" value={data.printTimeHours} onChange={set('printTimeHours')} min="0" step="0.1" placeholder="2" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Taxa de Falha (%)">
          <Input type="number" value={data.failureRate} onChange={set('failureRate')} min="0" max="100" step="1" placeholder="10" />
        </FormField>
        <FormField label="Custo de Energia (R$/h)">
          <Input type="number" value={data.energyCostPerHour} onChange={set('energyCostPerHour')} min="0" step="0.01" placeholder="0.50" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Custo de Suporte (R$/peça)">
          <Input type="number" value={data.supportCost} onChange={set('supportCost')} min="0" step="0.01" placeholder="0.00" />
        </FormField>
        <FormField label="Margem Desejada (%)">
          <Input type="number" value={data.marginPercentage} onChange={set('marginPercentage')} min="0" max="1000" step="1" placeholder="30" />
        </FormField>
      </div>

      <FormField label="Filamento Utilizado">
        <Select value={data.inventoryItemId} onChange={set('inventoryItemId')}>
          <option value="">Não especificado (usa R$80/kg padrão)</option>
          {projectFilaments.map(i => (
            <option key={i.id} value={i.id}>
              {i.name} — {fmt(i.costPrice)}/{i.unit}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Preço de Venda (R$)">
        <Input type="number" value={data.salePrice} onChange={set('salePrice')} min="0" step="0.01" placeholder="0,00" />
      </FormField>

      {/* Checkout mode selector — paleta corrigida (Diego) */}
      <div className="space-y-2">
        <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Modo de Venda</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(CHECKOUT_MODE_META) as CheckoutMode[]).map(mode => {
            const meta = CHECKOUT_MODE_META[mode]
            const active = data.checkoutMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setData(p => ({ ...p, checkoutMode: mode }))}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? 'bg-[hsl(173_58%_28%/0.15)] border-[hsl(173_58%_28%/0.45)]'
                    : 'bg-[#0f0f0f] border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                <p className={`text-sm font-semibold ${active ? 'text-[hsl(173_30%_57%)]' : 'text-[#ebebeb]'}`}>
                  {meta.label}
                </p>
                <p className="text-[10px] mt-0.5 leading-snug text-[#888888]">
                  {meta.desc}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {data.checkoutMode === 'variant' && (
        <div className="space-y-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3">
          <div className="flex items-center justify-between">
            <p className="text-[#ebebeb] text-xs font-semibold">Grupos de Variação</p>
            <button
              type="button"
              onClick={() => setData(p => ({
                ...p,
                variants: [...p.variants, { name: '', options: [] }],
              }))}
              className="text-[11px] text-[hsl(173_30%_57%)] hover:text-[hsl(173_30%_67%)]"
            >
              + adicionar grupo
            </button>
          </div>
          {data.variants.length === 0 && (
            <p className="text-[#555555] text-xs">Ex: Cor (Roxo, Verde) · Tamanho (P, M, G).</p>
          )}
          {data.variants.map((g, gIdx) => (
            <div key={gIdx} className="space-y-1.5 border-t border-[#1c1c1c] pt-2">
              <div className="flex items-center gap-2">
                <Input
                  value={g.name}
                  onChange={e => setData(p => ({
                    ...p,
                    variants: p.variants.map((v, i) => i === gIdx ? { ...v, name: e.target.value } : v),
                  }))}
                  placeholder="Nome do grupo (ex: Cor)"
                />
                <button
                  type="button"
                  onClick={() => setData(p => ({
                    ...p,
                    variants: p.variants.filter((_, i) => i !== gIdx),
                  }))}
                  className="p-1.5 text-[#888888] hover:text-[#ef4444]"
                  aria-label="Remover grupo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <Input
                value={g.options.join(', ')}
                onChange={e => setData(p => ({
                  ...p,
                  variants: p.variants.map((v, i) =>
                    i === gIdx
                      ? { ...v, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      : v,
                  ),
                }))}
                placeholder="Opções separadas por vírgula (ex: Roxo, Verde, Azul)"
              />
            </div>
          ))}
        </div>
      )}

      {(data.checkoutMode === 'direct' || data.checkoutMode === 'variant') && (
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.allowsCustom}
            onChange={e => setData(p => ({ ...p, allowsCustom: e.target.checked }))}
            className="mt-0.5 accent-[hsl(173_58%_28%)]"
          />
          <div>
            <p className="text-[#ebebeb] text-xs font-medium">Aceita pedido customizado em paralelo</p>
            <p className="text-[10px] text-[#555555]">
              Mostra também botão &quot;Solicitar orçamento&quot; no catálogo público.
            </p>
          </div>
        </label>
      )}

      <CostPreview
        materialGrams={parseFloat(data.materialGrams) || 0}
        printTimeHours={parseFloat(data.printTimeHours) || 0}
        failureRate={(parseFloat(data.failureRate) || 0) / 100}
        energyCostPerHour={parseFloat(data.energyCostPerHour) || 0.5}
        supportCost={parseFloat(data.supportCost) || 0}
        marginPercentage={(parseFloat(data.marginPercentage) || 30) / 100}
        salePrice={parseFloat(data.salePrice) || 0}
        filamentItem={selectedFilament}
      />

      {isSupabaseConfigured && (
        <div className="space-y-2">
          <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Imagem do Produto (opcional)</p>
          <div
            className="flex items-center gap-3 border border-dashed border-[#3a3a3a] rounded-xl p-4 cursor-pointer hover:border-[hsl(173_58%_28%/0.55)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {data.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={data.imageUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#1c1c1c] flex items-center justify-center shrink-0">
                {uploading ? (
                  <Loader2 size={16} className="text-[#555555] animate-spin" />
                ) : (
                  <ImageIcon size={16} className="text-[#555555]" />
                )}
              </div>
            )}
            <div>
              <p className="text-[#ebebeb] text-sm font-medium">
                {uploading ? 'Enviando…' : data.imageUrl ? 'Alterar imagem' : 'Adicionar imagem'}
              </p>
              <p className="text-[#555555] text-xs">JPG, PNG ou WebP · max 5 MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          {uploadError && (
            <p className="text-xs text-red-400 mt-1">{uploadError}</p>
          )}
        </div>
      )}

      <FormField label="Observações (opcional)">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas sobre o produto..." />
      </FormField>

      <SubmitButton>{initial ? 'Salvar Alterações' : 'Criar Produto'}</SubmitButton>
    </form>
  )
}
