'use client'

import { useState, useEffect } from 'react'
import { VideoGrid, CategoryChips } from '@/components/video'
import { VideoWithUser, Category } from '@/types'

export default function HomePage() {
  const [videos, setVideos] = useState<VideoWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')

  useEffect(() => {
    fetchVideos()
  }, [selectedCategory])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        isShort: 'false',
      })

      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory)
      }

      const response = await fetch(`/api/videos?${params}`)
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="sticky top-header bg-youtube-dark z-30 py-3 -mt-3 -mx-6 px-6">
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div className="mt-6">
        <VideoGrid videos={videos} loading={loading} />
      </div>
    </div>
  )
}
