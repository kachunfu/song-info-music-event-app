import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'

vi.mock('../favorites.service.js', () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}))

import { favoritesController } from '../favorites.controller.js'
import { getFavorites, addFavorite, removeFavorite } from '../favorites.service.js'

const app = new Hono()
app.route('/api/favorites', favoritesController)

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret'

async function authHeader() {
  const token = await sign({ sub: '1', email: 'test@example.com' }, JWT_SECRET, 'HS256')
  return { Authorization: `Bearer ${token}` }
}

function jsonRequest(path: string, method: string, body?: unknown, headers?: Record<string, string>) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

describe('Favorites Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Auth required ---

  describe('Authentication', () => {
    it('returns 401 without auth token', async () => {
      const res = await app.request('/api/favorites')
      expect(res.status).toBe(401)
    })

    it('returns 401 with invalid token', async () => {
      const res = await app.request(jsonRequest('/api/favorites', 'GET', undefined, {
        Authorization: 'Bearer invalid-token',
      }))
      expect(res.status).toBe(401)
    })
  })

  // --- GET /api/favorites ---

  describe('GET /api/favorites', () => {
    it('returns user favorites', async () => {
      const mockFavorites = [
        { id: 1, title: 'Song', artistName: 'Artist', spotifyId: 'abc' },
      ]
      vi.mocked(getFavorites).mockResolvedValue(mockFavorites)

      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'GET', undefined, headers))

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].title).toBe('Song')
      expect(getFavorites).toHaveBeenCalledWith(1)
    })

    it('returns empty array when no favorites', async () => {
      vi.mocked(getFavorites).mockResolvedValue([])

      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'GET', undefined, headers))

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual([])
    })
  })

  // --- POST /api/favorites ---

  describe('POST /api/favorites', () => {
    it('adds a favorite successfully', async () => {
      vi.mocked(addFavorite).mockResolvedValue(undefined)

      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'POST', {
        title: 'Song',
        artistName: 'Artist',
        spotifyId: 'abc123',
      }, headers))

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(addFavorite).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Song',
        artistName: 'Artist',
        spotifyId: 'abc123',
      }))
    })

    it('works without musicbrainzId (optional field)', async () => {
      vi.mocked(addFavorite).mockResolvedValue(undefined)

      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'POST', {
        title: 'Song',
        artistName: 'Artist',
      }, headers))

      expect(res.status).toBe(201)
    })

    it('returns 400 for missing required fields', async () => {
      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'POST', {
        title: 'Song',
        // missing artistName
      }, headers))

      expect(res.status).toBe(400)
      expect(addFavorite).not.toHaveBeenCalled()
    })

    it('returns 400 for empty body', async () => {
      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites', 'POST', {}, headers))

      expect(res.status).toBe(400)
      expect(addFavorite).not.toHaveBeenCalled()
    })
  })

  // --- DELETE /api/favorites/:songId ---

  describe('DELETE /api/favorites/:songId', () => {
    it('removes a favorite successfully', async () => {
      vi.mocked(removeFavorite).mockResolvedValue(undefined)

      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites/42', 'DELETE', undefined, headers))

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(removeFavorite).toHaveBeenCalledWith(1, 42)
    })

    it('returns 400 for non-numeric songId', async () => {
      const headers = await authHeader()
      const res = await app.request(jsonRequest('/api/favorites/abc', 'DELETE', undefined, headers))

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Invalid song ID')
      expect(removeFavorite).not.toHaveBeenCalled()
    })
  })
})
