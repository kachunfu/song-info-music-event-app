import type { Song } from '../domain/song.js'

/** GET /api/songs/search response item — same shape as Song */
export type SongSearchResponseItem = Song

/** GET /api/songs/:id response — song entity with enrichment fields */
export interface SongDetailResponse {
  song: Song
  lyrics?: string
  artistBio?: string
  genres?: string[]
  similarArtists?: string[]
  musicalKey?: string
  tempo?: number
  energy?: number
  danceability?: number
  valence?: number
  acousticness?: number
}

/** GET /api/favorites response item — Song with DB id for deletion */
export interface FavoriteSong extends Song {
  id: number
}

/** POST /api/favorites request body */
export type AddFavoriteRequest = Song
