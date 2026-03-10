import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { lyricsPosts } from './lyrics-posts.js'

export const lyricsPostComments = pgTable('lyrics_post_comments', {
  id: serial('id').primaryKey(),
  lyricsPostId: integer('lyrics_post_id').notNull().references(() => lyricsPosts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
