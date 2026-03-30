'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Play,
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  Lock,
} from 'lucide-react'
import { formatViews } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Playlist {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  _count: { videos: number }
  videos: { video: { thumbnailUrl: string | null } }[]
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(true)

  useEffect(() => {
    if (session) {
      fetchPlaylists()
    }
  }, [session])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      setPlaylists(data.playlists || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name')
      return
    }

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim(),
          isPublic: newPlaylistPublic,
        }),
      })

      if (response.ok) {
        const playlist = await response.json()
        setPlaylists([playlist, ...playlists])
        setShowCreateModal(false)
        setNewPlaylistName('')
        setNewPlaylistDescription('')
        toast.success('Playlist created!')
      }
    } catch (error) {
      toast.error('Failed to create playlist')
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPlaylists(playlists.filter((p) => p.id !== playlistId))
        toast.success('Playlist deleted')
      }
    } catch (error) {
      toast.error('Failed to delete playlist')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-youtube-gray rounded w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-youtube-gray rounded-lg" />
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
          <h2 className="text-xl font-semibold mb-4">Sign in to see your playlists</h2>
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 text-youtube-text">
          <p className="text-xl mb-4">No playlists yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group">
              <Link
                href={`/playlist?list=${playlist.id}`}
                className="block relative aspect-video bg-youtube-gray rounded-lg overflow-hidden mb-2"
              >
                {playlist.videos[0]?.video.thumbnailUrl ? (
                  <Image
                    src={playlist.videos[0].video.thumbnailUrl}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-youtube-text">
                    No videos
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12" fill="white" />
                </div>
                <div className="absolute bottom-0 right-0 bg-black/80 px-2 py-1 m-1 rounded text-xs">
                  {playlist._count.videos} videos
                </div>
              </Link>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/playlist?list=${playlist.id}`}
                    className="font-medium line-clamp-2 hover:text-youtube-blue"
                  >
                    {playlist.name}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-youtube-text mt-1">
                    {playlist.isPublic ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    <span>Playlist</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      deletePlaylist(playlist.id)
                    }}
                    className="icon-btn p-1 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create playlist modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">New playlist</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full px-4 py-2 bg-youtube-dark border border-youtube-lightgray rounded-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full px-4 py-2 bg-youtube-dark border border-youtube-lightgray rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Visibility</label>
                <select
                  value={newPlaylistPublic ? 'public' : 'private'}
                  onChange={(e) => setNewPlaylistPublic(e.target.value === 'public')}
                  className="w-full px-4 py-2 bg-youtube-dark border border-youtube-lightgray rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={createPlaylist} className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
