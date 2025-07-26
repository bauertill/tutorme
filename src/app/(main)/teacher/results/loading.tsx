export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded bg-gray-200" />
        ))}
      </div>

      {/* Group Performance Skeleton */}
      <div className="h-64 animate-pulse rounded bg-gray-200" />

      {/* Results Table Skeleton */}
      <div className="h-96 animate-pulse rounded bg-gray-200" />
    </div>
  );
}
