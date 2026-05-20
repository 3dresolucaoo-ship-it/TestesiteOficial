'use client'

/**
 * app/crm/_components/CustomerRow.tsx
 * Linha individual da tabela de clientes (derivados de orders + leads ganhos).
 */

import { fmtBRL, fmtDate } from './helpers'

/** Shape do cliente derivado — espelho do tipo em page.tsx */
export interface DerivedClient {
  key:       string
  name:      string
  projectId: string
  origin:    string
  total:     number
  orders:    number
  lastDate:  string
}

interface CustomerRowProps {
  client:      DerivedClient
  projectName: string
}

export function CustomerRow({ client, projectName }: CustomerRowProps) {
  return (
    <tr className="border-b border-[#1c1c1c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
      <td className="px-4 py-3">
        <p className="text-[#ebebeb] text-sm font-medium">{client.name}</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-[#888888] text-sm">{projectName}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-[#888888] text-sm capitalize">{client.origin}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[#ebebeb] text-sm">{client.orders}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[#10b981] text-sm font-semibold">{fmtBRL(client.total)}</span>
      </td>
      <td className="px-4 py-3 text-right hidden sm:table-cell">
        <span className="text-[#555555] text-xs">{fmtDate(client.lastDate)}</span>
      </td>
    </tr>
  )
}
