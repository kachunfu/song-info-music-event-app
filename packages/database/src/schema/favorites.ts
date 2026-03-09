import { pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { songs } from './songs.js'

export const favorites = pgTable('favorites', {
  userId: integer('user_id').notNull().references(() => users.id),
  songId: integer('song_id').notNull().references(() => songs.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.songId] }),
}))
