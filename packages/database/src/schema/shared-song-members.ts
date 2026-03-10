import { pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { sharedSongs } from './shared-songs.js'

export const sharedSongMembers = pgTable('shared_song_members', {
  sharedSongId: integer('shared_song_id').notNull().references(() => sharedSongs.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.sharedSongId, t.userId] }),
}))
