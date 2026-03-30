import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriberId = (session.user as any).id
    const subscribedToId = params.channelId

    if (subscriberId === subscribedToId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId,
          subscribedToId,
        },
      },
    })

    if (existingSubscription) {
      // Unsubscribe
      await prisma.subscription.delete({
        where: { id: existingSubscription.id },
      })
      return NextResponse.json({ subscribed: false })
    }

    // Subscribe
    await prisma.subscription.create({
      data: {
        subscriberId,
        subscribedToId,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'subscription',
        message: 'subscribed to your channel',
        recipientId: subscribedToId,
        senderId: subscriberId,
      },
    })

    return NextResponse.json({ subscribed: true })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
