interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

function SkeletonText({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-white/10 h-4 ${className}`} />;
}

/** Skeleton for a KPI card (icon + number + label) */
export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-grafito p-5 shadow-sm">
      <Skeleton className="h-11 w-11 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  );
}

/** Skeleton for a table with header + N rows */
export function SkeletonTable({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl bg-grafito shadow-sm">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/8 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-white/5 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonText key={c} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a form with fieldsets */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="mt-6 max-w-3xl rounded-xl bg-grafito p-6 shadow-sm">
      <Skeleton className="mb-6 h-5 w-32" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-10 w-36" />
    </div>
  );
}

/** Skeleton for a detail page with key-value rows */
export function SkeletonDetail({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mt-6 max-w-3xl rounded-xl bg-grafito p-6 shadow-sm">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center py-3">
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="ml-auto h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
