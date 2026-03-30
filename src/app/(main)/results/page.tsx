'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, ChevronDown } from 'lucide-react'
import { VideoGrid, VideoCard } from '@/components/video'
import { VideoWithUser } from '@/types'
import { formatSubscribers, cn } from '@/lib/utils'

interface Channel {
  id: string
  name: string
  handle: string
  image: string | null
  description: string | null
  _count: {
    subscribers: number
    videos: number
  }
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('search_query') || ''

  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [uploadDate, setUploadDate] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [type, setType] = useState<string>('all')

  useEffect(() => {
    if (query) {
      fetchResults()
    }
  }, [query, uploadDate, duration, sortBy, type])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        sort: sortBy,
      })

      if (uploadDate) params.set('upload_date', uploadDate)
      if (duration) params.set('duration', duration)

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()

      setVideos(data.videos || [])
      setChannels(data.channels || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadDateOptions = [
    { value: '', label: 'Any time' },
    { value: 'hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ]

  const durationOptions = [
    { value: '', label: 'Any duration' },
    { value: 'short', label: 'Under 4 minutes' },
    { value: 'medium', label: '4-20 minutes' },
    { value: 'long', label: 'Over 20 minutes' },
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Upload date' },
    { value: 'views', label: 'View count' },
    { value: 'rating', label: 'Rating' },
  ]

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'video', label: 'Video' },
    { value: 'channel', label: 'Channel' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-youtube-text hover:text-white"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-youtube-gray rounded-lg">
            {/* Upload date */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload date</label>
              <select
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full bg-youtube-dark border border-youtube-lightgray rounded px-3 py-2 text-sm"
              >
                {uploadDateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-youtube-dark border border-youtube-lightgray rounded px-3 py-2 text-sm"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-youtube-dark border border-youtube-lightgray rounded px-3 py-2 text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-youtube-dark border border-youtube-lightgray rounded px-3 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-[360px] aspect-video bg-youtube-gray rounded-xl" />
              <div className="flex-1">
                <div className="h-6 bg-youtube-gray rounded w-3/4 mb-2" />
                <div className="h-4 bg-youtube-gray rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Channels */}
          {channels.length > 0 && (type === 'all' || type === 'channel') && (
            <div className="mb-8">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-youtube-gray rounded-lg"
                >
                  {channel.image ? (
                    <Image
                      src={channel.image}
                      alt={channel.name}
                      width={136}
                      height={136}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-34 h-34 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-medium">
                      {channel.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{channel.name}</h3>
                    <p className="text-sm text-youtube-text">
                      @{channel.handle} • {formatSubscribers(channel._count.subscribers)}
                    </p>
                    {channel.description && (
                      <p className="text-sm text-youtube-text mt-1 line-clamp-2">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (type === 'all' || type === 'video') && (
            <div className="space-y-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} layout="list" />
              ))}
            </div>
          )}

          {/* No results */}
          {videos.length === 0 && channels.length === 0 && (
            <div className="text-center py-20 text-youtube-text">
              <p className="text-xl mb-2">No results found</p>
              <p>Try different keywords or remove search filters</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}
