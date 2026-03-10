import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useSharedSongs, useCreateSharedSong } from '@/lib/hooks'
import { useAuthStore } from '@/store/auth.store'

export default function SharedSongsPage() {
  const [title, setTitle] = useState('')
  const { data, isLoading, error } = useSharedSongs()
  const createSong = useCreateSharedSong()
  const user = useAuthStore((s) => s.user)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    createSong.mutate(trimmed, {
      onSuccess: () => setTitle(''),
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Shared Songs</h1>

      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Create a new shared song..."
          maxLength={100}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={createSong.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createSong.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      {data && data.length === 0 && (
        <p className="text-muted-foreground">No shared songs yet. Create one above!</p>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((song) => (
            <Link
              key={song.id}
              to="/shared-songs/$id"
              params={{ id: String(song.id) }}
              className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{song.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    by {song.creatorUsername}
                    {song.creatorId === user?.id && ' (you)'}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  {song.memberCount} {song.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {song.members.map((m) => (
                  <span key={m.id} className="text-xs text-muted-foreground">
                    @{m.username}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
