/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'i.ytimg.com',
      'utfs.io',
      'uploadthing.com',
      'picsum.photos',
      'images.unsplash.com'
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
