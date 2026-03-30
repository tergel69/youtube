'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoGrid } from '@/components/video'
import { CommentSection } from '@/components/comments/CommentSection'
import { VideoWithUser } from '@/types'
import { formatViews, formatTimeAgo, formatSubscribers, cn } from '@/lib/utils'
import { useSidebarStore } from '@/store'
import toast from 'react-hot-toast'

function WatchContent() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get('v')
  const { data: session } = useSession()
  const { setMini } = useSidebarStore()

  const [video, setVideo] = useState<any>(null)
  const [relatedVideos, setRelatedVideos] = useState<VideoWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    setMini(true)
    return () => setMini(false)
  }, [setMini])

  useEffect(() => {
    if (videoId) {
      fetchVideo()
      fetchRelatedVideos()
    }
  }, [videoId])

  const fetchVideo = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}`)
      const data = await response.json()
      setVideo(data)
      setIsLiked(data.isLiked || false)
      setIsDisliked(data.isDisliked || false)
      setIsSubscribed(data.user?.isSubscribed || false)
      setLikeCount(data._count?.likes || 0)
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedVideos = async () => {
    try {
      const response = await fetch('/api/videos?limit=20&isShort=false')
      const data = await response.json()
      setRelatedVideos(data.videos?.filter((v: any) => v.id !== videoId) || [])
    } catch (error) {
      console.error('Error fetching related videos:', error)
    }
  }

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like videos')
      return
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        if (isLiked) {
          setIsLiked(false)
          setLikeCount((prev) => prev - 1)
        } else {
          setIsLiked(true)
          setLikeCount((prev) => prev + 1)
          if (isDisliked) {
            setIsDisliked(false)
          }
        }
      }
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }

  const handleDislike = async () => {
    if (!session) {
      toast.error('Please sign in to dislike videos')
      return
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/dislike`, {
        method: 'POST',
      })

      if (response.ok) {
        if (isDisliked) {
          setIsDisliked(false)
        } else {
          setIsDisliked(true)
          if (isLiked) {
            setIsLiked(false)
            setLikeCount((prev) => prev - 1)
          }
        }
      }
    } catch (error) {
      console.error('Error disliking video:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!session) {
      toast.error('Please sign in to subscribe')
      return
    }

    try {
      const response = await fetch(`/api/channels/${video?.userId}/subscribe`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsSubscribed(!isSubscribed)
        toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  if (loading || !video) {
    return (
      <div className="flex gap-6 p-6">
        <div className="flex-1">
          <div className="aspect-video bg-youtube-gray animate-pulse rounded-xl" />
          <div className="mt-4">
            <div className="h-6 bg-youtube-gray animate-pulse rounded w-3/4 mb-2" />
            <div className="h-4 bg-youtube-gray animate-pulse rounded w-1/2" />
          </div>
        </div>
        <div className="w-[400px] hidden xl:block">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="w-40 aspect-video bg-youtube-gray animate-pulse rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-youtube-gray animate-pulse rounded mb-2" />
                  <div className="h-3 bg-youtube-gray animate-pulse rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <VideoPlayer
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          autoPlay
        />

        {/* Video info */}
        <div className="mt-4">
          <h1 className="text-xl font-semibold mb-2">{video.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Channel info */}
            <div className="flex items-center gap-4">
              <Link href={`/channel/${video.userId}`} className="flex items-center gap-3">
                {video.user.image ? (
                  <Image
                    src={video.user.image}
                    alt={video.user.name || ''}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-medium">
                    {video.user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium hover:text-youtube-blue">
                    {video.user.name}
                  </p>
                  <p className="text-sm text-youtube-text">
                    {formatSubscribers(video.user._count?.subscribers || 0)}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleSubscribe}
                className={cn(
                  'btn',
                  isSubscribed ? 'btn-subscribed' : 'btn-subscribe'
                )}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2 inline" />
                    Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-youtube-gray rounded-full">
                <button
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-l-full hover:bg-youtube-lightgray border-r border-youtube-lightgray',
                    isLiked && 'text-youtube-blue'
                  )}
                >
                  <ThumbsUp className={cn('w-5 h-5', isLiked && 'fill-current')} />
                  <span>{formatViews(likeCount)}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={cn(
                    'px-4 py-2 rounded-r-full hover:bg-youtube-lightgray',
                    isDisliked && 'text-youtube-blue'
                  )}
                >
                  <ThumbsDown className={cn('w-5 h-5', isDisliked && 'fill-current')} />
                </button>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-youtube-gray rounded-full hover:bg-youtube-lightgray"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>

              <button className="p-2 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-youtube-gray rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
              {video.tags && (
                <span className="text-youtube-blue">
                  {video.tags.split(',').map((tag: string) => `#${tag.trim()}`).join(' ')}
                </span>
              )}
            </div>

            <div
              className={cn(
                'text-sm whitespace-pre-wrap',
                !showFullDescription && 'line-clamp-3'
              )}
            >
              {video.description || 'No description'}
            </div>

            {video.description && video.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-medium mt-2 flex items-center gap-1"
              >
                {showFullDescription ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="mt-6">
            <CommentSection videoId={video.id} commentCount={video._count?.comments || 0} />
          </div>
        </div>
      </div>

      {/* Related videos */}
      <div className="w-[400px] hidden xl:block">
        <h3 className="font-medium mb-4">Related videos</h3>
        <div className="space-y-3">
          {relatedVideos.map((relatedVideo) => (
            <Link
              key={relatedVideo.id}
              href={`/watch?v=${relatedVideo.id}`}
              className="flex gap-2 group"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-youtube-gray flex-shrink-0">
                {relatedVideo.thumbnailUrl && (
                  <Image
                    src={relatedVideo.thumbnailUrl}
                    alt={relatedVideo.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-youtube-blue">
                  {relatedVideo.title}
                </h4>
                <p className="text-xs text-youtube-text">{relatedVideo.user.name}</p>
                <p className="text-xs text-youtube-text">
                  {formatViews(relatedVideo.views)} views • {formatTimeAgo(relatedVideo.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WatchContent />
    </Suspense>
  )
}
