'use client'

import { useState, useEffect } from 'react'
import { Flame, Music, Film, Gamepad2 } from 'lucide-react'
import { VideoGrid, VideoCard } from '@/components/video'
import { VideoWithUser } from '@/types'
import { cn } from '@/lib/utils'

type TrendingTab = 'now' | 'music' | 'gaming' | 'movies'

export default function TrendingPage() {
  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TrendingTab>('now')

  useEffect(() => {
    fetchTrending()
  }, [activeTab])

  const fetchTrending = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        isShort: 'false',
        limit: '20',
      })

      // Add category filter based on tab
      if (activeTab === 'music') {
        params.set('category', 'Music')
      } else if (activeTab === 'gaming') {
        params.set('category', 'Gaming')
      } else if (activeTab === 'movies') {
        params.set('category', 'Film & Animation')
      }

      const response = await fetch(`/api/videos?${params}`)
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching trending:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'now' as TrendingTab, label: 'Now', icon: Flame },
    { id: 'music' as TrendingTab, label: 'Music', icon: Music },
    { id: 'gaming' as TrendingTab, label: 'Gaming', icon: Gamepad2 },
    { id: 'movies' as TrendingTab, label: 'Movies', icon: Film },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-youtube-red rounded-full flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold">Trending</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-youtube-gray pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-youtube-gray hover:bg-youtube-lightgray'
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Videos */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 text-center text-youtube-text font-bold">
                {i}
              </div>
              <div className="w-[360px] aspect-video bg-youtube-gray rounded-xl" />
              <div className="flex-1">
                <div className="h-6 bg-youtube-gray rounded w-3/4 mb-2" />
                <div className="h-4 bg-youtube-gray rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-youtube-text">
          <p>No trending videos found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <div key={video.id} className="flex gap-4 items-start">
              <div className="w-10 text-center text-2xl font-bold text-youtube-text flex-shrink-0 pt-2">
                {index + 1}
              </div>
              <div className="flex-1">
                <VideoCard video={video} layout="list" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
