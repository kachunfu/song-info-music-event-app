import { pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { lyricsPosts } from './lyrics-posts.js'

export const lyricsPostFavorites = pgTable('lyrics_post_favorites', {
  lyricsPostId: integer('lyrics_post_id').notNull().references(() => lyricsPosts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.lyricsPostId, t.userId] }),
}))
