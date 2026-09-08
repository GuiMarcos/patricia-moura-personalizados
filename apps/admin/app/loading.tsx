import { DashboardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-9 w-72 max-w-full animate-pulse rounded-lg bg-gray-200/70" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200/70" />
        </div>
        <DashboardSkeleton />
      </div>
    </div>
  );
}