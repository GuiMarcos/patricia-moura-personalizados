const shimmer = "animate-pulse bg-gray-200/70";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
      <div className={`relative aspect-square ${shimmer}`} />
      <div className="p-4">
        <div className={`h-4 w-3/4 rounded ${shimmer}`} />
        <div className={`mt-2 h-3 w-1/2 rounded ${shimmer}`} />
        <div className="mt-4 flex items-center justify-between">
          <div className={`h-5 w-20 rounded ${shimmer}`} />
          <div className={`h-9 w-9 rounded-full ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className={`h-4 w-28 rounded ${shimmer}`} />
      <div className={`mt-3 mb-10 h-9 w-full max-w-md rounded-lg ${shimmer}`} />
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-9 w-24 rounded-full ${shimmer}`} />
        ))}
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className={`h-4 w-40 rounded ${shimmer}`} />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className={`aspect-square rounded-2xl ${shimmer}`} />
        </div>
        <div className="space-y-4">
          <div className={`h-4 w-24 rounded ${shimmer}`} />
          <div className={`h-8 w-2/3 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-full rounded ${shimmer}`} />
          <div className="flex flex-wrap gap-2">
            <div className={`h-10 w-32 rounded-full ${shimmer}`} />
            <div className={`h-10 w-32 rounded-full ${shimmer}`} />
          </div>
          <div className={`h-6 w-40 rounded ${shimmer}`} />
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className={`h-11 w-36 rounded-full ${shimmer}`} />
            <div className={`h-8 w-24 rounded ${shimmer}`} />
          </div>
          <div className={`h-14 w-full rounded-full ${shimmer}`} />
          <div className={`h-14 w-full rounded-full ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div>
      <section className="bg-primary-100/70">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`mx-auto h-11 w-3/4 max-w-xl rounded-lg ${shimmer}`} />
            <div className={`mx-auto mt-6 h-5 w-2/3 max-w-lg rounded ${shimmer}`} />
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className={`h-12 w-40 rounded-full ${shimmer}`} />
              <div className={`h-12 w-40 rounded-full ${shimmer}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className={`mx-auto mb-8 h-8 w-64 rounded-lg ${shimmer}`} />
        <ProductGridSkeleton count={4} />
      </section>

      <section className="bg-primary-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className={`mx-auto mb-8 h-8 w-64 rounded-lg ${shimmer}`} />
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-9 w-24 rounded-full ${shimmer}`} />
            ))}
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    </div>
  );
}