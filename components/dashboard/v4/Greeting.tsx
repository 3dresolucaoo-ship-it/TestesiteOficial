'use client'

/**
 * Greeting.tsx — Saudação personalizada com horário dinâmico
 *
 * Referência HTML: linhas 2627-2631 (v4-hibrido.html)
 * Classes: .greeting · .greeting-eyebrow · .greeting-text
 *
 * Mecanismo de dopamina #8 (endowment effect): maker sente que o produto
 * é DELE — não é um dashboard genérico.
 *
 * Server Component não pode ser usado aqui: Date() precisa do runtime
 * do browser para horário local correto (sem hidratação mismatch).
 * Solução: estado inicial calculado no server, atualizado no client via
 * useEffect em intervalo de 1min.
 */

import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreetingParts(date: Date): { eyebrow: string; salutation: string } {
  const hour = date.getHours()

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ]

  const dayName  = days[date.getDay()]
  const day      = date.getDate()
  const monthStr = months[date.getMonth()]
  const hh       = String(hour).padStart(2, '0')
  const mm       = String(date.getMinutes()).padStart(2, '0')

  const eyebrow = `${dayName} · ${day} de ${monthStr} · ${hh}h${mm}`

  let salutation: string
  if (hour >= 5 && hour < 12)       salutation = 'Bom dia'
  else if (hour >= 12 && hour < 18) salutation = 'Boa tarde'
  else                               salutation = 'Boa noite'

  return { eyebrow, salutation }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GreetingProps {
  /** Nome do usuário autenticado (ex: "Gabriel"). */
  userName: string
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function Greeting({ userName }: GreetingProps) {
  const [parts, setParts] = useState(() => getGreetingParts(new Date()))

  // Atualiza a cada 60 segundos para manter horário correto
  useEffect(() => {
    const tick = () => setParts(getGreetingParts(new Date()))
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="greeting fade-in mb-8" id="greetingBlock">
      <span
        className="greeting-eyebrow"
        id="greetingEyebrow"
        aria-live="polite"
        aria-atomic="true"
      >
        {parts.eyebrow}
      </span>
      <h2 className="greeting-text" id="greetingText">
        {parts.salutation},{' '}
        <em>{userName}</em>.
      </h2>
    </div>
  )
}
