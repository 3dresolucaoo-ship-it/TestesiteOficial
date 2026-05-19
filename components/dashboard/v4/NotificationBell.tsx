'use client'

/**
 * NotificationBell.tsx — Sino funcional do header V4.8
 *
 * Comportamento:
 * - Clique no botão abre/fecha o dropdown de notificações
 * - Badge numérico com contador de não-lidas (mostra "9+" se > 9)
 * - Lista até 10 notificações não-lidas do usuário/projeto
 * - Botão "Marcar todas como lidas" que atualiza estado local imediatamente
 * - Empty state PT-BR formal quando não há notificações
 * - Fecha ao clicar fora (click-outside listener)
 * - Fecha com Escape
 *
 * Multi-tenant: user_id + project_id em todas as queries (via service).
 * Server/Client boundary: usa supabase browser client (via service) — seguro
 * em client component. createNotification (service_role) NÃO é chamada aqui.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  listUnreadNotifications,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '@/services/notifications'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LABEL_BY_TYPE: Record<Notification['type'], string> = {
  order_new:          'Novo pedido',
  order_late:         'Pedido atrasado',
  stock_low:          'Estoque baixo',
  invoice_due:        'Cobrança pendente',
  lead_new:           'Novo lead',
  meta_hit:           'Meta atingida',
  filament_critical:  'Filamento crítico',
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const min  = Math.floor(diff / 60_000)
  if (min < 1)  return 'agora'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  userId:    string
  projectId: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function NotificationBell({ userId, projectId }: NotificationBellProps) {
  const router = useRouter()

  const [isOpen,         setIsOpen]         = useState(false)
  const [notifications,  setNotifications]  = useState<Notification[]>([])
  const [unreadCount,    setUnreadCount]     = useState(0)
  const [loading,        setLoading]         = useState(false)
  const [markingAll,     setMarkingAll]      = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!userId || !projectId) return
    setLoading(true)
    try {
      const data = await listUnreadNotifications(userId, projectId, 10)
      setNotifications(data)
      setUnreadCount(data.length)
    } catch {
      // Silencia erro de rede — sino continua funcionando sem badge
    } finally {
      setLoading(false)
    }
  }, [userId, projectId])

  // Carrega contagem inicial (sem abrir dropdown).
  // requestAnimationFrame garante que o setState ocorre após o commit,
  // evitando cascata síncrona (padrão DashboardLayout).
  useEffect(() => {
    const raf = requestAnimationFrame(() => { void fetchNotifications() })
    return () => cancelAnimationFrame(raf)
  }, [fetchNotifications])

  // ── Abrir/fechar ──────────────────────────────────────────────────────────

  const open = useCallback(() => {
    setIsOpen(true)
    void fetchNotifications()
  }, [fetchNotifications])

  const close = useCallback(() => setIsOpen(false), [])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  // Click-outside
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, close])

  // Escape fecha
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  // ── Ações ─────────────────────────────────────────────────────────────────

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId || !projectId || markingAll) return
    setMarkingAll(true)
    try {
      await markAllAsRead(userId, projectId)
      setNotifications([])
      setUnreadCount(0)
    } catch {
      // Silencia — usuário pode tentar novamente
    } finally {
      setMarkingAll(false)
    }
  }, [userId, projectId, markingAll])

  const handleNotificationClick = useCallback(async (n: Notification) => {
    // Marca como lida localmente antes de navegar (UX imediata)
    setNotifications(prev => prev.filter(item => item.id !== n.id))
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await markAsRead(n.id, userId)
    } catch {
      // Falha silenciosa — RLS vai recalcular na próxima abertura
    }

    close()

    if (n.link) {
      router.push(n.link)
    }
  }, [userId, router, close])

  // ── Badge label ───────────────────────────────────────────────────────────

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      {/* Botão sino */}
      <button
        className="icon-btn"
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notificações — ${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
            : 'Notificações'
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={toggle}
        style={{ position: 'relative' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position:      'absolute',
              top:           '-2px',
              right:         '-2px',
              minWidth:      '16px',
              height:        '16px',
              padding:       '0 4px',
              borderRadius:  '9999px',
              background:    '#D97757',
              color:         '#fff',
              fontSize:      '10px',
              fontWeight:    700,
              lineHeight:    '16px',
              textAlign:     'center',
              letterSpacing: '0',
              pointerEvents: 'none',
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Painel de notificações"
          style={{
            position:     'absolute',
            top:          'calc(100% + 8px)',
            right:        0,
            width:        '320px',
            borderRadius: '12px',
            background:   'hsl(220 14% 11%)',
            border:       '1px solid rgba(255,255,255,0.06)',
            boxShadow:    '0 16px 40px rgba(0,0,0,0.45)',
            zIndex:       200,
            overflow:     'hidden',
          }}
        >
          {/* Header do dropdown */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '12px 16px',
              borderBottom:   '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(220 10% 90%)' }}>
              Notificações
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => { void handleMarkAllAsRead() }}
                disabled={markingAll}
                style={{
                  background: 'transparent',
                  border:     'none',
                  cursor:     markingAll ? 'default' : 'pointer',
                  fontSize:   '11px',
                  color:      markingAll ? 'hsl(220 10% 50%)' : 'hsl(173 58% 48%)',
                  padding:    '2px 4px',
                  borderRadius: '4px',
                  transition: 'color 120ms ease',
                }}
              >
                {markingAll ? 'Aguarde...' : 'Marcar todas como lidas'}
              </button>
            )}
          </div>

          {/* Lista */}
          <div
            style={{
              maxHeight:  '360px',
              overflowY:  'auto',
              padding:    notifications.length === 0 ? '32px 16px' : '4px 0',
            }}
          >
            {loading && notifications.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'hsl(220 10% 50%)' }}>
                Carregando...
              </p>
            ) : notifications.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'hsl(220 10% 50%)' }}>
                Sem notificações por aqui.
              </p>
            ) : (
              <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => { void handleNotificationClick(n) }}
                      style={{
                        display:    'block',
                        width:      '100%',
                        textAlign:  'left',
                        background: 'transparent',
                        border:     'none',
                        cursor:     'pointer',
                        padding:    '10px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {/* Tipo + tempo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontSize:   '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color:      'hsl(173 58% 45%)',
                          }}
                        >
                          {LABEL_BY_TYPE[n.type] ?? n.type}
                        </span>
                        <span style={{ fontSize: '10px', color: 'hsl(220 10% 45%)' }}>
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      {/* Título */}
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'hsl(220 10% 85%)' }}>
                        {n.title}
                      </p>

                      {/* Body opcional */}
                      {n.body && (
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'hsl(220 10% 55%)' }}>
                          {n.body}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
