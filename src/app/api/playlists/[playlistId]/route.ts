import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            handle: true,
          },
        },
        videos: {
          orderBy: { position: 'asc' },
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
        },
        _count: {
          select: { videos: true },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    })

    if (!playlist || playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: params.playlistId },
      data: {
        name: body.name,
        description: body.description,
        isPublic: body.isPublic,
      },
    })

    return NextResponse.json(updatedPlaylist)
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to update playlist' },
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

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    })

    if (!playlist || playlist.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.playlist.delete({
      where: { id: params.playlistId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    )
  }
}
