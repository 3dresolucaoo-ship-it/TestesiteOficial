import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Logs a Supabase error with full detail and re-throws it.
 * Use instead of bare `if (error) throw error` in every service.
 *
 * Usage:
 *   const { data, error } = await supabase.from('orders').insert(...)
 *   if (error) serviceError('ordersService.create', error)
 */
export function serviceError(context: string, error: PostgrestError): never {
  const parts = [
    `[${context}]`,
    error.message,
    error.details  ? `| details: ${error.details}` : '',
    error.hint     ? `| hint: ${error.hint}`        : '',
    error.code     ? `| code: ${error.code}`        : '',
  ].filter(Boolean).join(' ')

  console.error(parts)
  throw error
}

/**
 * Validates that all required fields are non-null/non-empty before an insert.
 * Throws a descriptive Error if any field is missing.
 *
 * Usage:
 *   validateRequired('ordersService.create', { id: o.id, projectId: o.projectId })
 */
export function validateRequired(context: string, fields: Record<string, unknown>): void {
  const missing = Object.entries(fields)
    .filter(([, v]) => v === null || v === undefined || v === '')
    .map(([k]) => k)

  if (missing.length > 0) {
    const msg = `[${context}] Missing required fields: ${missing.join(', ')}`
    console.error(msg)
    throw new Error(msg)
  }
}
