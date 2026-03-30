'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories, Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryChipsProps {
  selected: Category
  onSelect: (category: Category) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkArrows()
    window.addEventListener('resize', checkArrows)
    return () => window.removeEventListener('resize', checkArrows)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkArrows, 300)
    }
  }

  return (
    <div className="relative">
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-r from-youtube-dark via-youtube-dark to-transparent w-24 h-full flex items-center">
            <button
              onClick={() => scroll('left')}
              className="icon-btn bg-youtube-dark"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={checkArrows}
        className="category-chips"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={cn('chip', selected === category && 'active')}
          >
            {category}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="bg-gradient-to-l from-youtube-dark via-youtube-dark to-transparent w-24 h-full flex items-center justify-end">
            <button
              onClick={() => scroll('right')}
              className="icon-btn bg-youtube-dark"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
