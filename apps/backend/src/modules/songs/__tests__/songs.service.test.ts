import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../providers/spotify/index.js', () => ({
  searchSpotify: vi.fn(),
  getSpotifyTrackById: vi.fn(),
  getAudioFeatures: vi.fn(),
}))
vi.mock('../../../providers/lrclib/index.js', () => ({
  getLyrics: vi.fn(),
}))
vi.mock('../../../providers/lastfm/index.js', () => ({
  getArtistInfo: vi.fn(),
}))

import { searchSongs, getSongDetail } from '../songs.service.js'
import { searchSpotify, getSpotifyTrackById, getAudioFeatures } from '../../../providers/spotify/index.js'
import { getLyrics } from '../../../providers/lrclib/index.js'
import { getArtistInfo } from '../../../providers/lastfm/index.js'

describe('Songs Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- searchSongs ---

  describe('searchSongs', () => {
    it('returns normalized paginated results', async () => {
      vi.mocked(searchSpotify).mockResolvedValue({
        items: [
          { title: 'Test Song', artistName: 'Artist', spotifyId: 'abc123' },
        ],
        total: 1,
      })

      const result = await searchSongs('test', 1, 'all')

      expect(result.items).toHaveLength(1)
      expect(result.items[0].title).toBe('Test Song')
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('calculates offset from page number', async () => {
      vi.mocked(searchSpotify).mockResolvedValue({ items: [], total: 0 })

      await searchSongs('test', 3, 'all')

      expect(searchSpotify).toHaveBeenCalledWith('test', 'all', 20, 10)
    })

    it('defaults to page 1 and filter all', async () => {
      vi.mocked(searchSpotify).mockResolvedValue({ items: [], total: 0 })

      await searchSongs('test')

      expect(searchSpotify).toHaveBeenCalledWith('test', 'all', 0, 10)
    })

    it('handles empty results', async () => {
      vi.mocked(searchSpotify).mockResolvedValue({ items: [], total: 0 })

      const result = await searchSongs('nonexistent')

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })

    it('propagates Spotify errors', async () => {
      vi.mocked(searchSpotify).mockRejectedValue(new Error('Spotify API failed'))

      await expect(searchSongs('test')).rejects.toThrow('Spotify API failed')
    })

    it('passes filter to Spotify provider', async () => {
      vi.mocked(searchSpotify).mockResolvedValue({ items: [], total: 0 })

      await searchSongs('radiohead', 1, 'artist')

      expect(searchSpotify).toHaveBeenCalledWith('radiohead', 'artist', 0, 10)
    })
  })

  // --- getSongDetail ---

  describe('getSongDetail', () => {
    const mockSong = {
      spotifyId: 'abc123',
      title: 'Test Song',
      artistName: 'Test Artist',
      albumName: 'Test Album',
    }

    it('returns song with lyrics, artist info, and audio features', async () => {
      vi.mocked(getSpotifyTrackById).mockResolvedValue(mockSong)
      vi.mocked(getLyrics).mockResolvedValue('Some lyrics here')
      vi.mocked(getArtistInfo).mockResolvedValue({
        bio: 'Artist bio',
        genres: ['rock'],
        similarArtists: ['Similar Artist'],
      })
      vi.mocked(getAudioFeatures).mockResolvedValue({
        key: 'C major',
        tempo: 120,
        energy: 0.8,
        danceability: 0.7,
        valence: 0.6,
        acousticness: 0.1,
      })

      const result = await getSongDetail('abc123')

      expect(result.song).toEqual(mockSong)
      expect(result.lyrics).toBe('Some lyrics here')
      expect(result.artistBio).toBe('Artist bio')
      expect(result.genres).toEqual(['rock'])
      expect(result.similarArtists).toEqual(['Similar Artist'])
      expect(result.musicalKey).toBe('C major')
      expect(result.tempo).toBe(120)
      expect(result.energy).toBe(0.8)
    })

    it('returns undefined lyrics when LRCLIB fails', async () => {
      vi.mocked(getSpotifyTrackById).mockResolvedValue(mockSong)
      vi.mocked(getLyrics).mockRejectedValue(new Error('LRCLIB down'))
      vi.mocked(getArtistInfo).mockResolvedValue({
        bio: 'Bio', genres: [], similarArtists: [],
      })
      vi.mocked(getAudioFeatures).mockResolvedValue(undefined)

      const result = await getSongDetail('abc123')

      expect(result.song).toEqual(mockSong)
      expect(result.lyrics).toBeUndefined()
      expect(result.artistBio).toBe('Bio')
    })

    it('returns undefined artist info when Last.fm fails', async () => {
      vi.mocked(getSpotifyTrackById).mockResolvedValue(mockSong)
      vi.mocked(getLyrics).mockResolvedValue('Lyrics')
      vi.mocked(getArtistInfo).mockRejectedValue(new Error('Last.fm down'))
      vi.mocked(getAudioFeatures).mockResolvedValue(undefined)

      const result = await getSongDetail('abc123')

      expect(result.lyrics).toBe('Lyrics')
      expect(result.artistBio).toBeUndefined()
      expect(result.genres).toBeUndefined()
      expect(result.similarArtists).toBeUndefined()
    })

    it('handles all enrichment providers failing gracefully', async () => {
      vi.mocked(getSpotifyTrackById).mockResolvedValue(mockSong)
      vi.mocked(getLyrics).mockRejectedValue(new Error('fail'))
      vi.mocked(getArtistInfo).mockRejectedValue(new Error('fail'))
      vi.mocked(getAudioFeatures).mockRejectedValue(new Error('fail'))

      const result = await getSongDetail('abc123')

      expect(result.song).toEqual(mockSong)
      expect(result.lyrics).toBeUndefined()
      expect(result.artistBio).toBeUndefined()
      expect(result.genres).toBeUndefined()
      expect(result.similarArtists).toBeUndefined()
      expect(result.musicalKey).toBeUndefined()
      expect(result.tempo).toBeUndefined()
    })

    it('returns undefined audio features when Spotify audio API fails', async () => {
      vi.mocked(getSpotifyTrackById).mockResolvedValue(mockSong)
      vi.mocked(getLyrics).mockResolvedValue('Lyrics')
      vi.mocked(getArtistInfo).mockResolvedValue({ bio: 'Bio', genres: [], similarArtists: [] })
      vi.mocked(getAudioFeatures).mockResolvedValue(undefined)

      const result = await getSongDetail('abc123')

      expect(result.lyrics).toBe('Lyrics')
      expect(result.musicalKey).toBeUndefined()
      expect(result.tempo).toBeUndefined()
    })

    it('propagates Spotify track fetch errors', async () => {
      vi.mocked(getSpotifyTrackById).mockRejectedValue(new Error('Spotify error: 404'))

      await expect(getSongDetail('bad-id')).rejects.toThrow('Spotify error: 404')
    })
  })
})
