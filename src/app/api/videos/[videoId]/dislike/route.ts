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

    // Check if already disliked
    const existingDislike = await prisma.dislike.findUnique({
      where: { userId_videoId: { userId, videoId } },
    })

    if (existingDislike) {
      // Remove dislike
      await prisma.dislike.delete({
        where: { id: existingDislike.id },
      })
      return NextResponse.json({ disliked: false })
    }

    // Remove like if exists
    await prisma.like.deleteMany({
      where: { userId, videoId },
    })

    // Add dislike
    await prisma.dislike.create({
      data: { userId, videoId },
    })

    return NextResponse.json({ disliked: true })
  } catch (error) {
    console.error('Error disliking video:', error)
    return NextResponse.json(
      { error: 'Failed to dislike video' },
      { status: 500 }
    )
  }
}
