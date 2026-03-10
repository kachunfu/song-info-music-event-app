import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  requesterId: integer('requester_id').notNull().references(() => users.id),
  addresseeId: integer('addressee_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted'] }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
