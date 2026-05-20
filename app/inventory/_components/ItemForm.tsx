'use client'

/**
 * ItemForm — formulário de criação/edição de item de estoque.
 * Extraído de app/inventory/page.tsx em 2026-05-19 (refactor Felipe).
 */

import { useState } from 'react'
import { INVENTORY_CATEGORY_LABELS, FILAMENT_USO_LABELS } from '@/lib/types'
import type { FilamentUso } from '@/core/inventory/types'
import { FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { ImageUploader } from './ImageUploader'
import type { ItemFormData } from './types'

interface ItemFormProps {
  projects: { id: string; name: string }[]
  initial?: ItemFormData
  onSave:   (d: ItemFormData) => void
  onClose:  () => void
}

export function ItemForm({ projects, initial, onSave, onClose }: ItemFormProps) {
  const [data, setData] = useState<ItemFormData>(
    initial ?? {
      projectId:   projects[0]?.id ?? '',
      category:    'product',
      name:        '',
      sku:         '',
      quantity:    '1',
      unit:        'un',
      costPrice:   '',
      salePrice:   '',
      notes:       '',
      minStock:    '2',
      imageUrl:    '',
      filamentUso: '',
    },
  )

  const set =
    (k: keyof ItemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim() || !data.projectId) return
    onSave(data)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Projeto">
        <Select value={data.projectId} onChange={set('projectId')}>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoria">
          <Select value={data.category} onChange={set('category')}>
            {Object.entries(INVENTORY_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Unidade">
          <Select value={data.unit} onChange={set('unit')}>
            <option value="un">un</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="m">m</option>
            <option value="l">l</option>
          </Select>
        </FormField>
      </div>

      {/* Uso de filamento — exibido somente quando categoria é filament */}
      {data.category === 'filament' && (
        <FormField label="Uso do filamento">
          <Select
            value={data.filamentUso}
            onChange={e => setData(p => ({ ...p, filamentUso: e.target.value as FilamentUso | '' }))}
          >
            <option value="">Não especificado</option>
            {Object.entries(FILAMENT_USO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Nome do Item">
        <Input
          value={data.name}
          onChange={set('name')}
          placeholder="Ex: Filamento PLA Branco 1kg"
          required
        />
      </FormField>

      <FormField label="SKU (opcional)">
        <Input value={data.sku} onChange={set('sku')} placeholder="Ex: FIL-PLA-BRK-001" />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Quantidade">
          <Input
            type="number"
            value={data.quantity}
            onChange={set('quantity')}
            min="0"
            step="0.01"
          />
        </FormField>
        <FormField label="Custo (R$)">
          <Input
            type="number"
            value={data.costPrice}
            onChange={set('costPrice')}
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        </FormField>
        <FormField label="Venda (R$)">
          <Input
            type="number"
            value={data.salePrice}
            onChange={set('salePrice')}
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        </FormField>
      </div>

      <FormField label="Alerta Mínimo (qtd)">
        <Input
          type="number"
          value={data.minStock}
          onChange={set('minStock')}
          min="0"
          step="1"
        />
      </FormField>

      <FormField label="Observações (opcional)">
        <Textarea value={data.notes} onChange={set('notes')} placeholder="Notas opcionais..." />
      </FormField>

      <FormField label="Foto (opcional)">
        <ImageUploader
          value={data.imageUrl}
          onChange={url => setData(p => ({ ...p, imageUrl: url }))}
        />
      </FormField>

      <SubmitButton>{initial ? 'Salvar Alterações' : 'Adicionar Item'}</SubmitButton>
    </form>
  )
}
