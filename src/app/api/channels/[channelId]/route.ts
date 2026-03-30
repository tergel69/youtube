import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = (session?.user as any)?.id

    const channel = await prisma.user.findUnique({
      where: { id: params.channelId },
      select: {
        id: true,
        name: true,
        handle: true,
        image: true,
        bannerImage: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
      },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if current user is subscribed
    let isSubscribed = false
    if (currentUserId && currentUserId !== params.channelId) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_subscribedToId: {
            subscriberId: currentUserId,
            subscribedToId: params.channelId,
          },
        },
      })
      isSubscribed = !!subscription
    }

    return NextResponse.json({ ...channel, isSubscribed })
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    )
  }
}
