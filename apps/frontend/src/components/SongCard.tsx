import type { Song } from '@app/shared'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  return (
    <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <div className="flex gap-3">
        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.title}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xl text-muted-foreground">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{song.title}</h3>
          <p className="truncate text-sm text-muted-foreground">{song.artistName}</p>
          {song.albumName && (
            <p className="truncate text-xs text-muted-foreground">{song.albumName}</p>
          )}
        </div>
      </div>
    </div>
  )
}
