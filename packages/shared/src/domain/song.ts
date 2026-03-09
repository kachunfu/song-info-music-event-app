/**
 * Core domain entity — represents a song in the system.
 * Framework-independent. No API or DB concerns.
 */
export interface Song {
  title: string
  artistName: string
  albumName?: string
  releaseYear?: number
  artworkUrl?: string
  musicbrainzId?: string
  spotifyId?: string
}
