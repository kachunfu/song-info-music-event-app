import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../../middleware/auth.middleware.js'
import {
  createSharedSong,
  getSharedSongs,
  getSharedSongById,
  inviteToSharedSong,
  deleteSharedSong,
  isMember,
} from './shared-songs.service.js'

export const sharedSongsController = new Hono<{ Variables: AuthVariables }>()

sharedSongsController.use('*', authMiddleware)

const createSchema = z.object({
  title: z.string().min(1).max(100),
})

const inviteSchema = z.object({
  username: z.string().min(3),
})

sharedSongsController.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const parsed = createSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    const result = await createSharedSong(userId, parsed.data.title)
    return c.json(result, 201)
  } catch (err) {
    console.error('Create shared song error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to create shared song' }, 500)
  }
})

sharedSongsController.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const result = await getSharedSongs(userId)
    return c.json(result)
  } catch (err) {
    console.error('Get shared songs error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get shared songs' }, 500)
  }
})

sharedSongsController.get('/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('id'))
    if (Number.isNaN(sharedSongId)) return c.json({ error: 'Invalid ID' }, 400)
    const member = await isMember(userId, sharedSongId)
    if (!member) return c.json({ error: 'Not a member of this song' }, 403)
    const result = await getSharedSongById(sharedSongId)
    if (!result) return c.json({ error: 'Shared song not found' }, 404)
    return c.json(result)
  } catch (err) {
    console.error('Get shared song error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get shared song' }, 500)
  }
})

sharedSongsController.post('/:id/invite', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('id'))
    if (Number.isNaN(sharedSongId)) return c.json({ error: 'Invalid ID' }, 400)
    const parsed = inviteSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    await inviteToSharedSong(userId, sharedSongId, parsed.data.username)
    return c.json({ success: true })
  } catch (err) {
    console.error('Invite to shared song error:', err)
    const message = err instanceof Error ? err.message : 'Failed to invite'
    const status = message === 'Shared song not found' || message === 'User not found' ? 404
      : message.includes('Only the creator') || message.includes('only invite friends') ? 403
      : message.includes('already a member') ? 409
      : 500
    return c.json({ error: message }, status)
  }
})

sharedSongsController.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('id'))
    if (Number.isNaN(sharedSongId)) return c.json({ error: 'Invalid ID' }, 400)
    await deleteSharedSong(userId, sharedSongId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Delete shared song error:', err)
    const message = err instanceof Error ? err.message : 'Failed to delete'
    const status = message === 'Shared song not found' ? 404
      : message.includes('Only the creator') ? 403
      : 500
    return c.json({ error: message }, status)
  }
})
