'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { VideoWithUser } from '@/types'
import { formatViews, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ShortsPage() {
  const params = useParams()
  const initialShortId = params.shortId?.[0]
  const { data: session } = useSession()

  const [shorts, setShorts] = useState<VideoWithUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  useEffect(() => {
    fetchShorts()
  }, [])

  useEffect(() => {
    if (initialShortId && shorts.length > 0) {
      const index = shorts.findIndex((s) => s.id === initialShortId)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [initialShortId, shorts])

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (index === currentIndex) {
        if (isPlaying) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
        video.muted = isMuted
      } else {
        video.pause()
        video.currentTime = 0
      }
    })

    // Update URL
    if (shorts[currentIndex]) {
      window.history.replaceState(null, '', `/shorts/${shorts[currentIndex].id}`)
    }
  }, [currentIndex, isPlaying, isMuted, shorts])

  const fetchShorts = async () => {
    try {
      const response = await fetch('/api/videos?isShort=true&limit=20')
      const data = await response.json()
      setShorts(data.videos || [])
    } catch (error) {
      console.error('Error fetching shorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, shorts.length])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      goToNext()
    } else {
      goToPrevious()
    }
  }, [goToNext, goToPrevious])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false })
      return () => container.removeEventListener('wheel', handleScroll)
    }
  }, [handleScroll])

  const handleLike = async (shortId: string) => {
    if (!session) {
      toast.error('Please sign in to like')
      return
    }

    try {
      await fetch(`/api/videos/${shortId}/like`, { method: 'POST' })
    } catch (error) {
      console.error('Error liking:', error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-youtube-text">No shorts available</p>
      </div>
    )
  }

  const currentShort = shorts[currentIndex]

  return (
    <div
      ref={containerRef}
      className="h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="relative h-full max-h-[calc(100vh-56px)] aspect-[9/16] flex items-center">
        {/* Video */}
        <div className="relative w-full h-full bg-youtube-dark rounded-lg overflow-hidden">
          <video
            ref={(el) => {
              if (el) videoRefs.current.set(currentIndex, el)
            }}
            src={currentShort.videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-16 h-16 text-white" fill="white" />
            </div>
          )}

          {/* Video info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Link
              href={`/channel/${currentShort.userId}`}
              className="flex items-center gap-2 mb-2"
            >
              {currentShort.user.image ? (
                <Image
                  src={currentShort.user.image}
                  alt={currentShort.user.name || ''}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {currentShort.user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-medium">{currentShort.user.name}</span>
            </Link>
            <p className="text-sm line-clamp-2">{currentShort.title}</p>
          </div>

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Actions sidebar */}
        <div className="absolute right-0 bottom-20 flex flex-col items-center gap-4 -mr-16">
          <button
            onClick={() => handleLike(currentShort.id)}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-3 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <span className="text-xs">{formatViews(currentShort._count?.likes || 0)}</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="p-3 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
              <ThumbsDown className="w-6 h-6" />
            </div>
            <span className="text-xs">Dislike</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="p-3 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs">{formatViews(currentShort._count?.comments || 0)}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied!')
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-3 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs">Share</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="p-3 bg-youtube-gray rounded-full hover:bg-youtube-lightgray">
              <MoreVertical className="w-6 h-6" />
            </div>
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-16 flex flex-col gap-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={cn(
              'p-3 bg-youtube-gray rounded-full',
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-youtube-lightgray'
            )}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className={cn(
              'p-3 bg-youtube-gray rounded-full',
              currentIndex === shorts.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-youtube-lightgray'
            )}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
