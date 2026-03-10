import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth.store'
import {
  useSharedSong,
  useLyricsPosts,
  useAddLyricsPost,
  useDeleteLyricsPost,
  useFavoriteLyricsPost,
  useUnfavoriteLyricsPost,
  useInviteToSharedSong,
  useLyricsComments,
  useAddLyricsComment,
} from '@/lib/hooks'

export default function SharedSongDetailPage() {
  const { id } = useParams({ from: '/shared-songs/$id' })
  const sharedSongId = Number(id)
  const user = useAuthStore((s) => s.user)

  const song = useSharedSong(sharedSongId)
  const posts = useLyricsPosts(sharedSongId)
  const addPost = useAddLyricsPost()
  const deletePost = useDeleteLyricsPost()
  const favorite = useFavoriteLyricsPost()
  const unfavorite = useUnfavoriteLyricsPost()
  const invite = useInviteToSharedSong()

  const [newLyrics, setNewLyrics] = useState('')
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [expandedComments, setExpandedComments] = useState<number | null>(null)

  const isCreator = song.data?.creatorId === user?.id

  const handleAddLyrics = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newLyrics.trim()
    if (!trimmed) return
    addPost.mutate({ sharedSongId, content: trimmed }, {
      onSuccess: () => setNewLyrics(''),
    })
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')
    const trimmed = inviteUsername.trim()
    if (!trimmed) return
    invite.mutate({ sharedSongId, username: trimmed }, {
      onSuccess: () => setInviteUsername(''),
      onError: (err) => setInviteError(err.message),
    })
  }

  if (song.isLoading) return <p className="text-muted-foreground">Loading...</p>
  if (song.error) return <p className="text-red-500">{song.error.message}</p>
  if (!song.data) return null

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{song.data.title}</h1>
        <p className="text-sm text-muted-foreground">
          Created by {song.data.creatorUsername}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {song.data.members.map((m) => (
            <span key={m.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              @{m.username}
            </span>
          ))}
        </div>
      </div>

      {isCreator && (
        <form onSubmit={handleInvite} className="mb-6 flex gap-2">
          <input
            type="text"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            placeholder="Invite by username..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={invite.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Invite
          </button>
        </form>
      )}
      {inviteError && <p className="mb-4 text-sm text-red-500">{inviteError}</p>}
      {invite.isSuccess && <p className="mb-4 text-sm text-green-500">Invited!</p>}

      <form onSubmit={handleAddLyrics} className="mb-8">
        <textarea
          value={newLyrics}
          onChange={(e) => setNewLyrics(e.target.value)}
          placeholder="Add your lyrics..."
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <button
          type="submit"
          disabled={addPost.isPending || !newLyrics.trim()}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {addPost.isPending ? 'Posting...' : 'Post Lyrics'}
        </button>
      </form>

      {posts.isLoading && <p className="text-muted-foreground">Loading lyrics...</p>}

      {posts.data && posts.data.length === 0 && (
        <p className="text-muted-foreground">No lyrics yet. Be the first to add some!</p>
      )}

      {posts.data && posts.data.length > 0 && (
        <div className="space-y-4">
          {posts.data.map((post) => (
            <div key={post.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">@{post.authorUsername}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isCreator && (
                  <button
                    onClick={() => deletePost.mutate({ sharedSongId, postId: post.id })}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>

              <pre className="whitespace-pre-wrap text-sm leading-relaxed mb-3">{post.content}</pre>

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() =>
                    post.isFavorited
                      ? unfavorite.mutate({ postId: post.id, sharedSongId })
                      : favorite.mutate({ postId: post.id, sharedSongId })
                  }
                  className={`transition-colors ${post.isFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                >
                  {post.isFavorited ? '&#9829;' : '&#9825;'} {post.favoriteCount}
                </button>

                <button
                  onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Comments ({post.commentCount})
                </button>
              </div>

              {expandedComments === post.id && (
                <CommentsSection postId={post.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentsSection({ postId }: { postId: number }) {
  const comments = useLyricsComments(postId)
  const addComment = useAddLyricsComment()
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addComment.mutate({ postId, content: trimmed }, {
      onSuccess: () => setText(''),
    })
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      {comments.isLoading && <p className="text-xs text-muted-foreground">Loading comments...</p>}

      {comments.data && comments.data.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.data.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium">@{c.authorUsername}</span>
              <span className="ml-2 text-muted-foreground">{c.content}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={addComment.isPending || !text.trim()}
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  )
}
