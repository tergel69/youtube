import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')
    const isShort = searchParams.get('isShort') === 'true'

    const where: any = {
      isPublic: true,
      isShort,
    }

    if (category && category !== 'All') {
      where.category = category
    }

    const videos = await prisma.video.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
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
            dislikes: true,
            comments: true,
          },
        },
      },
    })

    let nextCursor: string | undefined
    if (videos.length > limit) {
      const nextItem = videos.pop()
      nextCursor = nextItem?.id
    }

    return NextResponse.json({
      videos,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, duration, isPublic, isShort, category, tags, userId } = body

    if (!title || !videoUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration: duration || 0,
        isPublic: isPublic ?? true,
        isShort: isShort ?? false,
        category,
        tags,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            handle: true,
          },
        },
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
