import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../../middleware/auth.middleware.js'
import { isMember } from '../shared-songs/shared-songs.service.js'
import {
  addLyricsPost,
  getLyricsPosts,
  deleteLyricsPost,
  favoriteLyricsPost,
  unfavoriteLyricsPost,
  addComment,
  getComments,
} from './lyrics-posts.service.js'

export const lyricsPostsController = new Hono<{ Variables: AuthVariables }>()

lyricsPostsController.use('*', authMiddleware)

const addLyricsSchema = z.object({
  content: z.string().min(1),
})

const addCommentSchema = z.object({
  content: z.string().min(1),
})

// ── Lyrics Posts ──

lyricsPostsController.post('/shared-songs/:id/lyrics', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('id'))
    if (Number.isNaN(sharedSongId)) return c.json({ error: 'Invalid ID' }, 400)

    const member = await isMember(userId, sharedSongId)
    if (!member) return c.json({ error: 'Not a member of this song' }, 403)

    const parsed = addLyricsSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const result = await addLyricsPost(sharedSongId, userId, parsed.data.content)
    return c.json(result, 201)
  } catch (err) {
    console.error('Add lyrics post error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to add lyrics' }, 500)
  }
})

lyricsPostsController.get('/shared-songs/:id/lyrics', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('id'))
    if (Number.isNaN(sharedSongId)) return c.json({ error: 'Invalid ID' }, 400)

    const member = await isMember(userId, sharedSongId)
    if (!member) return c.json({ error: 'Not a member of this song' }, 403)

    const result = await getLyricsPosts(sharedSongId, userId)
    return c.json(result)
  } catch (err) {
    console.error('Get lyrics posts error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get lyrics' }, 500)
  }
})

lyricsPostsController.delete('/shared-songs/:songId/lyrics/:postId', async (c) => {
  try {
    const userId = c.get('userId')
    const sharedSongId = Number(c.req.param('songId'))
    const postId = Number(c.req.param('postId'))
    if (Number.isNaN(sharedSongId) || Number.isNaN(postId)) return c.json({ error: 'Invalid ID' }, 400)

    await deleteLyricsPost(userId, sharedSongId, postId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Delete lyrics post error:', err)
    const message = err instanceof Error ? err.message : 'Failed to delete'
    const status = message.includes('Only the song creator') ? 403 : message === 'Shared song not found' ? 404 : 500
    return c.json({ error: message }, status)
  }
})

// ── Favorites ──

lyricsPostsController.post('/lyrics/:postId/favorite', async (c) => {
  try {
    const userId = c.get('userId')
    const postId = Number(c.req.param('postId'))
    if (Number.isNaN(postId)) return c.json({ error: 'Invalid ID' }, 400)
    await favoriteLyricsPost(postId, userId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Favorite lyrics post error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to favorite' }, 500)
  }
})

lyricsPostsController.delete('/lyrics/:postId/favorite', async (c) => {
  try {
    const userId = c.get('userId')
    const postId = Number(c.req.param('postId'))
    if (Number.isNaN(postId)) return c.json({ error: 'Invalid ID' }, 400)
    await unfavoriteLyricsPost(postId, userId)
    return c.json({ success: true })
  } catch (err) {
    console.error('Unfavorite lyrics post error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to unfavorite' }, 500)
  }
})

// ── Comments ──

lyricsPostsController.post('/lyrics/:postId/comments', async (c) => {
  try {
    const userId = c.get('userId')
    const postId = Number(c.req.param('postId'))
    if (Number.isNaN(postId)) return c.json({ error: 'Invalid ID' }, 400)

    const parsed = addCommentSchema.safeParse(await c.req.json())
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

    const result = await addComment(postId, userId, parsed.data.content)
    return c.json(result, 201)
  } catch (err) {
    console.error('Add comment error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to add comment' }, 500)
  }
})

lyricsPostsController.get('/lyrics/:postId/comments', async (c) => {
  try {
    const postId = Number(c.req.param('postId'))
    if (Number.isNaN(postId)) return c.json({ error: 'Invalid ID' }, 400)
    const result = await getComments(postId)
    return c.json(result)
  } catch (err) {
    console.error('Get comments error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get comments' }, 500)
  }
})
