'use client'

import { useState } from 'react'
import { useStore, uid } from '@/lib/store'
import type { Catalog, Product } from '@/lib/types'
import { generateSlug } from '@/services/catalogs'
import {
  Plus, Copy, ExternalLink, Trash2, BookOpen, ImageIcon, Check,
  Pencil, Store, CheckCircle2, Layers,
} from 'lucide-react'
import { Modal, FormField, Input, Select, SubmitButton } from '@/components/Modal'

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  function show(m: string) {
    setMsg(m)
    setTimeout(() => setMsg(null), 2500)
  }
  return { msg, show }
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xl"
      style={{ background: '#10b981', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
    >
      <CheckCircle2 size={15} />
      {message}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function ModeBadge({ mode }: { mode: Catalog['mode'] }) {
  return mode === 'catalog' ? (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
      style={{ color: '#7c3aed', background: '#7c3aed1a', borderColor: '#7c3aed33' }}
    >
      <Store size={9} />
      Catálogo
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
      style={{ color: '#10b981', background: '#10b9811a', borderColor: '#10b98133' }}
    >
      <Layers size={9} />
      Portfólio
    </span>
  )
}

// ─── Product picker ───────────────────────────────────────────────────────────
function ProductPicker({
  products,
  selected,
  onChange,
}: {
  products: Product[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  if (products.length === 0) {
    return (
      <p className="text-xs py-2" style={{ color: 'var(--t-text-muted)' }}>
        Nenhum produto cadastrado ainda.
      </p>
    )
  }

  return (
    <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
      {products.map(p => {
        const checked = selected.includes(p.id)
        return (
          <label
            key={p.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            style={{
              background: checked ? 'var(--t-surface-2)' : 'transparent',
              border: `1px solid ${checked ? 'var(--t-border-accent)' : 'transparent'}`,
            }}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                background: checked ? '#7c3aed' : 'var(--t-surface-2)',
                border: checked ? 'none' : '1px solid var(--t-border)',
              }}
            >
              {checked && <Check size={10} color="white" strokeWidth={3} />}
            </div>
            <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(p.id)} />
            <span className="text-sm flex-1 truncate" style={{ color: 'var(--t-text-primary)' }}>
              {p.name}
            </span>
            {p.salePrice > 0 && (
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--t-text-muted)' }}>
                R$ {p.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}

// ─── Unified create/edit modal ────────────────────────────────────────────────
function CatalogFormModal({
  initial,
  isEdit,
  products,
  onClose,
  onSave,
}: {
  initial?: Catalog
  isEdit?: boolean
  products: Product[]
  onClose: () => void
  onSave: (data: { name: string; mode: Catalog['mode']; logoUrl: string; productIds: string[] }) => void
}) {
  const [form, setForm] = useState({
    name:       initial?.name       ?? '',
    mode:       initial?.mode       ?? ('catalog' as Catalog['mode']),
    logoUrl:    initial?.logoUrl    ?? '',
    productIds: initial?.productIds ?? [] as string[],
  })

  const previewSlug = isEdit ? initial!.slug : generateSlug(form.name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form })
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Editar Catálogo' : 'Novo Catálogo'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Nome do catálogo">
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Catálogo Verão 2025"
            required
          />
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--t-text-muted)' }}>
            /catalogo/<span style={{ color: '#7c3aed' }}>{previewSlug || '...'}</span>
            {isEdit && (
              <span className="ml-2 font-sans not-italic opacity-50">(slug fixo)</span>
            )}
          </p>
        </FormField>

        <FormField label="Modo">
          <Select
            value={form.mode}
            onChange={e => setForm(f => ({ ...f, mode: e.target.value as Catalog['mode'] }))}
          >
            <option value="catalog">Catálogo com preço</option>
            <option value="portfolio">Portfólio (sem preço)</option>
          </Select>
        </FormField>

        <FormField label="URL da logo (opcional)">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--t-surface-2)' }}
            >
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <ImageIcon size={14} style={{ color: 'var(--t-text-muted)' }} />
              )}
            </div>
            <Input
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </FormField>

        <FormField label={`Produtos (${form.productIds.length} selecionados)`}>
          <ProductPicker
            products={products}
            selected={form.productIds}
            onChange={ids => setForm(f => ({ ...f, productIds: ids }))}
          />
        </FormField>

        <SubmitButton>{isEdit ? 'Salvar alterações' : 'Criar catálogo'}</SubmitButton>
      </form>
    </Modal>
  )
}

// ─── Catalog card ─────────────────────────────────────────────────────────────
function CatalogCard({
  catalog,
  onEdit,
  onDelete,
}: {
  catalog: Catalog
  onEdit: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const link = `${origin}/catalogo/${catalog.slug}`

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl flex flex-col gap-4 border transition-all hover:-translate-y-0.5"
      style={{
        background:  'var(--t-surface)',
        borderColor: 'var(--t-border)',
        boxShadow:   '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--t-surface-2)' }}
          >
            {catalog.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={catalog.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <BookOpen size={20} style={{ color: 'var(--t-text-muted)' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] truncate leading-tight" style={{ color: 'var(--t-text-primary)' }}>
              {catalog.name}
            </p>
            <p className="text-[11px] mt-0.5 font-mono truncate" style={{ color: 'var(--t-text-muted)' }}>
              /catalogo/{catalog.slug}
            </p>
          </div>
          <ModeBadge mode={catalog.mode} />
        </div>

        {/* Stats pill */}
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-secondary)' }}
          >
            <Store size={11} />
            {catalog.productIds.length} produto{catalog.productIds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Actions row */}
      <div
        className="px-4 pb-4 flex gap-2"
        style={{ borderTop: '1px solid var(--t-border)', paddingTop: '12px' }}
      >
        {/* Copy link */}
        <button
          onClick={copyLink}
          title="Copiar link público"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background:  copied ? '#10b9811a' : 'var(--t-surface-2)',
            color:       copied ? '#10b981'   : 'var(--t-text-secondary)',
            border:      `1px solid ${copied ? '#10b98133' : 'var(--t-border)'}`,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>

        {/* Open */}
        <a
          href={`/catalogo/${catalog.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir catálogo"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{
            background:  'var(--t-surface-2)',
            color:       'var(--t-text-secondary)',
            border:      '1px solid var(--t-border)',
          }}
        >
          <ExternalLink size={13} />
        </a>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Editar catálogo"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{
            background:  '#7c3aed1a',
            color:       '#7c3aed',
            border:      '1px solid #7c3aed33',
          }}
        >
          <Pencil size={13} />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Excluir catálogo"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          style={{
            background:  '#ef44441a',
            color:       '#ef4444',
            border:      '1px solid #ef444433',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-5 text-center"
      style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: 'var(--t-surface-2)' }}
      >
        <Store size={32} style={{ color: 'var(--t-text-muted)' }} />
      </div>
      <div>
        <p className="text-lg font-bold" style={{ color: 'var(--t-text-primary)' }}>
          Nenhum catálogo ainda
        </p>
        <p className="text-sm mt-1.5 max-w-xs mx-auto" style={{ color: 'var(--t-text-muted)' }}>
          Crie um link público para compartilhar seus produtos com clientes — sem login, sem complicação.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: '#7c3aed', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
      >
        <Plus size={15} />
        Criar primeiro catálogo
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CatalogsPage() {
  const { state, dispatch } = useStore()
  const { msg: toastMsg, show: showToast } = useToast()
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState<Catalog | null>(null)

  function handleCreate(data: { name: string; mode: Catalog['mode']; logoUrl: string; productIds: string[] }) {
    const catalog: Catalog = {
      id:         uid(),
      userId:     '',
      projectId:  state.projects[0]?.id ?? '',
      name:       data.name.trim(),
      slug:       generateSlug(data.name) || uid(),
      mode:       data.mode,
      productIds: data.productIds,
      logoUrl:    data.logoUrl.trim() || undefined,
      isPublic:   true,
      createdAt:  new Date().toISOString(),
    }
    dispatch({ type: 'ADD_CATALOG', payload: catalog })
    setCreating(false)
    showToast('Catálogo criado com sucesso!')
  }

  function handleEdit(data: { name: string; mode: Catalog['mode']; logoUrl: string; productIds: string[] }) {
    if (!editing) return
    const updated: Catalog = {
      ...editing,
      name:       data.name.trim(),
      mode:       data.mode,
      productIds: data.productIds,
      logoUrl:    data.logoUrl.trim() || undefined,
    }
    dispatch({ type: 'UPDATE_CATALOG', payload: updated })
    setEditing(null)
    showToast('Catálogo atualizado!')
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este catálogo? Esta ação não pode ser desfeita.')) return
    dispatch({ type: 'DELETE_CATALOG', payload: id })
    showToast('Catálogo excluído.')
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: 'var(--t-bg)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--t-text-primary)' }}>
            Catálogos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--t-text-muted)' }}>
            Links públicos para compartilhar seus produtos com clientes
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#7c3aed', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
        >
          <Plus size={16} />
          Novo Catálogo
        </button>
      </div>

      {/* Content */}
      {state.catalogs.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.catalogs.map(c => (
            <CatalogCard
              key={c.id}
              catalog={c}
              onEdit={() => setEditing(c)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {creating && (
        <CatalogFormModal
          products={state.products}
          onClose={() => setCreating(false)}
          onSave={handleCreate}
        />
      )}
      {editing && (
        <CatalogFormModal
          initial={editing}
          isEdit
          products={state.products}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  )
}
