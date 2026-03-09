import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

vi.mock('../songs.service.js', () => ({
  searchSongs: vi.fn(),
  getSongDetail: vi.fn(),
  translateLyrics: vi.fn(),
}))

import { songsController } from '../songs.controller.js'
import { translateLyrics } from '../songs.service.js'

const app = new Hono()
app.route('/api/songs', songsController)

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/songs/translate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns translated lyrics', async () => {
    vi.mocked(translateLyrics).mockResolvedValue({ translatedText: '你好世界' })

    const res = await app.request(jsonRequest('/api/songs/translate', {
      lyrics: 'Hello world',
      targetLang: 'zh-TW',
    }))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.translatedText).toBe('你好世界')
    expect(translateLyrics).toHaveBeenCalledWith('Hello world', 'zh-TW')
  })

  it('returns 400 when lyrics is missing', async () => {
    const res = await app.request(jsonRequest('/api/songs/translate', {
      targetLang: 'zh-TW',
    }))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Missing lyrics')
    expect(translateLyrics).not.toHaveBeenCalled()
  })

  it('returns 400 when targetLang is missing', async () => {
    const res = await app.request(jsonRequest('/api/songs/translate', {
      lyrics: 'Hello',
    }))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Missing targetLang')
    expect(translateLyrics).not.toHaveBeenCalled()
  })

  it('returns 400 when body is empty', async () => {
    const res = await app.request(jsonRequest('/api/songs/translate', {}))

    expect(res.status).toBe(400)
    expect(translateLyrics).not.toHaveBeenCalled()
  })

  it('returns 500 when translation service fails', async () => {
    vi.mocked(translateLyrics).mockRejectedValue(new Error('Service down'))

    const res = await app.request(jsonRequest('/api/songs/translate', {
      lyrics: 'Hello',
      targetLang: 'zh-TW',
    }))

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Service down')
  })
})
