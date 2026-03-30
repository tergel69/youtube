'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Bell, BellOff, Search, ChevronRight } from 'lucide-react'
import { VideoGrid } from '@/components/video'
import { VideoWithUser, UserWithStats } from '@/types'
import { formatSubscribers, formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Tab = 'home' | 'videos' | 'shorts' | 'playlists' | 'community' | 'about'
type SortOption = 'newest' | 'popular' | 'oldest'

export default function ChannelPage() {
  const params = useParams()
  const channelId = params.channelId as string
  const { data: session } = useSession()

  const [channel, setChannel] = useState<UserWithStats | null>(null)
  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    fetchChannel()
    fetchVideos()
  }, [channelId])

  useEffect(() => {
    if (activeTab === 'videos' || activeTab === 'shorts') {
      fetchVideos()
    }
  }, [activeTab, sortBy])

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${channelId}`)
      const data = await response.json()
      setChannel(data)
      setIsSubscribed(data.isSubscribed || false)
      setSubscriberCount(data._count?.subscribers || 0)
    } catch (error) {
      console.error('Error fetching channel:', error)
    }
  }

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'shorts' ? 'shorts' : activeTab === 'videos' ? 'videos' : 'all'
      const response = await fetch(`/api/channels/${channelId}/videos?sort=${sortBy}&type=${type}`)
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!session) {
      toast.error('Please sign in to subscribe')
      return
    }

    try {
      const response = await fetch(`/api/channels/${channelId}/subscribe`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setIsSubscribed(data.subscribed)
        setSubscriberCount((prev) => (data.subscribed ? prev + 1 : prev - 1))
        toast.success(data.subscribed ? 'Subscribed!' : 'Unsubscribed')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      toast.error('Failed to subscribe')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'videos', label: 'Videos' },
    { id: 'shorts', label: 'Shorts' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'community', label: 'Community' },
    { id: 'about', label: 'About' },
  ]

  if (!channel) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-youtube-gray" />
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 bg-youtube-gray rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-youtube-gray rounded w-48 mb-2" />
              <div className="h-4 bg-youtube-gray rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-youtube-gray relative">
        {channel.bannerImage && (
          <Image
            src={channel.bannerImage}
            alt=""
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Channel info */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {channel.image ? (
              <Image
                src={channel.image}
                alt={channel.name || ''}
                width={160}
                height={160}
                className="rounded-full"
              />
            ) : (
              <div className="w-40 h-40 bg-purple-600 rounded-full flex items-center justify-center text-5xl font-medium">
                {channel.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{channel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-youtube-text text-sm mb-3">
              <span>@{channel.handle}</span>
              <span>•</span>
              <span>{formatSubscribers(subscriberCount)}</span>
              <span>•</span>
              <span>{channel._count?.videos || 0} videos</span>
            </div>
            {channel.description && (
              <p className="text-youtube-text text-sm line-clamp-2 mb-3">
                {channel.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              {session && (session.user as any)?.id !== channelId && (
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
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-youtube-gray overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-youtube-text hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
          <button className="py-3 px-1 ml-auto">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6">
          {activeTab === 'home' && (
            <div>
              {videos.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Videos</h2>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveTab('videos')
                      }}
                      className="text-youtube-blue text-sm flex items-center gap-1"
                    >
                      Play all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <VideoGrid
                    videos={videos.filter((v) => !v.isShort).slice(0, 12)}
                    loading={loading}
                    showChannel={false}
                  />
                </>
              ) : (
                <div className="text-center py-20 text-youtube-text">
                  <p className="text-xl mb-2">This channel has no videos</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                {(['newest', 'popular', 'oldest'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={cn(
                      'chip',
                      sortBy === option && 'active'
                    )}
                  >
                    {option === 'newest' ? 'Latest' : option === 'popular' ? 'Popular' : 'Oldest'}
                  </button>
                ))}
              </div>
              <VideoGrid
                videos={videos.filter((v) => !v.isShort)}
                loading={loading}
                showChannel={false}
              />
            </div>
          )}

          {activeTab === 'shorts' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {videos.filter((v) => v.isShort).map((video) => (
                <Link
                  key={video.id}
                  href={`/shorts/${video.id}`}
                  className="relative aspect-[9/16] bg-youtube-gray rounded-xl overflow-hidden group"
                >
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                    <p className="text-xs text-youtube-text">{video.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="text-center py-20 text-youtube-text">
              <p>No playlists yet</p>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="text-center py-20 text-youtube-text">
              <p>Community posts coming soon</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-3xl">
              <h2 className="text-lg font-medium mb-4">About</h2>
              <p className="text-youtube-text whitespace-pre-wrap mb-6">
                {channel.description || 'No description'}
              </p>
              <div className="border-t border-youtube-gray pt-4">
                <h3 className="font-medium mb-2">Stats</h3>
                <p className="text-youtube-text text-sm">
                  Joined {formatDate(channel.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
