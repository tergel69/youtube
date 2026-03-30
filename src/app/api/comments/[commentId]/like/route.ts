import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const commentId = params.commentId

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    })

    if (existingLike) {
      // Remove like
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    }

    // Add like
    await prisma.commentLike.create({
      data: { userId, commentId, isLike: true },
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Error liking comment:', error)
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    )
  }
}
