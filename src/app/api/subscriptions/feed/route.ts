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

    // Get subscribed channel IDs
    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { subscribedToId: true },
    })

    const channelIds = subscriptions.map((s) => s.subscribedToId)

    if (channelIds.length === 0) {
      return NextResponse.json({ videos: [], channels: [] })
    }

    // Get videos from subscribed channels
    const videos = await prisma.video.findMany({
      where: {
        userId: { in: channelIds },
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    // Get subscribed channels
    const channels = await prisma.user.findMany({
      where: { id: { in: channelIds } },
      select: {
        id: true,
        name: true,
        image: true,
        handle: true,
      },
    })

    return NextResponse.json({ videos, channels })
  } catch (error) {
    console.error('Error fetching subscriptions feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
