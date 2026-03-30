import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, video, channel, playlist
    const uploadDate = searchParams.get('upload_date') // hour, today, week, month, year
    const duration = searchParams.get('duration') // short, medium, long
    const sortBy = searchParams.get('sort') || 'relevance' // relevance, date, views, rating

    if (!query.trim()) {
      return NextResponse.json({ videos: [], channels: [] })
    }

    // Build video filters
    const videoWhere: any = {
      isPublic: true,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
      ],
    }

    // Upload date filter
    if (uploadDate) {
      const now = new Date()
      let dateFilter: Date

      switch (uploadDate) {
        case 'hour':
          dateFilter = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          dateFilter = new Date(0)
      }

      videoWhere.createdAt = { gte: dateFilter }
    }

    // Duration filter
    if (duration) {
      switch (duration) {
        case 'short':
          videoWhere.duration = { lt: 240 } // Under 4 minutes
          break
        case 'medium':
          videoWhere.duration = { gte: 240, lte: 1200 } // 4-20 minutes
          break
        case 'long':
          videoWhere.duration = { gt: 1200 } // Over 20 minutes
          break
      }
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'date':
        orderBy = { createdAt: 'desc' }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'rating':
        orderBy = { views: 'desc' } // Using views as proxy for rating
        break
    }

    const results: any = {}

    if (type === 'all' || type === 'video') {
      const videos = await prisma.video.findMany({
        where: videoWhere,
        orderBy,
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              handle: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })
      results.videos = videos
    }

    if (type === 'all' || type === 'channel') {
      const channels = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { handle: { contains: query } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          handle: true,
          image: true,
          description: true,
          _count: {
            select: {
              subscribers: true,
              videos: true,
            },
          },
        },
      })
      results.channels = channels
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
