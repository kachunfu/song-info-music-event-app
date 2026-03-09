interface ArtistInfo {
  bio: string
  genres: string[]
  similarArtists: string[]
}

export async function getArtistInfo(artist: string): Promise<ArtistInfo> {
  const apiKey = process.env.LASTFM_API_KEY
  if (!apiKey) throw new Error('Last.fm API key not set')

  const url = new URL('https://ws.audioscrobbler.com/2.0/')
  url.searchParams.set('method', 'artist.getinfo')
  url.searchParams.set('artist', artist)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`)

  const data = await res.json() as {
    artist: {
      bio: { summary: string }
      tags: { tag: Array<{ name: string }> }
      similar: { artist: Array<{ name: string }> }
    }
  }

  const rawBio = data.artist.bio.summary
  const bio = rawBio
    .replace(/<a\b[^>]*>.*?<\/a>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()

  return {
    bio,
    genres: data.artist.tags.tag.map((t) => t.name),
    similarArtists: data.artist.similar.artist.map((a) => a.name),
  }
}
