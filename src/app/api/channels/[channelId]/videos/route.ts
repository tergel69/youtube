import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const type = searchParams.get('type') || 'all' // all, videos, shorts

    const where: any = {
      userId: params.channelId,
      isPublic: true,
    }

    if (type === 'videos') {
      where.isShort = false
    } else if (type === 'shorts') {
      where.isShort = true
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'popular') {
      orderBy = { views: 'desc' }
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy,
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

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching channel videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channel videos' },
      { status: 500 }
    )
  }
}
