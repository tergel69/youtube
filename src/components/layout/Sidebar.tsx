'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  Flame,
  ShoppingBag,
  Music2,
  Film,
  Radio,
  Gamepad2,
  Newspaper,
  Trophy,
  Lightbulb,
  Shirt,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare,
  Youtube,
  Clapperboard,
  ListVideo,
} from 'lucide-react'
import { useSidebarStore } from '@/store'
import { cn } from '@/lib/utils'

const mainLinks = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Clapperboard, label: 'Shorts', href: '/shorts' },
  { icon: PlaySquare, label: 'Subscriptions', href: '/feed/subscriptions' },
]

const youLinks = [
  { icon: History, label: 'History', href: '/feed/history' },
  { icon: ListVideo, label: 'Playlists', href: '/feed/playlists' },
  { icon: Clock, label: 'Watch later', href: '/playlist?list=WL' },
  { icon: ThumbsUp, label: 'Liked videos', href: '/playlist?list=LL' },
]

const exploreLinks = [
  { icon: Flame, label: 'Trending', href: '/feed/trending' },
  { icon: ShoppingBag, label: 'Shopping', href: '/feed/shopping' },
  { icon: Music2, label: 'Music', href: '/feed/music' },
  { icon: Film, label: 'Movies', href: '/feed/movies' },
  { icon: Radio, label: 'Live', href: '/feed/live' },
  { icon: Gamepad2, label: 'Gaming', href: '/gaming' },
  { icon: Newspaper, label: 'News', href: '/feed/news' },
  { icon: Trophy, label: 'Sports', href: '/feed/sports' },
  { icon: Lightbulb, label: 'Learning', href: '/feed/learning' },
  { icon: Shirt, label: 'Fashion & Beauty', href: '/feed/fashion' },
]

const moreLinks = [
  { icon: Youtube, label: 'YouTube Premium', href: '/premium' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Flag, label: 'Report history', href: '/reporthistory' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
  { icon: MessageSquare, label: 'Send feedback', href: '/feedback' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isOpen, isMini } = useSidebarStore()

  // Mini sidebar for watch page
  if (isMini) {
    return (
      <aside className="fixed left-0 top-header bottom-0 w-mini-sidebar bg-youtube-dark overflow-y-auto hide-scrollbar z-40">
        <nav className="py-2">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'mini-sidebar-item',
                pathname === link.href && 'bg-youtube-gray'
              )}
            >
              <link.icon className="w-6 h-6" />
              <span className="text-[10px] mt-1">{link.label}</span>
            </Link>
          ))}
          {session && (
            <Link
              href="/library"
              className={cn(
                'mini-sidebar-item',
                pathname === '/library' && 'bg-youtube-gray'
              )}
            >
              <PlaySquare className="w-6 h-6" />
              <span className="text-[10px] mt-1">You</span>
            </Link>
          )}
        </nav>
      </aside>
    )
  }

  // Full sidebar
  if (!isOpen) return null

  return (
    <aside className="fixed left-0 top-header bottom-0 w-sidebar bg-youtube-dark overflow-y-auto hide-scrollbar z-40">
      <nav className="py-3 px-3">
        {/* Main links */}
        <div className="pb-3 border-b border-youtube-gray">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'sidebar-item',
                pathname === link.href && 'bg-youtube-gray'
              )}
            >
              <link.icon className="w-6 h-6" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* You section */}
        {session && (
          <div className="py-3 border-b border-youtube-gray">
            <Link
              href="/feed/you"
              className="sidebar-item mb-1"
            >
              <span className="font-medium">You</span>
              <span className="ml-auto">{'>'}</span>
            </Link>
            {youLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'sidebar-item',
                  pathname === link.href && 'bg-youtube-gray'
                )}
              >
                <link.icon className="w-6 h-6" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Subscriptions */}
        {session && (
          <div className="py-3 border-b border-youtube-gray">
            <h3 className="px-3 mb-1 text-sm font-medium">Subscriptions</h3>
            <p className="px-3 py-4 text-sm text-youtube-text">
              Subscribe to channels to see them here
            </p>
          </div>
        )}

        {/* Explore */}
        <div className="py-3 border-b border-youtube-gray">
          <h3 className="px-3 mb-1 text-sm font-medium">Explore</h3>
          {exploreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'sidebar-item',
                pathname === link.href && 'bg-youtube-gray'
              )}
            >
              <link.icon className="w-6 h-6" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* More from YouTube */}
        <div className="py-3 border-b border-youtube-gray">
          <h3 className="px-3 mb-1 text-sm font-medium">More from YouTube</h3>
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'sidebar-item',
                pathname === link.href && 'bg-youtube-gray'
              )}
            >
              <link.icon className="w-6 h-6" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="py-4 px-3">
          <div className="flex flex-wrap gap-2 text-xs text-youtube-text mb-3">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/press" className="hover:underline">Press</Link>
            <Link href="/copyright" className="hover:underline">Copyright</Link>
            <Link href="/contact" className="hover:underline">Contact us</Link>
            <Link href="/creators" className="hover:underline">Creators</Link>
            <Link href="/advertise" className="hover:underline">Advertise</Link>
            <Link href="/developers" className="hover:underline">Developers</Link>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-youtube-text mb-3">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/policy" className="hover:underline">Policy & Safety</Link>
            <Link href="/works" className="hover:underline">How YouTube works</Link>
            <Link href="/new" className="hover:underline">Test new features</Link>
          </div>
          <p className="text-xs text-youtube-text">
            &copy; {new Date().getFullYear()} YouTube Clone
          </p>
        </div>
      </nav>
    </aside>
  )
}
