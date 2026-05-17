'use client'

import { useState } from 'react'
import { Package, Cpu, Zap } from 'lucide-react'
import type { InventoryItem, Product } from '@/lib/types'
import { FormField, Input, Select, SubmitButton } from '@/components/Modal'
import { calcUnitCost } from '@/core/analytics/productionEngine'
import type { OrderFormData } from './helpers'
import { OrderCostPreview } from './OrderCostPreview'

/**
 * Form de criação/edição de pedido.
 *
 * Estrutura:
 *   1. Seletor de projeto
 *   2. Seletor de template de produto (opcional, 3D)
 *   3. Cliente + Origem
 *   4. Item + Valor + Status + Data
 *   5. Preview de custo (se template selecionado)
 *   6. Vínculo com estoque (manual ou auto via template)
 *
 * Extraído de app/orders/page.tsx em 2026-05-16 (refactor orders -40%).
 */
export function OrderForm({ projects, inventory, products, initial, onSave, onClose }: {
  projects:  { id: string; name: string }[]
  inventory: InventoryItem[]
  products:  Product[]
  initial?:  OrderFormData
  onSave:    (d: OrderFormData) => void
  onClose:   () => void
}) {
  const [data, setData] = useState<OrderFormData>(initial ?? {
    projectId:       projects[0]?.id ?? '',
    clientName:      '',
    origin:          'whatsapp',
    item:            '',
    value:           '',
    status:          'lead',
    date:            new Date().toISOString().slice(0, 10),
    inventoryItemId: '',
    qtyUsed:         '1',
    productId:       '',
  })

  const set = (k: keyof OrderFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(prev => ({ ...prev, [k]: e.target.value }))

  // Ao trocar projeto, zera template + vínculo de estoque (são por-projeto).
  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setData(prev => ({
      ...prev,
      projectId:       e.target.value,
      productId:       '',
      inventoryItemId: '',
      qtyUsed:         '1',
    }))
  }

  // Ao selecionar template de produto, auto-preenche item/valor/estoque/qty.
  function handleProductChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pid = e.target.value
    if (!pid) {
      setData(prev => ({ ...prev, productId: '' }))
      return
    }
    const product = products.find(p => p.id === pid)
    if (!product) return

    // Calcula qty automática baseada na unidade do filamento (g ou kg)
    const filamentItem = product.inventoryItemId
      ? inventory.find(i => i.id === product.inventoryItemId)
      : undefined
    const breakdown = calcUnitCost(product, inventory)
    let autoQty = '1'
    if (filamentItem) {
      autoQty = filamentItem.unit === 'g'
        ? String(breakdown.filamentUsedGrams)
        : String(Math.round(breakdown.filamentUsedGrams / 10) / 100)  // kg, 2 d.p.
    }

    setData(prev => ({
      ...prev,
      productId:       pid,
      item:            product.name,
      value:           product.salePrice > 0 ? String(product.salePrice) : prev.value,
      inventoryItemId: product.inventoryItemId ?? '',
      qtyUsed:         product.inventoryItemId ? autoQty : '1',
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.clientName.trim() || !data.item.trim()) return
    onSave(data)
    onClose()
  }

  const projectProducts  = products.filter(p => p.projectId === data.projectId)
  const projectInventory = inventory.filter(i => i.projectId === data.projectId)
  const selectedProduct  = projectProducts.find(p => p.id === data.productId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={handleProjectChange}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </FormField>

      {/* Seletor de template (3D print) — opcional */}
      {projectProducts.length > 0 && (
        <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-[#7c3aed]" />
            <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Produto 3D (opcional)</p>
          </div>
          <FormField label="Usar Template de Produto">
            <Select value={data.productId} onChange={handleProductChange}>
              <option value="">Pedido avulso (sem template)</option>
              {projectProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.salePrice > 0 ? ` — R$ ${p.salePrice.toFixed(2)}` : ''}
                </option>
              ))}
            </Select>
          </FormField>
          {selectedProduct && (
            <p className="text-[#555555] text-xs">
              Item, valor e filamento preenchidos automaticamente. A impressão será agendada ao criar o pedido.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Cliente">
          <Input value={data.clientName} onChange={set('clientName')} placeholder="Nome do cliente" required />
        </FormField>
        <FormField label="Origem">
          <Select value={data.origin} onChange={set('origin')}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="other">Outro</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Item / Pedido">
        <Input value={data.item} onChange={set('item')} placeholder="Descrição do pedido" required />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor (R$)">
          <Input type="number" value={data.value} onChange={set('value')} placeholder="0" min="0" />
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            <option value="lead">Lead</option>
            <option value="quote_sent">Orçamento Enviado</option>
            <option value="paid">Pago</option>
            <option value="delivered">Entregue</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Data">
        <Input type="date" value={data.date} onChange={set('date')} />
      </FormField>

      {/* Live preview de custo (quando template selecionado) */}
      {selectedProduct && (
        <OrderCostPreview
          product={selectedProduct}
          inventory={inventory}
          salePrice={parseFloat(data.value) || 0}
        />
      )}

      {/* Vínculo manual com estoque (só quando não tem template) */}
      {!selectedProduct && projectInventory.length > 0 && (
        <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package size={13} className="text-[#555555]" />
            <p className="text-[#555555] text-xs font-medium uppercase tracking-wide">Estoque (opcional)</p>
          </div>
          <FormField label="Vincular ao Estoque">
            <Select value={data.inventoryItemId} onChange={set('inventoryItemId')}>
              <option value="">Não descontar do estoque</option>
              {projectInventory.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (disponível: {i.quantity} {i.unit})
                </option>
              ))}
            </Select>
          </FormField>
          {data.inventoryItemId && (
            <FormField label="Quantidade vendida">
              <Input type="number" value={data.qtyUsed} onChange={set('qtyUsed')} min="0.01" step="0.01" />
            </FormField>
          )}
          {data.inventoryItemId && (
            <p className="text-[#555555] text-xs">
              O estoque será decrementado automaticamente quando o pedido for marcado como{' '}
              <span className="text-[#10b981]">Pago</span>.
            </p>
          )}
        </div>
      )}

      {/* Info de vínculo automático (quando template + estoque) */}
      {selectedProduct && data.inventoryItemId && (
        <div className="flex items-center gap-2 bg-[#7c3aed0d] border border-[#7c3aed22] rounded-lg px-3 py-2">
          <Zap size={12} className="text-[#a78bfa] shrink-0" />
          <p className="text-[#a78bfa] text-xs">
            {inventory.find(i => i.id === data.inventoryItemId)?.name ?? 'Filamento'} será decrementado
            em {data.qtyUsed} {inventory.find(i => i.id === data.inventoryItemId)?.unit ?? ''} ao pagar.
          </p>
        </div>
      )}

      <SubmitButton>{initial ? 'Salvar' : 'Criar Pedido'}</SubmitButton>
    </form>
  )
}
