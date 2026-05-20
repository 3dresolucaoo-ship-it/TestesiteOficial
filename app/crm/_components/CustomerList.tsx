'use client'

/**
 * app/crm/_components/CustomerList.tsx
 * Tabela de clientes derivados. Responsiva: colunas secundarias ocultadas em mobile.
 */

import { CustomerRow } from './CustomerRow'
import type { DerivedClient } from './CustomerRow'

interface CustomerListProps {
  clients:     DerivedClient[]
  projectName: (id: string) => string
}

export function CustomerList({ clients, projectName }: CustomerListProps) {
  if (clients.length === 0) return null

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Lista de clientes">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
                Cliente
              </th>
              <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
                Projeto
              </th>
              <th scope="col" className="text-left px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden md:table-cell">
                Origem
              </th>
              <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
                Pedidos
              </th>
              <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide">
                Total
              </th>
              <th scope="col" className="text-right px-4 py-3 text-[#555555] text-xs font-medium uppercase tracking-wide hidden sm:table-cell">
                Ultima compra
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <CustomerRow
                key={c.key}
                client={c}
                projectName={projectName(c.projectId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
