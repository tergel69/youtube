'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  RectangleHorizontal,
  Subtitles,
  PictureInPicture2,
} from 'lucide-react'
import { useVideoPlayerStore } from '@/store'
import { formatDuration, cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
}

export function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isFullscreen,
    isTheater,
    playbackSpeed,
    setPlaying,
    setMuted,
    setVolume,
    setCurrentTime,
    setDuration,
    setFullscreen,
    setTheater,
    setPlaybackSpeed,
  } = useVideoPlayerStore()

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)
    const handleEnded = () => setPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [setDuration, setCurrentTime, setPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(!isMuted)
  }, [isMuted, setMuted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setMuted(false)
    }
  }, [isMuted, setVolume, setMuted])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progress = progressRef.current
    if (!video || !progress) return

    const rect = progress.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * video.duration
  }, [])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      await container.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }, [setFullscreen])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch (error) {
      console.error('PiP error:', error)
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'm':
          toggleMute()
          break
        case 'f':
          toggleFullscreen()
          break
        case 't':
          setTheater(!isTheater)
          break
        case 'arrowleft':
        case 'j':
          skip(-10)
          break
        case 'arrowright':
        case 'l':
          skip(10)
          break
        case 'arrowup':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, toggleMute, toggleFullscreen, isTheater, setTheater, skip, volume, setVolume])

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black group',
        isTheater ? 'w-full' : 'aspect-video',
        isFullscreen && 'fixed inset-0 z-50'
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Play/Pause overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
        onClick={togglePlay}
      >
        {!isPlaying && (
          <button className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-2 px-3 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="h-1 bg-white/30 rounded cursor-pointer mb-2 group/progress"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-youtube-red rounded relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-youtube-red rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="icon-btn p-1">
              {isPlaying ? (
                <Pause className="w-6 h-6" fill="white" />
              ) : (
                <Play className="w-6 h-6" fill="white" />
              )}
            </button>

            <button onClick={() => skip(-10)} className="icon-btn p-1">
              <SkipBack className="w-5 h-5" />
            </button>

            <button onClick={() => skip(10)} className="icon-btn p-1">
              <SkipForward className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 group/volume">
              <button onClick={toggleMute} className="icon-btn p-1">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all accent-white"
              />
            </div>

            <div className="text-sm ml-2">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span className="mx-1">/</span>
              <span>{formatDuration(Math.floor(duration))}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="icon-btn p-1 relative">
              <Settings className="w-5 h-5" />
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-youtube-gray rounded-lg shadow-lg py-2 min-w-[200px]">
                  <div className="px-4 py-2 border-b border-youtube-lightgray">
                    <span className="text-sm font-medium">Playback speed</span>
                  </div>
                  {speeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed)
                        setShowSettings(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-youtube-hover',
                        playbackSpeed === speed && 'text-youtube-blue'
                      )}
                    >
                      {speed === 1 ? 'Normal' : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </button>

            <button onClick={() => {}} className="icon-btn p-1">
              <Subtitles className="w-5 h-5" />
            </button>

            <button onClick={togglePiP} className="icon-btn p-1">
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            <button onClick={() => setTheater(!isTheater)} className="icon-btn p-1">
              <RectangleHorizontal className="w-5 h-5" />
            </button>

            <button onClick={toggleFullscreen} className="icon-btn p-1">
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
