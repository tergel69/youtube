import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 100,
      include: {
        video: {
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
        },
      },
    })

    // Transform to match VideoWithUser type
    const videos = history.map((h) => ({
      ...h.video,
      watchedAt: h.watchedAt,
      progress: h.progress,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (videoId) {
      // Delete specific video from history
      await prisma.history.deleteMany({
        where: { userId, videoId },
      })
    } else {
      // Clear all history
      await prisma.history.deleteMany({
        where: { userId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing history:', error)
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    )
  }
}
