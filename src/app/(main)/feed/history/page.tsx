'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Trash2, Pause, Play } from 'lucide-react'
import { VideoCard } from '@/components/video'
import { VideoWithUser } from '@/types'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [historyPaused, setHistoryPaused] = useState(false)

  useEffect(() => {
    if (session) {
      fetchHistory()
    }
  }, [session])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm('Clear all watch history?')) return

    try {
      const response = await fetch('/api/history', { method: 'DELETE' })
      if (response.ok) {
        setVideos([])
        toast.success('Watch history cleared')
      }
    } catch (error) {
      toast.error('Failed to clear history')
    }
  }

  const removeFromHistory = async (videoId: string) => {
    try {
      const response = await fetch(`/api/history?videoId=${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVideos(videos.filter((v) => v.id !== videoId))
        toast.success('Removed from history')
      }
    } catch (error) {
      toast.error('Failed to remove from history')
    }
  }

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group videos by date
  const groupedVideos = filteredVideos.reduce((groups: Record<string, VideoWithUser[]>, video: any) => {
    const date = new Date(video.watchedAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key: string
    if (date.toDateString() === today.toDateString()) {
      key = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday'
    } else {
      key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(video)
    return groups
  }, {})

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-youtube-gray rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-[360px] aspect-video bg-youtube-gray rounded" />
                <div className="flex-1">
                  <div className="h-6 bg-youtube-gray rounded w-3/4 mb-2" />
                  <div className="h-4 bg-youtube-gray rounded w-1/2" />
                </div>
              </div>
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
          <h2 className="text-xl font-semibold mb-4">Sign in to see your watch history</h2>
          <p className="text-youtube-text mb-6">
            Keep track of what you watch
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

  return (
    <div className="flex gap-6 p-6">
      {/* Main content */}
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-6">Watch history</h1>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-youtube-text">
            <p className="text-xl mb-2">No watch history</p>
            <p>Videos you watch will appear here</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedVideos).map(([date, dateVideos]) => (
              <div key={date}>
                <h2 className="text-lg font-medium mb-4">{date}</h2>
                <div className="space-y-4">
                  {dateVideos.map((video) => (
                    <div key={video.id} className="group relative">
                      <VideoCard video={video} layout="list" />
                      <button
                        onClick={() => removeFromHistory(video.id)}
                        className="absolute top-0 right-0 p-2 bg-youtube-gray rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-youtube-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search watch history"
            className="w-full pl-10 pr-4 py-2 bg-youtube-gray rounded-full focus:outline-none focus:ring-2 focus:ring-youtube-blue"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={clearHistory}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-youtube-gray rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear all watch history</span>
          </button>

          <button
            onClick={() => setHistoryPaused(!historyPaused)}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-youtube-gray rounded-lg transition-colors"
          >
            {historyPaused ? (
              <>
                <Play className="w-5 h-5" />
                <span>Turn on watch history</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause watch history</span>
              </>
            )}
          </button>
        </div>

        {historyPaused && (
          <div className="mt-4 p-4 bg-youtube-gray rounded-lg">
            <p className="text-sm text-youtube-text">
              Watch history is paused. Videos you watch won&apos;t be saved to your history.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
