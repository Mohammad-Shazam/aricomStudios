export function HousePlanCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
  )
}
