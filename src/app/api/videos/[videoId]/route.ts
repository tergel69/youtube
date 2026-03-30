import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            handle: true,
            description: true,
            _count: {
              select: {
                subscribers: true,
              },
            },
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

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if user has liked/disliked the video
    let isLiked = false
    let isDisliked = false
    let isSubscribed = false

    if (userId) {
      const [like, dislike, subscription] = await Promise.all([
        prisma.like.findUnique({
          where: { userId_videoId: { userId, videoId: params.videoId } },
        }),
        prisma.dislike.findUnique({
          where: { userId_videoId: { userId, videoId: params.videoId } },
        }),
        prisma.subscription.findUnique({
          where: {
            subscriberId_subscribedToId: {
              subscriberId: userId,
              subscribedToId: video.userId,
            },
          },
        }),
      ])

      isLiked = !!like
      isDisliked = !!dislike
      isSubscribed = !!subscription
    }

    // Increment view count
    await prisma.video.update({
      where: { id: params.videoId },
      data: { views: { increment: 1 } },
    })

    // Add to history if logged in
    if (userId) {
      await prisma.history.upsert({
        where: { userId_videoId: { userId, videoId: params.videoId } },
        update: { watchedAt: new Date() },
        create: { userId, videoId: params.videoId },
      })
    }

    return NextResponse.json({
      ...video,
      isLiked,
      isDisliked,
      user: {
        ...video.user,
        isSubscribed,
      },
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    // Check if user owns the video
    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
    })

    if (!video || video.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: params.videoId },
      data: {
        title: body.title,
        description: body.description,
        thumbnailUrl: body.thumbnailUrl,
        isPublic: body.isPublic,
        category: body.category,
        tags: body.tags,
      },
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user owns the video
    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
    })

    if (!video || video.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.video.delete({
      where: { id: params.videoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
