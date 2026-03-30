import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const videoId = params.videoId

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    })

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    }

    // Remove dislike if exists
    await prisma.dislike.deleteMany({
      where: { userId, videoId },
    })

    // Add like
    await prisma.like.create({
      data: { userId, videoId },
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Error liking video:', error)
    return NextResponse.json(
      { error: 'Failed to like video' },
      { status: 500 }
    )
  }
}
