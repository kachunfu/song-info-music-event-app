import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../../middleware/auth.middleware.js'
import {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  getFriends,
  removeFriend,
} from './friends.service.js'

export const friendsController = new Hono<{ Variables: AuthVariables }>()

friendsController.use('*', authMiddleware)

const sendRequestSchema = z.object({
  username: z.string().min(3),
})

friendsController.post('/request', async (c) => {
  try {
    const userId = c.get('userId')
    const parsed = sendRequestSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
    await sendFriendRequest(userId, parsed.data.username)
    return c.json({ success: true }, 201)
  } catch (err) {
    console.error('Send friend request error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send friend request'
    const status = message === 'User not found' ? 404 : message.includes('already exists') ? 409 : 500
    return c.json({ error: message }, status)
  }
})

friendsController.get('/requests', async (c) => {
  try {
    const userId = c.get('userId')
    const result = await getPendingRequests(userId)
    return c.json(result)
  } catch (err) {
    console.error('Get friend requests error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get requests' }, 500)
  }
})

friendsController.post('/accept/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const friendshipId = Number(c.req.param('id'))
    if (Number.isNaN(friendshipId)) return c.json({ error: 'Invalid ID' }, 400)
    await acceptFriendRequest(userId, friendshipId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Accept friend request error:', err)
    const message = err instanceof Error ? err.message : 'Failed to accept request'
    const status = message === 'Friend request not found' ? 404 : 500
    return c.json({ error: message }, status)
  }
})

friendsController.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const result = await getFriends(userId)
    return c.json(result)
  } catch (err) {
    console.error('Get friends error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get friends' }, 500)
  }
})

friendsController.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId')
    const friendshipId = Number(c.req.param('id'))
    if (Number.isNaN(friendshipId)) return c.json({ error: 'Invalid ID' }, 400)
    await removeFriend(userId, friendshipId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Remove friend error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to remove friend' }, 500)
  }
})
