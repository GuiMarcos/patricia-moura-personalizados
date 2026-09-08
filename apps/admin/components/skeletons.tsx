export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} />;
}

export function OrdersSkeleton() {
  return (
    <div>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-80 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <div className="mt-5 flex justify-between border-t pt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-primary-50 px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-4 w-44" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full" />
        <div className="mt-6">
          <FormSkeleton />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-9 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}