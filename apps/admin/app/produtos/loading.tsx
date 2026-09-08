import { ProductsSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200/70" />
            <div className="mt-2 h-9 w-44 animate-pulse rounded-lg bg-gray-200/70" />
            <div className="mt-1 h-4 w-36 animate-pulse rounded bg-gray-200/70" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200/70" />
            <div className="h-10 w-40 animate-pulse rounded-full bg-gray-200/70" />
          </div>
        </div>
        <ProductsSkeleton />
      </div>
    </div>
  );
}