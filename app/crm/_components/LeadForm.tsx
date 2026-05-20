'use client'

/**
 * app/crm/_components/LeadForm.tsx
 * Formulario criar/editar lead. Usado dentro do <Modal>.
 * Estado local controlado — sem Zod por ora (consistente com o original).
 */

import { useState } from 'react'
import { FormField, Input, Select, Textarea, SubmitButton } from '@/components/Modal'
import { LEAD_STATUS_LABELS, CONTACT_SOURCE_LABELS } from '@/lib/types'
import type { LeadFormData } from './helpers'

interface LeadFormProps {
  projects: { id: string; name: string }[]
  initial?: LeadFormData
  onSave:   (d: LeadFormData) => void
  onClose:  () => void
}

export function LeadForm({ projects, initial, onSave, onClose }: LeadFormProps) {
  const [data, setData] = useState<LeadFormData>(
    initial ?? {
      projectId: projects[0]?.id ?? '',
      name:      '',
      contact:   '',
      source:    'instagram',
      status:    'new',
      value:     '',
      notes:     '',
      date:      new Date().toISOString().slice(0, 10),
    },
  )

  const set =
    (k: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [k]: e.target.value }))

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
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nome">
          <Input
            value={data.name}
            onChange={set('name')}
            placeholder="Nome do lead"
            required
            aria-required="true"
          />
        </FormField>
        <FormField label="Contato">
          <Input
            value={data.contact}
            onChange={set('contact')}
            placeholder="WhatsApp, @instagram..."
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Origem">
          <Select value={data.source} onChange={set('source')}>
            {Object.entries(CONTACT_SOURCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={data.status} onChange={set('status')}>
            {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor Estimado (R$)">
          <Input
            type="number"
            value={data.value}
            onChange={set('value')}
            placeholder="0"
            min="0"
          />
        </FormField>
        <FormField label="Data">
          <Input type="date" value={data.date} onChange={set('date')} />
        </FormField>
      </div>

      <FormField label="Observacoes">
        <Textarea
          value={data.notes}
          onChange={set('notes')}
          placeholder="Notas sobre o lead..."
        />
      </FormField>

      <SubmitButton>{initial ? 'Salvar alteracoes' : 'Adicionar Lead'}</SubmitButton>
    </form>
  )
}
