import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const songs = pgTable('songs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  artistName: text('artist_name').notNull(),
  albumName: text('album_name'),
  releaseYear: integer('release_year'),
  artworkUrl: text('artwork_url'),
  musicbrainzId: text('musicbrainz_id'),
  spotifyId: text('spotify_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
