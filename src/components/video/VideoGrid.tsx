'use client'

import { VideoWithUser } from '@/types'
import { VideoCard } from './VideoCard'
import { VideoCardSkeleton } from './VideoCardSkeleton'

interface VideoGridProps {
  videos: VideoWithUser[]
  loading?: boolean
  layout?: 'grid' | 'list' | 'compact'
  showChannel?: boolean
}

export function VideoGrid({
  videos,
  loading = false,
  layout = 'grid',
  showChannel = true,
}: VideoGridProps) {
  if (loading) {
    return (
      <div className={layout === 'grid' ? 'video-grid' : 'flex flex-col gap-4'}>
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoCardSkeleton key={i} layout={layout} />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-youtube-text">
        <div className="text-6xl mb-4">📺</div>
        <h3 className="text-xl font-medium text-white mb-2">No videos found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className={layout === 'grid' ? 'video-grid' : 'flex flex-col gap-4'}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          layout={layout}
          showChannel={showChannel}
        />
      ))}
    </div>
  )
}
