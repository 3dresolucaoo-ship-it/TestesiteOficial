/**
 * services/notifications.ts
 *
 * Service de notificacoes do sino no header do dashboard.
 *
 * Separacao de clientes:
 *   - Leitura (SELECT, UPDATE): supabase browser client com RLS.
 *     RLS policy "notifications_select_own" garante isolamento por user_id.
 *   - Escrita de notificacoes (INSERT): getSupabaseAdmin() com service_role.
 *     Notificacoes sao criadas por processos backend (triggers, crons),
 *     nao diretamente pelo usuario. Policy INSERT bloqueia authenticated/anon.
 *
 * Multi-tenant: TODA query filtra user_id + project_id.
 * Idempotencia em escritas criticas: nao aplicavel aqui (notificacoes sao
 * always-new, nao idempotentes por natureza — exceto futuros triggers com
 * chave unica por evento).
 */

import { supabase }        from '@/lib/supabaseClient'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { serviceError, validateRequired } from '@/lib/serviceError'
import { requireUserId }   from '@/lib/getUser'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'order_new'
  | 'order_late'
  | 'stock_low'
  | 'invoice_due'
  | 'lead_new'
  | 'meta_hit'
  | 'filament_critical'

export interface Notification {
  id:         string
  userId:     string
  projectId:  string
  type:       NotificationType
  title:      string
  body?:      string
  link?:      string
  read:       boolean
  createdAt:  string
  readAt?:    string
}

export interface NewNotificationInput {
  userId:    string
  projectId: string
  type:      NotificationType
  title:     string
  body?:     string
  link?:     string
}

// ─── Mapeamento DB <> TS ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDB(r: any): Notification {
  return {
    id:        r.id,
    userId:    r.user_id,
    projectId: r.project_id,
    type:      r.type as NotificationType,
    title:     r.title,
    body:      r.body      ?? undefined,
    link:      r.link      ?? undefined,
    read:      r.read,
    createdAt: r.created_at,
    readAt:    r.read_at   ?? undefined,
  }
}

// ─── Queries de leitura (RLS browser client) ──────────────────────────────────

/**
 * Lista notificacoes nao-lidas do usuario no projeto.
 * Usa o indice parcial idx_notifications_user_unread (WHERE read = false).
 * Limit padrao 20 — o sino mostra dropdown curto.
 */
export async function listUnreadNotifications(
  userId: string,
  projectId: string,
  limit = 20,
): Promise<Notification[]> {
  validateRequired('notificationsService.listUnreadNotifications', { userId, projectId })

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) serviceError('notificationsService.listUnreadNotifications', error)
  return (data ?? []).map(fromDB)
}

/**
 * Retorna total de notificacoes nao-lidas.
 * Usado pelo badge numerado no sino (exibe ate 99+).
 */
export async function getUnreadCount(
  userId: string,
  projectId: string,
): Promise<number> {
  validateRequired('notificationsService.getUnreadCount', { userId, projectId })

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('read', false)

  if (error) serviceError('notificationsService.getUnreadCount', error)
  return count ?? 0
}

// ─── Mutacoes (RLS browser client — usuario atualiza os proprios) ─────────────

/**
 * Marca uma notificacao especifica como lida.
 * Filtra user_id para garantir isolamento mesmo sem RLS UPDATE ser row-level.
 */
export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  validateRequired('notificationsService.markAsRead', { notificationId, userId })

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)  // defesa extra alem da RLS

  if (error) serviceError('notificationsService.markAsRead', error)
}

/**
 * Marca todas as notificacoes do usuario naquele projeto como lidas.
 * Chamado pelo botao "Marcar tudo como lido" no dropdown do sino.
 */
export async function markAllAsRead(
  userId: string,
  projectId: string,
): Promise<void> {
  validateRequired('notificationsService.markAllAsRead', { userId, projectId })

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('read', false)

  if (error) serviceError('notificationsService.markAllAsRead', error)
}

// ─── Escrita de notificacoes (service_role — backend apenas) ─────────────────

/**
 * Cria uma notificacao nova.
 *
 * SOMENTE para uso em codigo server-side:
 *   - Server Actions
 *   - API routes (/api/**)
 *   - Funcoes de trigger / cron
 *
 * NUNCA chamar de um componente cliente.
 * Usa service_role (getSupabaseAdmin) porque a policy INSERT bloqueia
 * authenticated/anon — notificacoes sao produzidas pelo sistema, nao
 * pelo usuario.
 */
export async function createNotification(
  input: NewNotificationInput,
): Promise<Notification> {
  validateRequired('notificationsService.createNotification', {
    userId:    input.userId,
    projectId: input.projectId,
    type:      input.type,
    title:     input.title,
  })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('notifications')
    .insert({
      user_id:    input.userId,
      project_id: input.projectId,
      type:       input.type,
      title:      input.title,
      body:       input.body    ?? null,
      link:       input.link    ?? null,
    })
    .select()
    .single()

  if (error) serviceError('notificationsService.createNotification', error)
  return fromDB(data)
}

/**
 * Helper: requireUserId() + listUnreadNotifications em uma chamada.
 * Uso em Server Components que ja tem o projectId disponivel.
 */
export async function getUnreadNotificationsForCurrentUser(
  projectId: string,
  limit = 20,
): Promise<Notification[]> {
  const userId = await requireUserId()
  return listUnreadNotifications(userId, projectId, limit)
}

/**
 * Helper: requireUserId() + getUnreadCount em uma chamada.
 */
export async function getUnreadCountForCurrentUser(
  projectId: string,
): Promise<number> {
  const userId = await requireUserId()
  return getUnreadCount(userId, projectId)
}
