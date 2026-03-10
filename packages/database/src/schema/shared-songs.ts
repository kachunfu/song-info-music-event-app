import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const sharedSongs = pgTable('shared_songs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
