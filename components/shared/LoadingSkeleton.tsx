import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-8 flex-1 rounded-md animate-shimmer bg-[rgba(59, 130, 246,0.03)] border border-[rgba(59, 130, 246,0.05)]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-12 flex-1 rounded-md animate-shimmer bg-[rgba(59, 130, 246,0.03)] border border-[rgba(59, 130, 246,0.05)]" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(59, 130, 246,0.02)] to-transparent pointer-events-none" />
      <div className="h-4 w-24 rounded animate-shimmer bg-[rgba(59, 130, 246,0.05)]" />
      <div className="h-8 w-16 rounded animate-shimmer bg-[rgba(59, 130, 246,0.05)]" style={{ animationDelay: "0.1s" }} />
      <div className="h-3 w-32 rounded animate-shimmer bg-[rgba(59, 130, 246,0.05)]" style={{ animationDelay: "0.2s" }} />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
