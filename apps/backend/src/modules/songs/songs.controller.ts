import { Hono } from 'hono'
import { searchSongs, getSongDetail, translateLyrics } from './songs.service.js'
import type { SearchFilter } from '../../providers/spotify/index.js'

const VALID_FILTERS = new Set<SearchFilter>(['all', 'title', 'artist', 'album'])

export const songsController = new Hono()

songsController.get('/search', async (c) => {
  try {
    const query = c.req.query('q')
    if (!query) return c.json({ error: 'Missing query parameter q' }, 400)
    const page = Math.max(1, Number(c.req.query('page')) || 1)
    const filterParam = c.req.query('filter') ?? 'all'
    const filter: SearchFilter = VALID_FILTERS.has(filterParam as SearchFilter)
      ? (filterParam as SearchFilter)
      : 'all'
    const results = await searchSongs(query, page, filter)
    return c.json(results)
  } catch (err) {
    console.error('Search error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Search failed' }, 500)
  }
})

songsController.post('/translate', async (c) => {
  try {
    const body = await c.req.json() as { lyrics?: string; targetLang?: string }
    if (!body.lyrics) return c.json({ error: 'Missing lyrics' }, 400)
    if (!body.targetLang) return c.json({ error: 'Missing targetLang' }, 400)
    const result = await translateLyrics(body.lyrics, body.targetLang)
    return c.json(result)
  } catch (err) {
    console.error('Translation error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Translation failed' }, 500)
  }
})

songsController.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const detail = await getSongDetail(id)
    return c.json(detail)
  } catch (err) {
    console.error('Song detail error:', err)
    return c.json({ error: err instanceof Error ? err.message : 'Failed to get song details' }, 500)
  }
})
