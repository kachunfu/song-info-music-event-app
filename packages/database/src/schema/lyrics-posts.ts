import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { sharedSongs } from './shared-songs.js'

export const lyricsPosts = pgTable('lyrics_posts', {
  id: serial('id').primaryKey(),
  sharedSongId: integer('shared_song_id').notNull().references(() => sharedSongs.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
