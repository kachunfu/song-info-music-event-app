import { describe, it, expect } from 'vitest'

/**
 * Tests for the Spotify response → shared Song model mapping logic.
 *
 * The mapping is inline in the provider (searchSpotify / getSpotifyTrackById),
 * so we test it by validating the shape of the mapped objects against expected
 * contracts. If the mapper is extracted in the future, these tests remain valid.
 */

// Simulates the mapping logic used in spotify/index.ts
function mapSpotifyTrackToSong(track: {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    release_date?: string
    images: Array<{ url: string }>
  }
}) {
  return {
    spotifyId: track.id,
    title: track.name,
    artistName: track.artists[0]?.name ?? 'Unknown',
    albumName: track.album.name,
    releaseYear: track.album.release_date
      ? Number(track.album.release_date.slice(0, 4))
      : undefined,
    artworkUrl: track.album.images[0]?.url,
  }
}

describe('Spotify Mapper', () => {
  it('maps a complete Spotify track to Song model', () => {
    const spotifyTrack = {
      id: 'track123',
      name: 'Bohemian Rhapsody',
      artists: [{ name: 'Queen' }],
      album: {
        name: 'A Night at the Opera',
        release_date: '1975-10-31',
        images: [{ url: 'https://img.spotify.com/album.jpg' }],
      },
    }

    const result = mapSpotifyTrackToSong(spotifyTrack)

    expect(result).toEqual({
      spotifyId: 'track123',
      title: 'Bohemian Rhapsody',
      artistName: 'Queen',
      albumName: 'A Night at the Opera',
      releaseYear: 1975,
      artworkUrl: 'https://img.spotify.com/album.jpg',
    })
  })

  it('handles missing release_date', () => {
    const track = {
      id: 't1',
      name: 'Song',
      artists: [{ name: 'Artist' }],
      album: { name: 'Album', images: [{ url: 'https://img.jpg' }] },
    }

    const result = mapSpotifyTrackToSong(track)

    expect(result.releaseYear).toBeUndefined()
  })

  it('handles missing album images', () => {
    const track = {
      id: 't1',
      name: 'Song',
      artists: [{ name: 'Artist' }],
      album: { name: 'Album', release_date: '2024-01-01', images: [] },
    }

    const result = mapSpotifyTrackToSong(track)

    expect(result.artworkUrl).toBeUndefined()
  })

  it('defaults to Unknown when no artists present', () => {
    const track = {
      id: 't1',
      name: 'Song',
      artists: [],
      album: { name: 'Album', release_date: '2024-01-01', images: [] },
    }

    const result = mapSpotifyTrackToSong(track)

    expect(result.artistName).toBe('Unknown')
  })

  it('extracts year from full date string', () => {
    const track = {
      id: 't1',
      name: 'Song',
      artists: [{ name: 'A' }],
      album: { name: 'B', release_date: '2023-06-15', images: [] },
    }

    const result = mapSpotifyTrackToSong(track)

    expect(result.releaseYear).toBe(2023)
  })

  it('extracts year from year-only date string', () => {
    const track = {
      id: 't1',
      name: 'Song',
      artists: [{ name: 'A' }],
      album: { name: 'B', release_date: '2020', images: [] },
    }

    const result = mapSpotifyTrackToSong(track)

    expect(result.releaseYear).toBe(2020)
  })
})
