/**
 * app/decisions/loading.tsx — Skeleton screen pra /decisions.
 *
 * Layout antigo simples (sem ModuleShell V4 ainda). Header + lista de cards.
 */

export default function DecisionsLoading() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-5 p-8"
      aria-label="Carregando decisões..."
      role="status"
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-32 rounded bg-[#2a2a2a] animate-pulse mb-2" />
          <div className="h-4 w-44 rounded bg-[#1c1c1c] animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-[#7c3aed33] animate-pulse" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-7 w-16 rounded-lg bg-[#1c1c1c] animate-pulse" />
        <div className="h-7 w-20 rounded-lg bg-[#1c1c1c] animate-pulse" />
        <div className="h-7 w-20 rounded-lg bg-[#1c1c1c] animate-pulse" />
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 rounded-md bg-[#10b9811a] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#1c1c1c] animate-pulse" />
            </div>
            <div className="h-4 w-3/4 rounded bg-[#1c1c1c] animate-pulse mb-2" />
            <div className="h-3 w-1/2 rounded bg-[#1c1c1c] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
