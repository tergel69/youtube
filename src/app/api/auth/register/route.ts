import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate handle from name
    const baseHandle = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    let handle = baseHandle
    let counter = 1

    // Ensure handle is unique
    while (await prisma.user.findUnique({ where: { handle } })) {
      handle = `${baseHandle}${counter}`
      counter++
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        handle,
      },
    })

    // Create default playlists
    await prisma.playlist.createMany({
      data: [
        {
          id: `watch-later-${user.id}`,
          name: 'Watch Later',
          description: 'Videos to watch later',
          userId: user.id,
        },
        {
          id: `liked-videos-${user.id}`,
          name: 'Liked Videos',
          description: 'Videos you have liked',
          userId: user.id,
        },
      ],
    })

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
