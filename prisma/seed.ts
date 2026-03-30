import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'demo@youtube.com' },
    update: {},
    create: {
      email: 'demo@youtube.com',
      name: 'Demo User',
      handle: 'demouser',
      password: hashedPassword,
      image: 'https://picsum.photos/seed/user1/200',
      description: 'Welcome to my channel! I create amazing content.',
      bannerImage: 'https://picsum.photos/seed/banner1/1200/300',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'techguru@youtube.com' },
    update: {},
    create: {
      email: 'techguru@youtube.com',
      name: 'Tech Guru',
      handle: 'techguru',
      password: hashedPassword,
      image: 'https://picsum.photos/seed/user2/200',
      description: 'Your daily dose of tech news and reviews!',
      bannerImage: 'https://picsum.photos/seed/banner2/1200/300',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'musicmaster@youtube.com' },
    update: {},
    create: {
      email: 'musicmaster@youtube.com',
      name: 'Music Master',
      handle: 'musicmaster',
      password: hashedPassword,
      image: 'https://picsum.photos/seed/user3/200',
      description: 'Music videos, covers, and original songs!',
      bannerImage: 'https://picsum.photos/seed/banner3/1200/300',
    },
  })

  // Sample video URLs (using sample videos)
  const sampleVideos = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  ]

  const videoData = [
    { title: 'Big Buck Bunny - Full Movie', description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.', category: 'Entertainment', duration: 596 },
    { title: 'Elephants Dream - Award Winning Animation', description: 'The first Blender Open Movie from 2006. A surreal journey into a mechanical world.', category: 'Film & Animation', duration: 653 },
    { title: 'For Bigger Blazes - Action Trailer', description: 'An action-packed trailer that will keep you on the edge of your seat!', category: 'Entertainment', duration: 15 },
    { title: 'For Bigger Escapes - Adventure Awaits', description: 'Experience the thrill of adventure in this stunning visual journey.', category: 'Travel & Events', duration: 15 },
    { title: 'For Bigger Fun - Comedy Gold', description: 'Laugh out loud with this hilarious comedy compilation.', category: 'Comedy', duration: 60 },
    { title: 'For Bigger Joyrides - Ultimate Road Trip', description: 'Join us on the ultimate road trip adventure across stunning landscapes.', category: 'Autos & Vehicles', duration: 15 },
    { title: 'For Bigger Meltdowns - Drama Unfolds', description: 'Witness intense drama and emotional storytelling at its finest.', category: 'Entertainment', duration: 15 },
    { title: 'Sintel - Epic Fantasy Adventure', description: 'Sintel is a fantasy short film about a girl searching for her lost dragon companion.', category: 'Film & Animation', duration: 888 },
    { title: 'Subaru Outback Review - On Street and Dirt', description: 'Comprehensive review of the Subaru Outback both on road and off-road conditions.', category: 'Autos & Vehicles', duration: 596 },
    { title: 'Tears of Steel - Sci-Fi Masterpiece', description: 'A sci-fi short film about a group of warriors fighting robots in a post-apocalyptic Amsterdam.', category: 'Film & Animation', duration: 734 },
  ]

  // Create videos
  const users = [user1, user2, user3]

  for (let i = 0; i < videoData.length; i++) {
    const user = users[i % users.length]
    const video = videoData[i]

    await prisma.video.upsert({
      where: { id: `video-${i + 1}` },
      update: {},
      create: {
        id: `video-${i + 1}`,
        title: video.title,
        description: video.description,
        videoUrl: sampleVideos[i],
        thumbnailUrl: `https://picsum.photos/seed/thumb${i + 1}/640/360`,
        duration: video.duration,
        views: Math.floor(Math.random() * 1000000) + 1000,
        category: video.category,
        tags: video.category.toLowerCase().replace(' & ', ','),
        userId: user.id,
      },
    })
  }

  // Create some shorts
  const shortsData = [
    { title: 'Amazing sunset timelapse! #shorts', description: 'Watch this beautiful sunset in 60 seconds', duration: 30 },
    { title: 'Quick cooking hack you need to know! #shorts', description: 'This hack will change your life', duration: 45 },
    { title: 'Funny cat moment #shorts', description: 'You wont believe what happened next', duration: 20 },
    { title: 'Mind-blowing science fact #shorts', description: 'Did you know this?', duration: 25 },
    { title: 'Epic sports moment #shorts', description: 'Incredible play caught on camera', duration: 15 },
  ]

  for (let i = 0; i < shortsData.length; i++) {
    const user = users[i % users.length]
    const short = shortsData[i]

    await prisma.video.upsert({
      where: { id: `short-${i + 1}` },
      update: {},
      create: {
        id: `short-${i + 1}`,
        title: short.title,
        description: short.description,
        videoUrl: sampleVideos[i % sampleVideos.length],
        thumbnailUrl: `https://picsum.photos/seed/short${i + 1}/360/640`,
        duration: short.duration,
        views: Math.floor(Math.random() * 5000000) + 10000,
        isShort: true,
        userId: user.id,
      },
    })
  }

  // Create default playlists for each user
  for (const user of users) {
    await prisma.playlist.upsert({
      where: { id: `watch-later-${user.id}` },
      update: {},
      create: {
        id: `watch-later-${user.id}`,
        name: 'Watch Later',
        description: 'Videos to watch later',
        userId: user.id,
      },
    })

    await prisma.playlist.upsert({
      where: { id: `liked-videos-${user.id}` },
      update: {},
      create: {
        id: `liked-videos-${user.id}`,
        name: 'Liked Videos',
        description: 'Videos you have liked',
        userId: user.id,
      },
    })
  }

  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
