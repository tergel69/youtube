import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  isMini: boolean
  toggle: () => void
  setMini: (value: boolean) => void
  close: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isMini: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setMini: (value) => set({ isMini: value }),
  close: () => set({ isOpen: false }),
}))

interface SearchState {
  query: string
  isOpen: boolean
  recentSearches: string[]
  setQuery: (query: string) => void
  setOpen: (open: boolean) => void
  addRecentSearch: (search: string) => void
  clearRecentSearches: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      isOpen: false,
      recentSearches: [],
      setQuery: (query) => set({ query }),
      setOpen: (open) => set({ isOpen: open }),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((s) => s !== search),
          ].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'search-storage',
    }
  )
)

interface VideoPlayerState {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  currentTime: number
  duration: number
  isFullscreen: boolean
  isTheater: boolean
  isMiniPlayer: boolean
  playbackSpeed: number
  quality: string
  setPlaying: (playing: boolean) => void
  setMuted: (muted: boolean) => void
  setVolume: (volume: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setFullscreen: (fullscreen: boolean) => void
  setTheater: (theater: boolean) => void
  setMiniPlayer: (mini: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  setQuality: (quality: string) => void
}

export const useVideoPlayerStore = create<VideoPlayerState>((set) => ({
  isPlaying: false,
  isMuted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isFullscreen: false,
  isTheater: false,
  isMiniPlayer: false,
  playbackSpeed: 1,
  quality: 'auto',
  setPlaying: (playing) => set({ isPlaying: playing }),
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setTheater: (theater) => set({ isTheater: theater }),
  setMiniPlayer: (mini) => set({ isMiniPlayer: mini }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setQuality: (quality) => set({ quality }),
}))

interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  resetUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}))

interface ModalState {
  activeModal: string | null
  modalData: any
  openModal: (modal: string, data?: any) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalData: null,
  openModal: (modal, data) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))

interface HistoryState {
  watchHistory: string[]
  addToHistory: (videoId: string) => void
  removeFromHistory: (videoId: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      watchHistory: [],
      addToHistory: (videoId) =>
        set((state) => ({
          watchHistory: [
            videoId,
            ...state.watchHistory.filter((id) => id !== videoId),
          ].slice(0, 100),
        })),
      removeFromHistory: (videoId) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((id) => id !== videoId),
        })),
      clearHistory: () => set({ watchHistory: [] }),
    }),
    {
      name: 'history-storage',
    }
  )
)
