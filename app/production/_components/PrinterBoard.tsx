'use client'

/**
 * PrinterBoard.tsx — Board visual das impressoras (Bambu Lab + Flashforge).
 *
 * Extraido de app/production/page.tsx (2026-05-20).
 * Cada card mostra estado em tempo real: livre / imprimindo / fila.
 * ElapsedTimer e instanciado aqui quando ha impressao ativa.
 *
 * Mobile: grid 1 coluna. Desktop (sm+): grid 2 colunas.
 * O startTimes e mantido no estado local do board — reseta na navegacao,
 * comportamento identico ao original (nao quebre essa caracteristica).
 */

import { useState, useEffect } from 'react'
import { CheckCircle2, Timer, Activity, Printer } from 'lucide-react'
import type { ProductionItem, ProductionStatus, PrinterName } from './types'
import { PRINTER_CONFIG }   from './helpers'
import { ElapsedTimer }     from './ElapsedTimer'

interface PrinterBoardProps {
  production:     ProductionItem[]
  onStatusChange: (item: ProductionItem, status: ProductionStatus) => void
}

export function PrinterBoard({ production, onStatusChange }: PrinterBoardProps) {
  // startTimes via useState: o Effect registra novos IDs em andamento sem
  // mutar durante render. Reseta na navegacao — comportamento igual ao original.
  const [startTimes, setStartTimes] = useState<Record<string, number>>({})

  // Registra timestamps dos itens que passam a "printing".
  // useEffect = seguro para side effects (Date.now() permitido aqui).
  useEffect(() => {
    const printing = production.filter((p) => p.status === 'printing')
    if (printing.length === 0) return

    setStartTimes((prev) => {
      const next: Record<string, number> = { ...prev }
      let changed = false
      for (const p of printing) {
        if (!next[p.id]) {
          next[p.id] = Date.now()
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [production])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {(['bambu', 'flashforge'] as PrinterName[]).map((printer) => {
        const running = production.find(
          (p) => p.printer === printer && p.status === 'printing',
        )
        const queued = production.filter(
          (p) => p.printer === printer && p.status === 'waiting',
        ).length
        const total = production.filter(
          (p) => p.printer === printer && p.status !== 'done',
        ).length
        const { label, accent } = PRINTER_CONFIG[printer]

        return (
          <div
            key={printer}
            className="relative overflow-hidden bg-[rgba(255,255,255,0.025)] border rounded-xl p-5 transition-all"
            style={{
              borderColor: running ? `${accent}44` : 'rgba(255,255,255,0.07)',
              boxShadow:   running ? `0 0 24px ${accent}18` : 'none',
            }}
            aria-label={`Impressora ${label}: ${running ? 'imprimindo' : queued > 0 ? 'com fila' : 'livre'}`}
          >
            {/* Glow radial quando imprimindo */}
            {running && (
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${accent}, transparent 70%)`,
                }}
                aria-hidden="true"
              />
            )}

            <div className="relative">
              {/* Cabecalho do card */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      running
                        ? 'animate-pulse shadow-[0_0_8px_currentColor]'
                        : queued > 0
                        ? ''
                        : 'opacity-30'
                    }`}
                    style={{
                      backgroundColor: running
                        ? accent
                        : queued > 0
                        ? '#f59e0b'
                        : '#555566',
                      boxShadow: running ? `0 0 8px ${accent}` : 'none',
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: running ? accent : '#f0f0f5' }}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Printer size={12} className="text-[#555566]" aria-hidden="true" />
                  <span className="text-[#555566] text-xs">{total} restantes</span>
                </div>
              </div>

              {/* Trabalho em andamento ou livre */}
              {running ? (
                <div className="space-y-2">
                  <p className="text-[#f0f0f5] text-sm font-medium truncate">
                    {running.item}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Timer size={11} className="text-[#555566]" aria-hidden="true" />
                      <span className="text-[#555566] text-xs">
                        {running.estimatedHours}h estimado
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity size={11} style={{ color: accent }} aria-hidden="true" />
                      <ElapsedTimer
                        startedAt={startTimes[running.id] ?? 0}
                      />
                    </div>
                  </div>
                  {running.clientName && (
                    <p className="text-[#444455] text-xs">{running.clientName}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => onStatusChange(running, 'done')}
                    className="mt-1 flex items-center gap-1.5 text-[#10b981] text-xs font-medium hover:text-[#34d399] transition-colors"
                    aria-label={`Finalizar impressao de ${running.item}`}
                  >
                    <CheckCircle2 size={12} aria-hidden="true" /> Finalizar
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[#444455] text-sm">Livre</p>
                  {queued > 0 && (
                    <p className="text-[#555566] text-xs mt-1">{queued} na fila</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
