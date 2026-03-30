'use client'

interface VideoCardSkeletonProps {
  layout?: 'grid' | 'list' | 'compact'
}

export function VideoCardSkeleton({ layout = 'grid' }: VideoCardSkeletonProps) {
  if (layout === 'list') {
    return (
      <div className="flex gap-4 animate-pulse">
        <div className="w-[360px] aspect-video skeleton rounded-xl" />
        <div className="flex-1">
          <div className="h-6 skeleton rounded w-3/4 mb-2" />
          <div className="h-4 skeleton rounded w-1/4 mb-3" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 skeleton rounded-full" />
            <div className="h-4 skeleton rounded w-24" />
          </div>
          <div className="h-4 skeleton rounded w-full mb-1" />
          <div className="h-4 skeleton rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="w-[168px] aspect-video skeleton rounded-lg" />
        <div className="flex-1">
          <div className="h-4 skeleton rounded w-full mb-2" />
          <div className="h-4 skeleton rounded w-3/4 mb-2" />
          <div className="h-3 skeleton rounded w-1/2 mb-1" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
      </div>
    )
  }

  // Grid layout
  return (
    <div className="animate-pulse">
      <div className="aspect-video skeleton rounded-xl mb-3" />
      <div className="flex gap-3">
        <div className="w-9 h-9 skeleton rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-5 skeleton rounded w-full mb-2" />
          <div className="h-5 skeleton rounded w-3/4 mb-2" />
          <div className="h-4 skeleton rounded w-1/2 mb-1" />
          <div className="h-4 skeleton rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}
