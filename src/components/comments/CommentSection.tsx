'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { ThumbsUp, ThumbsDown, ChevronDown, MoreVertical, Flag, Edit2, Trash2 } from 'lucide-react'
import { CommentWithUser } from '@/types'
import { formatTimeAgo, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CommentSectionProps {
  videoId: string
  commentCount: number
}

export function CommentSection({ videoId, commentCount }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [videoId, sortBy])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments?sort=${sortBy}`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!session) {
      toast.error('Please sign in to comment')
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.trim() }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment('')
        setShowCommentInput(false)
        toast.success('Comment added!')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-xl font-semibold">{commentCount} Comments</h2>
        <div className="relative">
          <button className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6H3V5h18v1zm-6 5H3v1h12v-1zm-6 5H3v1h6v-1z" />
            </svg>
            Sort by
          </button>
        </div>
      </div>

      {/* Add comment */}
      <div className="flex gap-4 mb-6">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || ''}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="flex-1">
          {showCommentInput || newComment ? (
            <>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-transparent border-b border-youtube-lightgray focus:border-white outline-none resize-none py-2"
                rows={1}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setNewComment('')
                    setShowCommentInput(false)
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </>
          ) : (
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-youtube-lightgray focus:border-white outline-none py-2"
              onFocus={() => setShowCommentInput(true)}
            />
          )}
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-youtube-gray rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-youtube-gray rounded w-32 mb-2" />
                <div className="h-4 bg-youtube-gray rounded w-full mb-1" />
                <div className="h-4 bg-youtube-gray rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-youtube-text text-center py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              videoId={videoId}
              onDelete={(id) => setComments(comments.filter((c) => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithUser
  videoId: string
  onDelete: (id: string) => void
}

function CommentItem({ comment, videoId, onDelete }: CommentItemProps) {
  const { data: session } = useSession()
  const [showReplies, setShowReplies] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState<CommentWithUser[]>(comment.replies || [])

  const isOwner = session?.user && (session.user as any).id === comment.userId

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like comments')
      return
    }

    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST',
      })
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(likeCount)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(comment.id)
        toast.success('Comment deleted')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleReply = async () => {
    if (!session) {
      toast.error('Please sign in to reply')
      return
    }

    if (!replyText.trim()) return

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText.trim(), parentId: comment.id }),
      })

      if (response.ok) {
        const reply = await response.json()
        setReplies([...replies, reply])
        setReplyText('')
        setShowReplyInput(false)
        setShowReplies(true)
        toast.success('Reply added!')
      }
    } catch (error) {
      toast.error('Failed to add reply')
    }
  }

  return (
    <div className="flex gap-4 group">
      {comment.user.image ? (
        <Image
          src={comment.user.image}
          alt={comment.user.name || ''}
          width={40}
          height={40}
          className="rounded-full flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
          {comment.user.name?.[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">@{comment.user.handle || comment.user.name}</span>
          <span className="text-xs text-youtube-text">{formatTimeAgo(comment.createdAt)}</span>
        </div>

        <p className="text-sm whitespace-pre-wrap mb-2">{comment.text}</p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={cn('flex items-center gap-1 text-sm', isLiked && 'text-youtube-blue')}
          >
            <ThumbsUp className={cn('w-4 h-4', isLiked && 'fill-current')} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          <button className="text-sm">
            <ThumbsDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-sm font-medium"
          >
            Reply
          </button>
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-4 flex gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add a reply..."
                className="w-full bg-transparent border-b border-youtube-lightgray focus:border-white outline-none py-1 text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setReplyText('')
                    setShowReplyInput(false)
                  }}
                  className="btn btn-secondary text-sm py-1 px-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="btn btn-primary text-sm py-1 px-3 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show replies button */}
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-youtube-blue text-sm font-medium mt-2"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', showReplies && 'rotate-180')} />
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Replies */}
        {showReplies && (
          <div className="mt-4 space-y-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                videoId={videoId}
                onDelete={(id) => setReplies(replies.filter((r) => r.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="icon-btn p-1 opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="dropdown-menu open right-0 top-full z-50">
              {isOwner && (
                <>
                  <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button className="flex items-center gap-3 px-4 py-2 hover:bg-youtube-hover w-full text-left">
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
