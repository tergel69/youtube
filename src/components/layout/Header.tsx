'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  Keyboard,
  Globe,
  Shield,
  X,
  ArrowLeft,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSidebarStore, useSearchStore, useNotificationStore } from '@/store'
import { cn } from '@/lib/utils'

export function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toggle } = useSidebarStore()
  const { query, setQuery, recentSearches, addRecentSearch, setOpen, isOpen } = useSearchStore()
  const { unreadCount } = useNotificationStore()
  const { theme, setTheme } = useTheme()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addRecentSearch(query.trim())
      router.push(`/results?search_query=${encodeURIComponent(query.trim())}`)
      setSearchFocused(false)
      setShowMobileSearch(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-youtube-dark h-header flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="icon-btn hidden sm:flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/" className="flex items-center gap-1">
          <div className="w-8 h-8 bg-youtube-red rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
            </svg>
          </div>
          <span className="text-xl font-semibold hidden sm:inline">YouTube</span>
        </Link>
      </div>

      {/* Center section - Search */}
      <div
        ref={searchRef}
        className={cn(
          'flex-1 max-w-2xl mx-4 hidden md:flex',
          showMobileSearch && 'fixed inset-0 flex md:relative bg-youtube-dark z-50 px-4 items-center'
        )}
      >
        {showMobileSearch && (
          <button
            onClick={() => setShowMobileSearch(false)}
            className="icon-btn mr-2 md:hidden"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        <form onSubmit={handleSearch} className="flex flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search"
              className="w-full h-10 pl-4 pr-10 bg-youtube-dark border border-youtube-lightgray rounded-l-full focus:border-youtube-blue focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Search suggestions dropdown */}
            {searchFocused && (recentSearches.length > 0 || query) && (
              <div className="search-suggestions">
                {recentSearches
                  .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
                  .slice(0, 8)
                  .map((search, i) => (
                    <div
                      key={i}
                      className="search-suggestion-item"
                      onClick={() => {
                        setQuery(search)
                        router.push(`/results?search_query=${encodeURIComponent(search)}`)
                        setSearchFocused(false)
                      }}
                    >
                      <Search className="w-4 h-4 text-youtube-text" />
                      <span>{search}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="h-10 px-6 bg-youtube-gray hover:bg-youtube-lightgray rounded-r-full border border-l-0 border-youtube-lightgray"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        <button className="icon-btn ml-2 hidden sm:flex">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile search button */}
      <button
        onClick={() => setShowMobileSearch(true)}
        className="icon-btn md:hidden"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {session ? (
          <>
            {/* Create button */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="icon-btn"
              >
                <Video className="w-6 h-6" />
              </button>

              {showCreateMenu && (
                <div className="dropdown-menu open right-0 top-full mt-2">
                  <Link
                    href="/upload"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <Video className="w-5 h-5" />
                    <span>Upload video</span>
                  </Link>
                  <Link
                    href="/upload?type=short"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <Video className="w-5 h-5" />
                    <span>Create Short</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="icon-btn relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-menu open right-0 top-full mt-2 w-80">
                  <div className="px-4 py-2 border-b border-youtube-lightgray">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="py-4 text-center text-youtube-text">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full overflow-hidden ml-2"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="avatar"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-sm font-medium">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="dropdown-menu open right-0 top-full mt-2 w-72">
                  <div className="px-4 py-3 border-b border-youtube-lightgray">
                    <div className="flex items-center gap-3">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={40}
                          height={40}
                          className="avatar"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-lg font-medium">
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-sm text-youtube-text">
                          @{(session.user as any)?.handle || 'user'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/channel/${(session.user as any)?.id}`}
                      className="text-youtube-blue text-sm mt-2 block hover:underline"
                      onClick={() => setShowUserMenu(false)}
                    >
                      View your channel
                    </Link>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/studio"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Video className="w-5 h-5" />
                      <span>YouTube Studio</span>
                    </Link>
                    <button
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full"
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                      <span>Appearance: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="py-2 border-t border-youtube-lightgray">
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span>Help</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-3 py-1.5 border border-youtube-blue text-youtube-blue rounded-full hover:bg-youtube-blue/10"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  )
}
