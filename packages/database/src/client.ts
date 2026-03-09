import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/users.js'
import * as songsSchema from './schema/songs.js'
import * as favoritesSchema from './schema/favorites.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(connectionString)
export const db = drizzle(client, { schema: { ...schema, ...songsSchema, ...favoritesSchema } })
