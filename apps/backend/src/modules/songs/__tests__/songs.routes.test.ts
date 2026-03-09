import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../songs.service.js', () => ({
  searchSongs: vi.fn(),
  getSongDetail: vi.fn(),
}))

import { songsController } from '../songs.controller.js'
import { searchSongs, getSongDetail } from '../songs.service.js'

const app = new Hono()
app.route('/api/songs', songsController)

describe('Songs Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- GET /api/songs/search ---

  describe('GET /api/songs/search', () => {
    it('returns search results for valid query', async () => {
      const mockResult = {
        items: [{ title: 'Song', artistName: 'Artist', spotifyId: 'x' }],
        total: 1, page: 1, pageSize: 10,
      }
      vi.mocked(searchSongs).mockResolvedValue(mockResult)

      const res = await app.request('/api/songs/search?q=test')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.items).toHaveLength(1)
      expect(searchSongs).toHaveBeenCalledWith('test', 1, 'all')
    })

    it('returns 400 when query param is missing', async () => {
      const res = await app.request('/api/songs/search')

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Missing query parameter q')
      expect(searchSongs).not.toHaveBeenCalled()
    })

    it('passes page and filter params to service', async () => {
      vi.mocked(searchSongs).mockResolvedValue({
        items: [], total: 0, page: 2, pageSize: 10,
      })

      await app.request('/api/songs/search?q=test&page=2&filter=artist')

      expect(searchSongs).toHaveBeenCalledWith('test', 2, 'artist')
    })

    it('defaults invalid filter to all', async () => {
      vi.mocked(searchSongs).mockResolvedValue({
        items: [], total: 0, page: 1, pageSize: 10,
      })

      await app.request('/api/songs/search?q=test&filter=invalid')

      expect(searchSongs).toHaveBeenCalledWith('test', 1, 'all')
    })

    it('clamps page to minimum of 1', async () => {
      vi.mocked(searchSongs).mockResolvedValue({
        items: [], total: 0, page: 1, pageSize: 10,
      })

      await app.request('/api/songs/search?q=test&page=-5')

      expect(searchSongs).toHaveBeenCalledWith('test', 1, 'all')
    })

    it('returns 500 when service throws', async () => {
      vi.mocked(searchSongs).mockRejectedValue(new Error('Service failure'))

      const res = await app.request('/api/songs/search?q=test')

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('Service failure')
    })
  })

  // --- GET /api/songs/:id ---

  describe('GET /api/songs/:id', () => {
    it('returns song detail for valid id', async () => {
      const mockDetail = {
        song: { title: 'Song', artistName: 'Artist', spotifyId: 'abc' },
        lyrics: 'Some lyrics',
      }
      vi.mocked(getSongDetail).mockResolvedValue(mockDetail)

      const res = await app.request('/api/songs/abc')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.song.title).toBe('Song')
      expect(body.lyrics).toBe('Some lyrics')
      expect(getSongDetail).toHaveBeenCalledWith('abc')
    })

    it('returns 500 when service throws', async () => {
      vi.mocked(getSongDetail).mockRejectedValue(new Error('Not found'))

      const res = await app.request('/api/songs/bad-id')

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('Not found')
    })
  })
})
