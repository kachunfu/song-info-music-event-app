import { eq, and } from 'drizzle-orm'
import { db, songs, favorites } from '@app/database'
import type { FavoriteSong, AddFavoriteRequest } from '@app/shared'

export async function getFavorites(userId: number): Promise<FavoriteSong[]> {
  const rows = await db
    .select({
      id: songs.id,
      title: songs.title,
      artistName: songs.artistName,
      albumName: songs.albumName,
      releaseYear: songs.releaseYear,
      artworkUrl: songs.artworkUrl,
      musicbrainzId: songs.musicbrainzId,
      spotifyId: songs.spotifyId,
    })
    .from(favorites)
    .innerJoin(songs, eq(favorites.songId, songs.id))
    .where(eq(favorites.userId, userId))

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artistName: r.artistName,
    albumName: r.albumName ?? undefined,
    releaseYear: r.releaseYear ?? undefined,
    artworkUrl: r.artworkUrl ?? undefined,
    spotifyId: r.spotifyId ?? undefined,
    musicbrainzId: r.musicbrainzId ?? undefined,
  }))
}

export async function addFavorite(userId: number, songData: AddFavoriteRequest): Promise<void> {
  // Upsert the song snapshot
  const [song] = await db
    .insert(songs)
    .values({
      title: songData.title,
      artistName: songData.artistName,
      albumName: songData.albumName,
      releaseYear: songData.releaseYear,
      artworkUrl: songData.artworkUrl,
      musicbrainzId: songData.musicbrainzId,
      spotifyId: songData.spotifyId,
    })
    .onConflictDoNothing()
    .returning({ id: songs.id })

  const songId = song?.id ?? (
    songData.spotifyId
      ? await db.select({ id: songs.id }).from(songs)
          .where(eq(songs.spotifyId, songData.spotifyId))
          .then((r) => r[0]?.id)
      : undefined
  )

  if (!songId) throw new Error('Failed to resolve song')

  await db.insert(favorites).values({ userId, songId }).onConflictDoNothing()
}

export async function removeFavorite(userId: number, songId: number): Promise<void> {
  await db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.songId, songId))
  )
}
