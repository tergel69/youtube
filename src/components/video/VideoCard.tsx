'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MoreVertical, Clock, ListPlus, Share2, Ban, Flag } from 'lucide-react'
import { VideoWithUser } from '@/types'
import { formatViews, formatDuration, formatTimeAgo, cn } from '@/lib/utils'

interface VideoCardProps {
  video: VideoWithUser
  layout?: 'grid' | 'list' | 'compact'
  showChannel?: boolean
}

export function VideoCard({ video, layout = 'grid', showChannel = true }: VideoCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (layout === 'list') {
    return (
      <div className="flex gap-4 group">
        <Link href={`/watch?v=${video.id}`} className="relative flex-shrink-0">
          <div className="relative w-[360px] aspect-video rounded-xl overflow-hidden bg-youtube-gray">
            {!imageError && video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-youtube-text">
                No thumbnail
              </div>
            )}
            <span className="duration-badge">{formatDuration(video.duration)}</span>
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="text-lg font-medium line-clamp-2 mb-1 group-hover:text-youtube-blue">
              {video.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-sm text-youtube-text mb-2">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>

          {showChannel && (
            <Link
              href={`/channel/${video.userId}`}
              className="flex items-center gap-2 mb-2"
            >
              {video.user.image ? (
                <Image
                  src={video.user.image}
                  alt={video.user.name || ''}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                  {video.user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-youtube-text hover:text-white">
                {video.user.name}
              </span>
            </Link>
          )}

          {video.description && (
            <p className="text-sm text-youtube-text line-clamp-2">
              {video.description}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="icon-btn opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <VideoMenu show={showMenu} onClose={() => setShowMenu(false)} />
        </div>
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className="flex gap-2 group">
        <Link href={`/watch?v=${video.id}`} className="relative flex-shrink-0">
          <div className="relative w-[168px] aspect-video rounded-lg overflow-hidden bg-youtube-gray">
            {!imageError && video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-youtube-text text-xs">
                No thumbnail
              </div>
            )}
            <span className="duration-badge text-[10px]">{formatDuration(video.duration)}</span>
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="text-sm font-medium line-clamp-2 mb-1">
              {video.title}
            </h3>
          </Link>

          {showChannel && (
            <Link
              href={`/channel/${video.userId}`}
              className="text-xs text-youtube-text hover:text-white block mb-0.5"
            >
              {video.user.name}
            </Link>
          )}

          <div className="flex items-center gap-1 text-xs text-youtube-text">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="icon-btn opacity-0 group-hover:opacity-100 self-start p-1"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className="video-card group">
      <Link href={`/watch?v=${video.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-youtube-gray video-thumbnail">
          {!imageError && video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-youtube-text">
              No thumbnail
            </div>
          )}
          <span className="duration-badge">{formatDuration(video.duration)}</span>
        </div>
      </Link>

      <div className="flex gap-3 mt-3">
        {showChannel && (
          <Link href={`/channel/${video.userId}`} className="flex-shrink-0">
            {video.user.image ? (
              <Image
                src={video.user.image}
                alt={video.user.name || ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                {video.user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Link href={`/watch?v=${video.id}`}>
            <h3 className="font-medium line-clamp-2 mb-1 leading-snug">
              {video.title}
            </h3>
          </Link>

          {showChannel && (
            <Link
              href={`/channel/${video.userId}`}
              className="text-sm text-youtube-text hover:text-white block"
            >
              {video.user.name}
            </Link>
          )}

          <div className="flex items-center gap-1 text-sm text-youtube-text">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="icon-btn opacity-0 group-hover:opacity-100 p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <VideoMenu show={showMenu} onClose={() => setShowMenu(false)} />
        </div>
      </div>
    </div>
  )
}

function VideoMenu({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="dropdown-menu open right-0 top-full mt-1 z-50">
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
          <ListPlus className="w-5 h-5" />
          <span>Save to playlist</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
          <Clock className="w-5 h-5" />
          <span>Save to Watch later</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
        <hr className="border-youtube-lightgray my-1" />
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
          <Ban className="w-5 h-5" />
          <span>Not interested</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
          <Flag className="w-5 h-5" />
          <span>Report</span>
        </button>
      </div>
    </>
  )
}
