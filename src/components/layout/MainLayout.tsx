'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useSidebarStore } from '@/store'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { isOpen, isMini } = useSidebarStore()

  // Pages that use mini sidebar
  const useMiniSidebar = pathname.startsWith('/watch')

  // Pages that have no sidebar
  const noSidebar = pathname.startsWith('/shorts') || pathname.startsWith('/auth')

  return (
    <div className="min-h-screen bg-youtube-dark">
      <Header />

      {!noSidebar && <Sidebar />}

      <main
        className={cn(
          'pt-header min-h-screen',
          noSidebar && 'ml-0',
          !noSidebar && isOpen && !useMiniSidebar && 'ml-sidebar',
          !noSidebar && isMini && 'ml-mini-sidebar',
          !noSidebar && !isOpen && !isMini && 'ml-0'
        )}
      >
        {children}
      </main>
    </div>
  )
}
