import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/users.js'
import * as songsSchema from './schema/songs.js'
import * as favoritesSchema from './schema/favorites.js'
import * as friendshipsSchema from './schema/friendships.js'
import * as sharedSongsSchema from './schema/shared-songs.js'
import * as sharedSongMembersSchema from './schema/shared-song-members.js'
import * as lyricsPostsSchema from './schema/lyrics-posts.js'
import * as lyricsPostFavoritesSchema from './schema/lyrics-post-favorites.js'
import * as lyricsPostCommentsSchema from './schema/lyrics-post-comments.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const client = postgres(connectionString)
export const db = drizzle(client, {
  schema: {
    ...schema,
    ...songsSchema,
    ...favoritesSchema,
    ...friendshipsSchema,
    ...sharedSongsSchema,
    ...sharedSongMembersSchema,
    ...lyricsPostsSchema,
    ...lyricsPostFavoritesSchema,
    ...lyricsPostCommentsSchema,
  },
})
