'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Sparkline } from '@/components/FinanceCharts'

export function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function fmtFull(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function Section({
  title, icon: Icon, iconColor = 'text-[#a78bfa]', href, children, collapsible = false,
}: {
  title:        string
  icon:         React.ElementType
  iconColor?:   string
  href?:        string
  children:     React.ReactNode
  collapsible?: boolean
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          className="flex items-center gap-2 group"
          onClick={() => collapsible && setOpen(o => !o)}
        >
          <Icon size={13} className={iconColor} />
          <h3 className="text-[#8888a0] text-xs font-semibold uppercase tracking-widest group-hover:text-[#f0f0f5] transition-colors">
            {title}
          </h3>
          {collapsible && (
            <ChevronDown
              size={12}
              className={`text-[#444455] transition-transform ${open ? '' : '-rotate-90'}`}
            />
          )}
        </button>
        {href && (
          <Link href={href} className="text-[#444455] hover:text-[#f0f0f5] text-xs flex items-center gap-1 transition-colors">
            Ver tudo <ArrowUpRight size={11} />
          </Link>
        )}
      </div>
      <div className="section-divider mb-4" />
      {(!collapsible || open) && children}
    </div>
  )
}

export function StatCard({
  label, value, sub,
  icon: Icon,
  accentColor = '#7c3aed',
  sparkData,
  sparkColor,
}: {
  label:        string
  value:        string
  sub?:         string
  icon:         React.ElementType
  accentColor?: string
  sparkData?:   number[]
  sparkColor?:  string
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-default"
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)`,
        border: `1px solid rgba(255,255,255,0.09)`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.7), 0 0 30px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.08)`
        el.style.borderColor = 'rgba(255,255,255,0.15)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
        el.style.borderColor = 'rgba(255,255,255,0.09)'
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[#8888a0] text-[11px] font-semibold uppercase tracking-wider">{label}</span>
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: `${accentColor}1a`,
              boxShadow: `0 0 12px ${accentColor}30`,
            }}
          >
            <Icon size={14} strokeWidth={1.5} style={{ color: accentColor }} />
          </div>
        </div>
        <p className="text-[#f0f0f5] text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {sub && <p className="text-[#444455] text-xs mt-1">{sub}</p>}
        {sparkData && sparkData.length >= 2 && (
          <div className="mt-3 -mx-1">
            <Sparkline data={sparkData} color={sparkColor ?? accentColor} height={30} />
          </div>
        )}
      </div>
    </div>
  )
}

export function Panel({
  children, className = '', glow,
}: {
  children:   React.ReactNode
  className?: string
  glow?:      string
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.015) 100%)',
        border: `1px solid ${glow ? `${glow}22` : 'rgba(255,255,255,0.08)'}`,
        boxShadow: glow
          ? `0 0 40px ${glow}12, 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </div>
  )
}
