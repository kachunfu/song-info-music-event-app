import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { runMigrations } from '@app/database'
import { authRouter } from './modules/auth/index.js'
import { songsRouter } from './modules/songs/index.js'
import { favoritesRouter } from './modules/favorites/index.js'
import { eventsRouter } from './modules/events/index.js'
import { friendsRouter } from './modules/friends/index.js'
import { sharedSongsRouter } from './modules/shared-songs/index.js'
import { lyricsPostsRouter } from './modules/lyrics-posts/index.js'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.json({ message: 'Music App API' }))

app.route('/api/auth', authRouter)
app.route('/api/songs', songsRouter)
app.route('/api/favorites', favoritesRouter)
app.route('/api/events', eventsRouter)
app.route('/api/friends', friendsRouter)
app.route('/api/shared-songs', sharedSongsRouter)
app.route('/api', lyricsPostsRouter)

async function start() {
  await runMigrations()

  const port = Number(process.env.PORT) || 3000
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
