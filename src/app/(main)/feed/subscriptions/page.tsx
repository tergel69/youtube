'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Grid, List, ChevronRight } from 'lucide-react'
import { VideoGrid, VideoCard } from '@/components/video'
import { VideoWithUser } from '@/types'
import { cn } from '@/lib/utils'

interface Channel {
  id: string
  name: string
  image: string | null
  handle: string | null
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [selectedChannel, setSelectedChannel] = useState<string>('all')

  useEffect(() => {
    if (session) {
      fetchSubscriptionsFeed()
    }
  }, [session])

  const fetchSubscriptionsFeed = async () => {
    try {
      const response = await fetch('/api/subscriptions/feed')
      const data = await response.json()
      setVideos(data.videos || [])
      setChannels(data.channels || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = selectedChannel === 'all'
    ? videos
    : videos.filter((v) => v.userId === selectedChannel)

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-youtube-gray rounded w-48 mb-6" />
          <div className="video-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-youtube-gray rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Don&apos;t miss new videos</h2>
          <p className="text-youtube-text mb-6">
            Sign in to see updates from your favorite YouTube channels
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="btn btn-primary"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No subscriptions yet</h2>
          <p className="text-youtube-text mb-6">
            Subscribe to channels to see their latest videos here
          </p>
          <Link href="/" className="btn btn-primary">
            Explore videos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Channels bar */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setSelectedChannel('all')}
          className={cn(
            'flex flex-col items-center gap-2 p-2 rounded-lg transition-colors flex-shrink-0',
            selectedChannel === 'all' ? 'bg-youtube-gray' : 'hover:bg-youtube-gray'
          )}
        >
          <div className="w-14 h-14 bg-youtube-blue rounded-full flex items-center justify-center text-black font-bold">
            All
          </div>
          <span className="text-xs">All</span>
        </button>

        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-2 rounded-lg transition-colors flex-shrink-0',
              selectedChannel === channel.id ? 'bg-youtube-gray' : 'hover:bg-youtube-gray'
            )}
          >
            {channel.image ? (
              <Image
                src={channel.image}
                alt={channel.name}
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-lg font-medium">
                {channel.name[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-xs truncate max-w-[60px]">{channel.name}</span>
          </button>
        ))}

        <Link
          href="/feed/channels"
          className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-youtube-gray transition-colors flex-shrink-0"
        >
          <div className="w-14 h-14 bg-youtube-gray rounded-full flex items-center justify-center">
            <ChevronRight className="w-6 h-6" />
          </div>
          <span className="text-xs">Manage</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {selectedChannel === 'all'
            ? 'Latest'
            : channels.find((c) => c.id === selectedChannel)?.name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayout('grid')}
            className={cn('icon-btn', layout === 'grid' && 'bg-youtube-gray')}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLayout('list')}
            className={cn('icon-btn', layout === 'list' && 'bg-youtube-gray')}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Videos */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-20 text-youtube-text">
          <p>No videos from this channel yet</p>
        </div>
      ) : layout === 'grid' ? (
        <VideoGrid videos={filteredVideos} />
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} layout="list" />
          ))}
        </div>
      )}
    </div>
  )
}
