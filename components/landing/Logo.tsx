import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.6)]"
        aria-hidden
      >
        B
      </div>
      <span className="text-base font-semibold tracking-tight">
        BVaz <span className="text-muted-foreground font-normal">Hub</span>
      </span>
    </div>
  )
}
