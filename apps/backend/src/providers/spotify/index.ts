import type { SongSearchResponseItem } from '@app/shared'

export interface SpotifySearchResult {
  items: SongSearchResponseItem[]
  total: number
}

interface SpotifyTrackResult {
  spotifyId: string
  title: string
  artistName: string
  artworkUrl?: string
  musicalKey?: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Spotify credentials not set')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(`Spotify token failed: ${JSON.stringify(data)}`)
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 - 5000 }
  return cachedToken.value
}

export type SearchFilter = 'all' | 'title' | 'artist' | 'album'

function buildQuery(input: string, filter: SearchFilter): string {
  switch (filter) {
    case 'title': return `track:${input}`
    case 'artist': return `artist:${input}`
    case 'album': return `album:${input}`
    default: return input
  }
}

export async function searchSpotify(
  input: string,
  filter: SearchFilter = 'all',
  offset = 0,
  limit = 25,
): Promise<SpotifySearchResult> {
  const token = await getAccessToken()
  const url = new URL('https://api.spotify.com/v1/search')
  url.searchParams.set('q', buildQuery(input, filter))
  url.searchParams.set('type', 'track')
  url.searchParams.set('limit', String(Math.min(limit, 10)))
  url.searchParams.set('offset', String(offset))

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`Spotify search failed: ${res.status}`, body)
    return { items: [], total: 0 }
  }

  const data = await res.json() as {
    tracks: {
      total: number
      items: Array<{
        id: string
        name: string
        artists: Array<{ name: string }>
        album: {
          name: string
          release_date?: string
          images: Array<{ url: string }>
        }
      }>
    }
  }

  const items: SongSearchResponseItem[] = data.tracks.items.map((t) => ({
    spotifyId: t.id,
    title: t.name,
    artistName: t.artists[0]?.name ?? 'Unknown',
    albumName: t.album.name,
    releaseYear: t.album.release_date ? Number(t.album.release_date.slice(0, 4)) : undefined,
    artworkUrl: t.album.images[0]?.url,
  }))

  return { items, total: data.tracks.total }
}

export async function getSpotifyTrackById(spotifyId: string): Promise<SongSearchResponseItem> {
  const token = await getAccessToken()
  const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify error: ${res.status}`)

  const t = await res.json() as {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: {
      name: string
      release_date?: string
      images: Array<{ url: string }>
    }
  }

  return {
    spotifyId: t.id,
    title: t.name,
    artistName: t.artists[0]?.name ?? 'Unknown',
    albumName: t.album.name,
    releaseYear: t.album.release_date ? Number(t.album.release_date.slice(0, 4)) : undefined,
    artworkUrl: t.album.images[0]?.url,
  }
}

export interface AudioFeatures {
  key: string
  tempo: number
  energy: number
  danceability: number
  valence: number
  acousticness: number
}

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MODE_NAMES = ['minor', 'major']

export async function getAudioFeatures(spotifyId: string): Promise<AudioFeatures | undefined> {
  try {
    const token = await getAccessToken()
    const res = await fetch(`https://api.spotify.com/v1/audio-features/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return undefined

    const data = await res.json() as {
      key: number
      mode: number
      tempo: number
      energy: number
      danceability: number
      valence: number
      acousticness: number
    }

    const keyName = data.key >= 0 ? KEY_NAMES[data.key] : undefined
    const modeName = MODE_NAMES[data.mode]

    return {
      key: keyName ? `${keyName} ${modeName}` : 'Unknown',
      tempo: Math.round(data.tempo),
      energy: data.energy,
      danceability: data.danceability,
      valence: data.valence,
      acousticness: data.acousticness,
    }
  } catch {
    return undefined
  }
}

export async function getSpotifyTrack(title: string, artist: string): Promise<SpotifyTrackResult> {
  const result = await searchSpotify(`track:${title} artist:${artist}`, 'all', 0, 1)
  if (!result.items.length) throw new Error('Spotify track not found')
  const t = result.items[0]
  return {
    spotifyId: t.spotifyId ?? '',
    title: t.title,
    artistName: t.artistName,
    artworkUrl: t.artworkUrl,
  }
}