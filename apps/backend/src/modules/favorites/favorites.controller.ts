import { Hono } from 'hono'
import { z } from 'zod'
import type { AddFavoriteRequest } from '@app/shared'
import { authMiddleware, type AuthVariables } from '../../middleware/auth.middleware.js'
import { getFavorites, addFavorite, removeFavorite } from './favorites.service.js'

export const favoritesController = new Hono<{ Variables: AuthVariables }>()

favoritesController.use('*', authMiddleware)

favoritesController.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const result = await getFavorites(userId)
    return c.json(result)
  } catch (err) {
    console.error('Get favorites error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get favorites' }, 500)
  }
})

const addFavoriteSchema = z.object({
  title: z.string(),
  artistName: z.string(),
  spotifyId: z.string().optional(),
  albumName: z.string().optional(),
  releaseYear: z.number().optional(),
  artworkUrl: z.string().optional(),
  musicbrainzId: z.string().optional(),
}) satisfies z.ZodType<AddFavoriteRequest>

favoritesController.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const parsed = addFavoriteSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    await addFavorite(userId, parsed.data)
    return c.json({ success: true }, 201)
  } catch (err) {
    console.error('Add favorite error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to add favorite' }, 500)
  }
})

favoritesController.delete('/:songId', async (c) => {
  try {
    const userId = c.get('userId')
    const songId = Number(c.req.param('songId'))
    if (Number.isNaN(songId)) return c.json({ error: 'Invalid song ID' }, 400)
    await removeFavorite(userId, songId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Remove favorite error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to remove favorite' }, 500)
  }
})
