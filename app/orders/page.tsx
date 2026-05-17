'use client'

import { useState, useMemo } from 'react'
import { useStore, uid } from '@/lib/store'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import type { Order, OrderStatus } from '@/lib/types'
import { Plus, Pencil, Trash2, MoreHorizontal, Cpu, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { calcUnitCost } from '@/core/analytics/productionEngine'

// ─── Componentes extraídos (refactor 2026-05-16 — 695→~415 linhas, -40%) ────
import {
  ORDER_STATUS_CONFIG,
  ORDER_ORIGIN_LABELS,
  ORDER_ORIGIN_COLORS,
  type OrderFormData,
} from './_components/helpers'
import { OrderStatusBadge } from './_components/Badge'
import { OrderForm } from './_components/OrderForm'

// ─── Page ─────────────────────────────────────────────────────────────────────
const ALL = 'all'

export default function OrdersPage() {
  const { state, dispatch, loading } = useStore()
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState<Order | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [filter,        setFilter]        = useState<OrderStatus | typeof ALL>(ALL)
  const [filterProject, setFilterProject] = useState<string>('all')

  // ── Helpers ────────────────────────────────────────────────────────────────
  const byProject   = filterProject === 'all' ? state.orders : state.orders.filter(o => o.projectId === filterProject)
  const filtered    = filter === ALL ? byProject : byProject.filter(o => o.status === filter)
  const sorted      = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const projectName = (id: string) => state.projects.find(p => p.id === id)?.name ?? '—'
  const productName = (id: string | undefined) => id ? state.products.find(p => p.id === id)?.name : undefined

  const statusCounts = useMemo(() =>
    Object.keys(ORDER_STATUS_CONFIG).reduce((acc, k) => {
      acc[k] = byProject.filter(o => o.status === k).length
      return acc
    }, {} as Record<string, number>),
  [byProject])

  // ── Create ─────────────────────────────────────────────────────────────────
  // In Supabase mode: dispatch(ADD_ORDER) → syncAction → processNewOrder handles
  //   all side effects (production task, transaction, inventory decrement) and
  //   rawDispatches each result to update local state.
  // In local mode: reducer is pure, so we dispatch side effects manually here.
  function handleCreate(data: OrderFormData) {
    const newOrderId = uid()
    const product    = data.productId ? state.products.find(p => p.id === data.productId) : undefined
    const productionCost = product
      ? calcUnitCost(product, state.inventory).totalCost
      : undefined

    const order: Order = {
      id:              newOrderId,
      projectId:       data.projectId,
      clientName:      data.clientName,
      origin:          data.origin,
      item:            data.item,
      value:           parseFloat(data.value) || 0,
      status:          data.status,
      date:            data.date,
      inventoryItemId: data.inventoryItemId || undefined,
      qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
      productId:       product?.id,
      productionCost,
    }

    dispatch({ type: 'ADD_ORDER', payload: order })

    // Local-only side effects (syncAction handles these in Supabase mode)
    if (!isSupabaseConfigured) {
      if (product) {
        dispatch({
          type: 'ADD_PRODUCTION',
          payload: {
            id:             uid(),
            orderId:        newOrderId,
            clientName:     data.clientName,
            item:           product.name,
            printer:        'bambu',
            status:         'waiting',
            estimatedHours: product.printTimeHours,
            priority:       state.production.length + 1,
          },
        })
      }
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  // processOrderUpdate (called by syncAction) handles the paid-transition side
  // effects in Supabase mode. In local mode, we rely on the reducer being pure
  // (no auto-side-effects), so we accept that local mode won't auto-apply
  // inventory/transaction effects on edit — which is acceptable since local mode
  // is only used for development without a real database.
  function handleEdit(data: OrderFormData) {
    if (!editing) return
    const product = data.productId ? state.products.find(p => p.id === data.productId) : undefined
    const productionCost = product
      ? calcUnitCost(product, state.inventory).totalCost
      : editing.productionCost  // preserve original cost if template removed

    dispatch({
      type: 'UPDATE_ORDER',
      payload: {
        ...editing,
        projectId:       data.projectId,
        clientName:      data.clientName,
        origin:          data.origin,
        item:            data.item,
        value:           parseFloat(data.value) || 0,
        status:          data.status,
        date:            data.date,
        inventoryItemId: data.inventoryItemId || undefined,
        qtyUsed:         data.inventoryItemId ? (parseFloat(data.qtyUsed) || 1) : undefined,
        productId:       product?.id,
        productionCost,
      },
    })
    setEditing(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_ORDER', payload: id })
    setMenuOpen(null)
  }

  if (loading) return null
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#ebebeb] font-semibold text-lg">Vendas</h2>
          <p className="text-[#555555] text-sm">
            {byProject.length} pedidos · R${' '}
            {byProject
              .filter(o => o.status === 'paid' || o.status === 'delivered')
              .reduce((s, o) => s + o.value, 0)
              .toFixed(0)}{' '}
            faturados
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Novo Pedido
        </button>
      </div>

      {/* Project filter */}
      <select
        value={filterProject}
        onChange={e => setFilterProject(e.target.value)}
        className="bg-[#141414] border border-[#2a2a2a] text-[#ebebeb] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7c3aed] transition-colors"
      >
        <option value="all">Todos os projetos</option>
        {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilter(ALL)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === ALL
              ? 'bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]'
              : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'
          }`}
        >
          Todos <span className="text-[#555555]">{byProject.length}</span>
        </button>
        {(Object.entries(ORDER_STATUS_CONFIG) as [OrderStatus, typeof ORDER_STATUS_CONFIG[OrderStatus]][]).map(([s, { label }]) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-[#7c3aed1a] text-[#a78bfa] border border-[#7c3aed33]'
                : 'text-[#888888] hover:text-[#ebebeb] border border-transparent'
            }`}
          >
            {label} <span className="text-[#555555]">{statusCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* ── Mobile cards ─────────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {sorted.length === 0 && (
          /* Sofia (CS) 2026-05-16: empty state customizado mobile - tom maker BR */
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <ShoppingCart size={32} className="text-[hsl(173_30%_57%)] mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              Sua primeira venda está esperando
            </h3>
            <p className="text-xs text-foreground/65 leading-relaxed max-w-xs">
              Registre pedidos do WhatsApp, Instagram ou Mercado Livre aqui — o Hayzer conecta o pedido ao produto e desconta o filamento.
            </p>
          </div>
        )}
        {sorted.map(o => {
          const pName = productName(o.productId)
          return (
            <div key={o.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-[#ebebeb] font-medium text-sm">{o.clientName}</p>
                  <p className="text-[#555555] text-xs mt-0.5 truncate">{o.item}</p>
                  {pName && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Cpu size={10} className="text-[#7c3aed]" />
                      <span className="text-[#7c3aed] text-[10px]">{pName}</span>
                    </div>
                  )}
                  <p className="text-[#3a3a3a] text-xs mt-0.5">
                    {projectName(o.projectId)} · {new Date(o.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#ebebeb] font-semibold text-sm">R$ {o.value.toFixed(2)}</p>
                  {o.productionCost != null && (
                    <p className="text-[#555555] text-[10px]">custo R$ {o.productionCost.toFixed(2)}</p>
                  )}
                  <div className="mt-1"><OrderStatusBadge status={o.status} /></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#1c1c1c] pt-3">
                <span className={`text-xs font-medium ${ORDER_ORIGIN_COLORS[o.origin]}`}>{ORDER_ORIGIN_LABELS[o.origin]}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(o)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] text-xs transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef44441a] text-xs transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop table ──────────────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          /* Sofia (CS) 2026-05-16: empty state desktop com texto maker BR + benefício */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-6">
            <div
              className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'hsl(173 58% 28% / 0.12)',
                border: '1px solid hsl(173 58% 28% / 0.25)',
              }}
            >
              <ShoppingCart size={28} className="text-[hsl(173_30%_57%)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
              Sua primeira venda está esperando
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
              Registre pedidos do WhatsApp, Instagram ou Mercado Livre aqui.
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              O Hayzer conecta o pedido ao produto e desconta o filamento do estoque automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Projeto</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">Origem</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">Item</th>
                  <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Valor</th>
                  <th className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden lg:table-cell">Custo</th>
                  <th className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">Status</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(o => {
                  const margin = o.productionCost != null && o.value > 0
                    ? ((o.value - o.productionCost) / o.value) * 100
                    : null
                  return (
                    <tr key={o.id} className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[#ebebeb] text-sm font-medium">{o.clientName}</p>
                        <p className="text-[#555555] text-xs">{new Date(o.date).toLocaleDateString('pt-BR')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#888888] text-sm">{projectName(o.projectId)}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-sm font-medium ${ORDER_ORIGIN_COLORS[o.origin]}`}>{ORDER_ORIGIN_LABELS[o.origin]}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div>
                          <span className="text-[#888888] text-sm truncate max-w-[180px] block">{o.item}</span>
                          {o.productId && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Cpu size={10} className="text-[#7c3aed]" />
                              <span className="text-[#7c3aed] text-[10px]">produto vinculado</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#ebebeb] text-sm font-semibold">R$ {o.value.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {o.productionCost != null ? (
                          <div>
                            <span className="text-[#555555] text-xs">R$ {o.productionCost.toFixed(2)}</span>
                            {margin !== null && (
                              <p className={`text-[10px] font-medium ${
                                margin >= 40 ? 'text-[#10b981]' : margin >= 20 ? 'text-[#a78bfa]' : 'text-[#f59e0b]'
                              }`}>
                                {margin.toFixed(0)}% margem
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#3a3a3a] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-2 py-3 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)}
                          className="p-1.5 text-[#555555] hover:text-[#ebebeb] transition-colors rounded-lg hover:bg-[#2a2a2a]"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === o.id && (
                          <div className="absolute right-2 top-10 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl z-10 w-36 overflow-hidden">
                            <button
                              onClick={() => { setEditing(o); setMenuOpen(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888888] hover:text-[#ebebeb] hover:bg-[#2a2a2a] transition-colors"
                            >
                              <Pencil size={13} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef44441a] transition-colors"
                            >
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Novo Pedido" onClose={() => setCreating(false)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            onSave={handleCreate}
            onClose={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar Pedido" onClose={() => setEditing(null)}>
          <OrderForm
            projects={state.projects}
            inventory={state.inventory}
            products={state.products}
            initial={{
              projectId:       editing.projectId,
              clientName:      editing.clientName,
              origin:          editing.origin,
              item:            editing.item,
              value:           String(editing.value),
              status:          editing.status,
              date:            editing.date,
              inventoryItemId: editing.inventoryItemId ?? '',
              qtyUsed:         String(editing.qtyUsed ?? 1),
              productId:       editing.productId ?? '',
            }}
            onSave={handleEdit}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
