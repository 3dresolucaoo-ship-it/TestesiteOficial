/**
 * app/content/loading.tsx — Skeleton screen pra /content.
 *
 * Layout antigo simples (sem ModuleShell V4 ainda). Header + filters + lista.
 */

export default function ContentLoading() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-5 p-8"
      aria-label="Carregando conteúdo..."
      role="status"
      aria-busy="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-32 rounded bg-[#2a2a2a] animate-pulse mb-2" />
          <div className="h-4 w-56 rounded bg-[#1c1c1c] animate-pulse" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-[#7c3aed33] animate-pulse" />
      </div>

      {/* Project filter */}
      <div className="h-9 w-56 rounded-lg bg-[#1c1c1c] animate-pulse" />

      {/* Status filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[60, 70, 85, 75].map((w, i) => (
          <div
            key={i}
            className="h-7 rounded-lg bg-[#1c1c1c] animate-pulse"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-14 rounded-md bg-[#88888818] animate-pulse" />
              <div className="h-3 w-16 rounded bg-[#1c1c1c] animate-pulse" />
            </div>
            <div className="h-4 w-4/5 rounded bg-[#1c1c1c] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
