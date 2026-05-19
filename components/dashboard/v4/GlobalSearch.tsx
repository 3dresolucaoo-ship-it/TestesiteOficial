'use client'

/**
 * GlobalSearch.tsx — Busca global com cmdk (Cmd/Ctrl+K)
 *
 * Comportamento:
 * - Atalho Cmd+K (Mac) / Ctrl+K (Windows/Linux) abre o painel
 * - Botão de lupa no topbar também abre
 * - Busca debounced 200ms via services/search.ts (FTS postgres + fallback ILIKE)
 * - Resultados agrupados por tipo: Pedidos / Clientes / Produtos
 * - Click numa row navega pelo link gerado pelo service
 * - ESC fecha
 * - Empty states PT-BR formais
 *
 * Multi-tenant: user_id + project_id passados para globalSearch (via service).
 * Server/Client boundary: usa supabase browser client (via service) — seguro aqui.
 *
 * Nota sobre cmdk: a lib usa Radix Dialog internamente.
 * O overlay e o portal de z-index já vêm prontos — não recriamos.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { globalSearch, type SearchResult, type SearchResultType } from '@/services/search'

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 200

const GROUP_LABEL: Record<SearchResultType, string> = {
  order:    'Pedidos',
  customer: 'Clientes',
  product:  'Produtos',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupResults(results: SearchResult[]): Map<SearchResultType, SearchResult[]> {
  const map = new Map<SearchResultType, SearchResult[]>()
  for (const r of results) {
    const group = map.get(r.type) ?? []
    group.push(r)
    map.set(r.type, group)
  }
  return map
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GlobalSearchProps {
  userId:    string
  projectId: string
}

// ─── Estilos inline (evita classes bg-X/Y do Tailwind 4 que retornam vazio) ──

const overlayStyle: React.CSSProperties = {
  position:   'fixed',
  inset:      0,
  background: 'rgba(0,0,0,0.6)',
  zIndex:     300,
  display:    'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '15vh',
}

const dialogStyle: React.CSSProperties = {
  width:        '540px',
  maxWidth:     'calc(100vw - 32px)',
  borderRadius: '14px',
  background:   'hsl(220 14% 11%)',
  border:       '1px solid rgba(255,255,255,0.08)',
  boxShadow:    '0 24px 60px rgba(0,0,0,0.55)',
  overflow:     'hidden',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GlobalSearch({ userId, projectId }: GlobalSearchProps) {
  const router = useRouter()

  const [isOpen,   setIsOpen]   = useState(false)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<SearchResult[]>([])
  const [loading,  setLoading]  = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Atalho de teclado ─────────────────────────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (modifier && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Fechar ────────────────────────────────────────────────────────────────

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setResults([])
  }, [])

  // ── Busca debounced ───────────────────────────────────────────────────────
  // Todos os setState ficam dentro de callbacks assíncronas (setTimeout/async),
  // nunca no body síncrono do effect — evita cascata (react-hooks/set-state-in-effect).

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const term = query.trim()

    if (!term || term.length < 2) {
      // Reset via setTimeout para não ser síncrono no body do effect
      debounceRef.current = setTimeout(() => {
        setResults([])
        setLoading(false)
      }, 0)
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }

    // Sinaliza loading via setTimeout (assíncrono)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
    }, 0)

    const searchTimer = setTimeout(async () => {
      try {
        const data = await globalSearch(term, userId, projectId, 10)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      clearTimeout(searchTimer)
    }
  }, [query, userId, projectId])

  // ── Navegar para resultado ────────────────────────────────────────────────

  const handleSelect = useCallback((result: SearchResult) => {
    close()
    if (result.link) {
      router.push(result.link)
    }
  }, [close, router])

  // ── Grupos de resultados ──────────────────────────────────────────────────

  const groups = groupResults(results)
  const hasResults = results.length > 0
  const hasQuery = query.trim().length >= 2

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Botão lupa no topbar */}
      <button
        className="icon-btn"
        type="button"
        aria-label="Buscar — Ctrl+K"
        onClick={() => setIsOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Overlay + Dialog */}
      {isOpen && (
        <div
          style={overlayStyle}
          aria-modal="true"
          role="dialog"
          aria-label="Busca global"
          onMouseDown={(e) => {
            // Fecha ao clicar no overlay (fora do dialog)
            if (e.target === e.currentTarget) close()
          }}
        >
          <div style={dialogStyle}>
            <Command
              label="Busca global"
              shouldFilter={false}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close()
              }}
            >
              {/* Input */}
              <div
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '10px',
                  padding:      '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="hsl(220 10% 45%)"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>

                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Busca pedidos, clientes, produtos..."
                  autoFocus
                  style={{
                    flex:       1,
                    background: 'transparent',
                    border:     'none',
                    outline:    'none',
                    fontSize:   '14px',
                    color:      'hsl(220 10% 90%)',
                    caretColor: 'hsl(173 58% 48%)',
                  }}
                />

                {/* Hint de atalho */}
                <kbd
                  aria-hidden="true"
                  style={{
                    background:    'rgba(255,255,255,0.06)',
                    border:        '1px solid rgba(255,255,255,0.1)',
                    borderRadius:  '4px',
                    padding:       '2px 6px',
                    fontSize:      '10px',
                    color:         'hsl(220 10% 50%)',
                    fontFamily:    'inherit',
                    flexShrink:    0,
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Lista de resultados */}
              <Command.List
                style={{
                  maxHeight:  '380px',
                  overflowY:  'auto',
                  padding:    hasResults || loading ? '8px 0' : '0',
                }}
              >
                {/* Loading */}
                {loading && (
                  <Command.Loading>
                    <p
                      style={{
                        textAlign: 'center',
                        fontSize:  '13px',
                        color:     'hsl(220 10% 45%)',
                        padding:   '24px 16px',
                        margin:    0,
                      }}
                    >
                      Buscando...
                    </p>
                  </Command.Loading>
                )}

                {/* Empty state inicial */}
                {!loading && !hasQuery && (
                  <Command.Empty>
                    <p
                      style={{
                        textAlign: 'center',
                        fontSize:  '13px',
                        color:     'hsl(220 10% 40%)',
                        padding:   '28px 16px',
                        margin:    0,
                      }}
                    >
                      Busca pedidos, clientes, produtos...
                    </p>
                  </Command.Empty>
                )}

                {/* Empty state com query mas zero resultado */}
                {!loading && hasQuery && !hasResults && (
                  <Command.Empty>
                    <p
                      style={{
                        textAlign: 'center',
                        fontSize:  '13px',
                        color:     'hsl(220 10% 40%)',
                        padding:   '28px 16px',
                        margin:    0,
                      }}
                    >
                      {`Nada encontrado para "${query.trim()}".`}
                    </p>
                  </Command.Empty>
                )}

                {/* Grupos de resultados */}
                {!loading && hasResults && Array.from(groups.entries()).map(([type, items]) => (
                  <Command.Group
                    key={type}
                    heading={GROUP_LABEL[type]}
                    style={{ padding: '0' }}
                  >
                    {/* Heading customizado via CSS */}
                    {items.map((result) => (
                      <Command.Item
                        key={result.id}
                        value={`${result.type}-${result.id}`}
                        onSelect={() => handleSelect(result)}
                        style={{
                          display:    'flex',
                          flexDirection: 'column',
                          gap:        '2px',
                          padding:    '10px 16px',
                          cursor:     'pointer',
                          borderRadius: 0,
                          outline:    'none',
                        }}
                        data-result-item
                      >
                        <span
                          style={{
                            fontSize:   '13px',
                            fontWeight: 500,
                            color:      'hsl(220 10% 88%)',
                          }}
                        >
                          {result.title}
                        </span>
                        {result.subtitle && (
                          <span
                            style={{
                              fontSize: '11px',
                              color:    'hsl(220 10% 50%)',
                            }}
                          >
                            {result.subtitle}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </div>
        </div>
      )}

      {/* Estilos cmdk via style tag (sem arquivo CSS separado para manter cirurgia) */}
      <style>{`
        [cmdk-group-heading] {
          padding: 6px 16px 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: hsl(173 58% 40%);
        }
        [cmdk-item][aria-selected='true'],
        [cmdk-item]:focus,
        [data-result-item][aria-selected='true'] {
          background: rgba(255,255,255,0.05) !important;
          outline: none;
        }
        [cmdk-item]:hover {
          background: rgba(255,255,255,0.04) !important;
        }
        [cmdk-list]::-webkit-scrollbar {
          width: 4px;
        }
        [cmdk-list]::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
      `}</style>
    </>
  )
}
