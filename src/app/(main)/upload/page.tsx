'use client'

import { useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileVideo,
  X,
  Image as ImageIcon,
  Globe,
  Lock,
  Users,
} from 'lucide-react'
import { categories } from '@/types'
import toast from 'react-hot-toast'

function UploadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isShort = searchParams.get('type') === 'short'
  const { data: session, status } = useSession()

  const [step, setStep] = useState<'upload' | 'details'>('upload')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDropVideo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
      setStep('details')
    }
  }, [])

  const onDropThumbnail = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }, [])

  const videoDropzone = useDropzone({
    onDrop: onDropVideo,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  const thumbnailDropzone = useDropzone({
    onDrop: onDropThumbnail,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Please sign in to upload')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      // In a real app, you would upload the video to a cloud storage service
      // For this demo, we'll simulate the upload and use a sample video URL

      setUploadProgress(50)

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setUploadProgress(80)

      // Create video in database
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video
          thumbnailUrl: thumbnailPreview || `https://picsum.photos/seed/${Date.now()}/640/360`,
          duration: 596, // Sample duration
          isPublic: visibility === 'public',
          isShort,
          category,
          tags,
          userId: (session.user as any).id,
        }),
      })

      setUploadProgress(100)

      if (!response.ok) {
        throw new Error('Failed to create video')
      }

      const video = await response.json()
      toast.success('Video uploaded successfully!')
      router.push(`/watch?v=${video.id}`)
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to upload</h2>
          <p className="text-youtube-text mb-6">
            You need to sign in to upload videos
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Upload {isShort ? 'Short' : 'video'}
        </h1>

        {step === 'upload' ? (
          <div
            {...videoDropzone.getRootProps()}
            className="border-2 border-dashed border-youtube-lightgray rounded-xl p-12 text-center cursor-pointer hover:border-youtube-blue transition-colors"
          >
            <input {...videoDropzone.getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-youtube-gray rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-youtube-text" />
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag and drop video files to upload
                </p>
                <p className="text-youtube-text text-sm">
                  Your videos will be private until you publish them
                </p>
              </div>
              <button className="btn btn-primary">Select files</button>
              <p className="text-xs text-youtube-text">
                Max file size: 500MB • Supported formats: MP4, MOV, AVI, MKV, WebM
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-youtube-gray rounded-xl p-6">
            {/* Video preview */}
            <div className="flex gap-6 mb-6">
              <div className="w-80 flex-shrink-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {videoUrl && (
                    <video src={videoUrl} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-youtube-text">
                  <FileVideo className="w-4 h-4" />
                  <span className="truncate">{videoFile?.name}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title (required)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a title that describes your video"
                    className="w-full px-4 py-3 bg-youtube-dark border border-youtube-lightgray rounded-lg focus:border-youtube-blue focus:outline-none"
                    maxLength={100}
                  />
                  <p className="text-xs text-youtube-text mt-1">
                    {title.length}/100
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers about your video"
                    className="w-full px-4 py-3 bg-youtube-dark border border-youtube-lightgray rounded-lg focus:border-youtube-blue focus:outline-none resize-none"
                    rows={4}
                    maxLength={5000}
                  />
                  <p className="text-xs text-youtube-text mt-1">
                    {description.length}/5000
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Thumbnail</label>
              <div className="flex gap-4">
                <div
                  {...thumbnailDropzone.getRootProps()}
                  className="w-40 aspect-video border-2 border-dashed border-youtube-lightgray rounded-lg flex items-center justify-center cursor-pointer hover:border-youtube-blue transition-colors"
                >
                  <input {...thumbnailDropzone.getInputProps()} />
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-youtube-text" />
                      <p className="text-xs text-youtube-text">Upload</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-youtube-dark border border-youtube-lightgray rounded-lg focus:border-youtube-blue focus:outline-none"
              >
                <option value="">Select a category</option>
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gaming, tutorial, funny"
                className="w-full px-4 py-3 bg-youtube-dark border border-youtube-lightgray rounded-lg focus:border-youtube-blue focus:outline-none"
              />
            </div>

            {/* Visibility */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', icon: Globe, desc: 'Everyone can watch' },
                  { value: 'unlisted', label: 'Unlisted', icon: Users, desc: 'Anyone with the link can watch' },
                  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can watch' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-4 p-3 bg-youtube-dark rounded-lg cursor-pointer hover:bg-youtube-hover"
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={() => setVisibility(option.value as any)}
                      className="w-4 h-4 accent-youtube-blue"
                    />
                    <option.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-youtube-text">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-youtube-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-youtube-blue transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-youtube-lightgray">
              <button
                onClick={() => {
                  setStep('upload')
                  setVideoFile(null)
                  setVideoUrl('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || !title.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UploadContent />
    </Suspense>
  )
}
