import { User, Video, Comment, Playlist, Notification } from '@prisma/client'

export type VideoWithUser = Video & {
  user: Pick<User, 'id' | 'name' | 'image' | 'handle'>
  _count?: {
    likes: number
    dislikes: number
    comments: number
  }
  isLiked?: boolean
  isDisliked?: boolean
}

export type CommentWithUser = Comment & {
  user: Pick<User, 'id' | 'name' | 'image' | 'handle'>
  replies?: CommentWithUser[]
  _count?: {
    likes: number
    replies: number
  }
  isLiked?: boolean
}

export type PlaylistWithVideos = Playlist & {
  videos: {
    video: VideoWithUser
    position: number
  }[]
  _count?: {
    videos: number
  }
}

export type UserWithStats = User & {
  _count?: {
    videos: number
    subscribers: number
    subscriptions: number
  }
  isSubscribed?: boolean
}

export type NotificationWithDetails = Notification & {
  sender?: Pick<User, 'id' | 'name' | 'image' | 'handle'> | null
  video?: Pick<Video, 'id' | 'title' | 'thumbnailUrl'> | null
}

export interface SearchFilters {
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year'
  type?: 'video' | 'channel' | 'playlist'
  duration?: 'short' | 'medium' | 'long'
  sortBy?: 'relevance' | 'date' | 'views' | 'rating'
}

export type Category =
  | 'All'
  | 'Gaming'
  | 'Music'
  | 'News'
  | 'Sports'
  | 'Entertainment'
  | 'Comedy'
  | 'Education'
  | 'Science & Technology'
  | 'Film & Animation'
  | 'Autos & Vehicles'
  | 'Travel & Events'
  | 'Howto & Style'
  | 'People & Blogs'

export const categories: Category[] = [
  'All',
  'Gaming',
  'Music',
  'News',
  'Sports',
  'Entertainment',
  'Comedy',
  'Education',
  'Science & Technology',
  'Film & Animation',
  'Autos & Vehicles',
  'Travel & Events',
  'Howto & Style',
  'People & Blogs',
]
