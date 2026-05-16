// Felipe (frontend) + Sofia (CS):
// Loading global do Hayzer — usado em qualquer rota que não definir loading próprio.
// Visual sutil: pulse petrol no centro + tipografia maker, sem distrair.

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-2xl bg-[hsl(173_58%_28%)] animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground/90">
          H
        </div>
      </div>
      <p className="text-sm text-foreground/60 tracking-wide">Carregando…</p>
    </div>
  )
}
