'use client'

import { useState, useEffect, useMemo } from 'react'
import { portfoliosService, portfolioItemsService } from '@/services/portfolios'
import { generateSlug } from '@/services/catalogs'
import { uid } from '@/lib/store'
import type { Portfolio, PortfolioItem } from '@/lib/types'
import {
  Plus, Copy, ExternalLink, Trash2, User, ChevronDown, ChevronUp,
  Check, Image as ImageIcon, Phone, BookOpen,
} from 'lucide-react'
import { Modal, FormField, Input, Textarea, SubmitButton } from '@/components/Modal'

// ─── Portfolio card ───────────────────────────────────────────────────────────
function PortfolioCard({
  portfolio,
  onDelete,
  onAddItem,
}: {
  portfolio: Portfolio
  onDelete: () => void
  onAddItem: (p: Portfolio) => void
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio.slug}`

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function toggleExpand() {
    if (!expanded && items.length === 0) {
      setLoadingItems(true)
      try {
        const data = await portfolioItemsService.listByPortfolio(portfolio.id)
        setItems(data)
      } finally {
        setLoadingItems(false)
      }
    }
    setExpanded(e => !e)
  }

  return (
    <div
      className="rounded-xl border flex flex-col gap-0 overflow-hidden"
      style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {portfolio.avatarUrl ? (
          <img
            src={portfolio.avatarUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--t-surface-2)' }}
          >
            <User size={18} style={{ color: 'var(--t-text-muted)' }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--t-text-primary)' }}>
            {portfolio.name}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t-text-muted)' }}>
            /{portfolio.slug}
          </p>
          {portfolio.bio && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--t-text-secondary)' }}>
              {portfolio.bio}
            </p>
          )}
          {portfolio.whatsapp && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#10b981' }}>
              <Phone size={10} />
              {portfolio.whatsapp}
            </p>
          )}
          {portfolio.catalogSlug && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#a78bfa' }}>
              <BookOpen size={10} />
              catálogo: {portfolio.catalogSlug}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: copied ? '#10b9811a' : 'var(--t-surface-2)',
            color: copied ? '#10b981' : 'var(--t-text-secondary)',
            border: `1px solid ${copied ? '#10b98133' : 'var(--t-border)'}`,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
        <a
          href={`/portfolio/${portfolio.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: 'var(--t-surface-2)',
            color: 'var(--t-text-secondary)',
            border: '1px solid var(--t-border)',
          }}
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={() => onAddItem(portfolio)}
          className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: '#7c3aed1a',
            color: '#a78bfa',
            border: '1px solid #7c3aed33',
          }}
          title="Adicionar trabalho"
        >
          <Plus size={13} />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center px-3 py-2 rounded-lg text-xs transition-colors"
          style={{
            background: '#ef44441a',
            color: '#ef4444',
            border: '1px solid #ef444433',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expand items */}
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between px-4 py-2.5 text-xs border-t transition-colors"
        style={{
          borderColor: 'var(--t-border)',
          color: 'var(--t-text-muted)',
          background: 'var(--t-surface-2)',
        }}
      >
        <span>{items.length > 0 ? `${items.length} trabalho(s)` : 'Ver trabalhos'}</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {expanded && (
        <div className="px-4 py-3 flex flex-col gap-2">
          {loadingItems && (
            <p className="text-xs" style={{ color: 'var(--t-text-muted)' }}>Carregando...</p>
          )}
          {!loadingItems && items.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--t-text-muted)' }}>
              Nenhum trabalho ainda. Clique em + para adicionar.
            </p>
          )}
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg"
              style={{ background: 'var(--t-surface-2)' }}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--t-border)' }}
                >
                  <ImageIcon size={14} style={{ color: 'var(--t-text-muted)' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--t-text-primary)' }}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs truncate" style={{ color: 'var(--t-text-muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingPortfolio, setCreatingPortfolio] = useState(false)
  const [addingItemTo, setAddingItemTo] = useState<Portfolio | null>(null)

  const [portfolioForm, setPortfolioForm] = useState({
    name: '', bio: '', avatarUrl: '', whatsapp: '', catalogSlug: '',
  })
  const [itemForm, setItemForm] = useState({
    title: '', description: '', imageUrl: '',
  })

  const previewSlug = useMemo(() => generateSlug(portfolioForm.name), [portfolioForm.name])

  useEffect(() => {
    portfoliosService.list()
      .then(setPortfolios)
      .finally(() => setLoading(false))
  }, [])

  async function handleCreatePortfolio(e: React.FormEvent) {
    e.preventDefault()
    if (!portfolioForm.name.trim()) return

    const portfolio: Portfolio = {
      id:          uid(),
      userId:      '',
      name:        portfolioForm.name.trim(),
      slug:        previewSlug || uid(),
      bio:         portfolioForm.bio.trim() || undefined,
      avatarUrl:   portfolioForm.avatarUrl.trim() || undefined,
      whatsapp:    portfolioForm.whatsapp.trim() || undefined,
      catalogSlug: portfolioForm.catalogSlug.trim() || undefined,
      isPublic:    true,
      createdAt:   new Date().toISOString(),
    }

    try {
      await portfoliosService.create(portfolio)
      setPortfolios(prev => [portfolio, ...prev])
      setPortfolioForm({ name: '', bio: '', avatarUrl: '', whatsapp: '', catalogSlug: '' })
      setCreatingPortfolio(false)
    } catch (err) {
      console.error('[createPortfolio]', err)
      alert('Erro ao criar portfólio. Veja o console.')
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!addingItemTo || !itemForm.title.trim()) return

    const item: PortfolioItem = {
      id:          uid(),
      userId:      '',
      portfolioId: addingItemTo.id,
      title:       itemForm.title.trim(),
      description: itemForm.description.trim() || undefined,
      imageUrl:    itemForm.imageUrl.trim() || undefined,
      sortOrder:   0,
      createdAt:   new Date().toISOString(),
    }

    try {
      await portfolioItemsService.create(item)
      setItemForm({ title: '', description: '', imageUrl: '' })
      setAddingItemTo(null)
    } catch (err) {
      console.error('[addItem]', err)
      alert('Erro ao adicionar trabalho. Veja o console.')
    }
  }

  async function handleDeletePortfolio(id: string) {
    if (!confirm('Excluir este portfólio e todos os seus trabalhos?')) return
    try {
      await portfoliosService.delete(id)
      setPortfolios(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('[deletePortfolio]', err)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: 'var(--t-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--t-text-primary)' }}>
            Portfólios
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t-text-muted)' }}>
            Páginas públicas para mostrar seus trabalhos
          </p>
        </div>
        <button
          onClick={() => setCreatingPortfolio(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: '#7c3aed' }}
        >
          <Plus size={16} />
          Novo Portfólio
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
        </div>
      ) : portfolios.length === 0 ? (
        <div
          className="rounded-2xl border flex flex-col items-center justify-center py-16 gap-3"
          style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--t-surface-2)' }}
          >
            <User size={24} style={{ color: 'var(--t-text-muted)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--t-text-secondary)' }}>
            Nenhum portfólio ainda
          </p>
          <button
            onClick={() => setCreatingPortfolio(true)}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#7c3aed' }}
          >
            <Plus size={15} />
            Criar portfólio
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map(p => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              onDelete={() => handleDeletePortfolio(p.id)}
              onAddItem={setAddingItemTo}
            />
          ))}
        </div>
      )}

      {/* Create portfolio modal */}
      {creatingPortfolio && (
        <Modal
          title="Novo Portfólio"
          onClose={() => { setCreatingPortfolio(false); setPortfolioForm({ name: '', bio: '', avatarUrl: '', whatsapp: '', catalogSlug: '' }) }}
        >
          <form onSubmit={handleCreatePortfolio} className="flex flex-col gap-4">
            <FormField label="Nome">
              <Input
                value={portfolioForm.name}
                onChange={e => setPortfolioForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: João Ribeiro 3D"
                required
              />
              {portfolioForm.name && (
                <p className="text-xs mt-1" style={{ color: 'var(--t-text-muted)' }}>
                  Link: /portfolio/<span style={{ color: '#7c3aed' }}>{previewSlug}</span>
                </p>
              )}
            </FormField>

            <FormField label="Bio (opcional)">
              <Textarea
                value={portfolioForm.bio}
                onChange={e => setPortfolioForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Especialista em impressão 3D sob demanda..."
              />
            </FormField>

            <FormField label="URL do Avatar (opcional)">
              <Input
                value={portfolioForm.avatarUrl}
                onChange={e => setPortfolioForm(f => ({ ...f, avatarUrl: e.target.value }))}
                placeholder="https://..."
              />
            </FormField>

            <FormField label="WhatsApp (opcional)">
              <Input
                value={portfolioForm.whatsapp}
                onChange={e => setPortfolioForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="5511999999999"
              />
            </FormField>

            <FormField label="Slug do catálogo vinculado (opcional)">
              <Input
                value={portfolioForm.catalogSlug}
                onChange={e => setPortfolioForm(f => ({ ...f, catalogSlug: e.target.value }))}
                placeholder="meu-catalogo"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--t-text-muted)' }}>
                Aparecerá como botão "Ver produtos" no portfólio público.
              </p>
            </FormField>

            <SubmitButton>Criar portfólio</SubmitButton>
          </form>
        </Modal>
      )}

      {/* Add item modal */}
      {addingItemTo && (
        <Modal
          title={`Adicionar trabalho — ${addingItemTo.name}`}
          onClose={() => { setAddingItemTo(null); setItemForm({ title: '', description: '', imageUrl: '' }) }}
        >
          <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <FormField label="Título do trabalho">
              <Input
                value={itemForm.title}
                onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Suporte para câmera GoPro"
                required
              />
            </FormField>

            <FormField label="Descrição (opcional)">
              <Textarea
                value={itemForm.description}
                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detalhes sobre o trabalho..."
              />
            </FormField>

            <FormField label="URL da imagem (opcional)">
              <Input
                value={itemForm.imageUrl}
                onChange={e => setItemForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </FormField>

            <SubmitButton>Adicionar trabalho</SubmitButton>
          </form>
        </Modal>
      )}
    </div>
  )
}
