import { Link } from '@tanstack/react-router'
import { useFavorites, useRemoveFavorite } from '@/lib/hooks'
import { SongCard } from '@/components/SongCard'

export default function FavoritesPage() {
  const { data: songs, isLoading, error } = useFavorites()
  const removeFavorite = useRemoveFavorite()

  if (isLoading) return <p className="text-muted-foreground">Loading favorites...</p>
  if (error) return <p className="text-red-500">{error.message}</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Favorites</h1>

      {songs && songs.length === 0 && (
        <p className="text-muted-foreground">
          No favorites yet. <Link to="/search" className="text-primary hover:underline">Search for songs</Link> to add some.
        </p>
      )}

      {songs && songs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song, i) => (
            <div key={song.spotifyId ?? i} className="relative">
              {song.spotifyId ? (
                <Link to="/songs/$id" params={{ id: song.spotifyId }} className="block">
                  <SongCard song={song} />
                </Link>
              ) : (
                <SongCard song={song} />
              )}
              <button
                onClick={() => removeFavorite.mutate(song.id)}
                disabled={removeFavorite.isPending}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                title="Remove from favorites"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
