import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    })

    if (!playlist || playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if video already in playlist
    const existing = await prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId: params.playlistId,
          videoId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Video already in playlist' },
        { status: 400 }
      )
    }

    // Get the next position
    const lastVideo = await prisma.playlistVideo.findFirst({
      where: { playlistId: params.playlistId },
      orderBy: { position: 'desc' },
    })

    const position = (lastVideo?.position ?? -1) + 1

    // Add video to playlist
    const playlistVideo = await prisma.playlistVideo.create({
      data: {
        playlistId: params.playlistId,
        videoId,
        position,
      },
    })

    // Update playlist updatedAt
    await prisma.playlist.update({
      where: { id: params.playlistId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(playlistVideo, { status: 201 })
  } catch (error) {
    console.error('Error adding video to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add video to playlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    })

    if (!playlist || playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Remove video from playlist
    await prisma.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId: params.playlistId,
          videoId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing video from playlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove video from playlist' },
      { status: 500 }
    )
  }
}
