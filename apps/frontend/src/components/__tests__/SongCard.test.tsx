import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SongCard } from '../SongCard'
import type { Song } from '@app/shared'

describe('SongCard', () => {
  const baseSong: Song = {
    title: 'Bohemian Rhapsody',
    artistName: 'Queen',
    albumName: 'A Night at the Opera',
    artworkUrl: 'https://img.example.com/album.jpg',
    spotifyId: 'abc123',
  }

  it('renders song title and artist', () => {
    render(<SongCard song={baseSong} />)

    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument()
    expect(screen.getByText('Queen')).toBeInTheDocument()
  })

  it('renders album name when present', () => {
    render(<SongCard song={baseSong} />)

    expect(screen.getByText('A Night at the Opera')).toBeInTheDocument()
  })

  it('does not render album name when absent', () => {
    const songWithoutAlbum: Song = { title: 'Song', artistName: 'Artist' }
    render(<SongCard song={songWithoutAlbum} />)

    expect(screen.queryByText('A Night at the Opera')).not.toBeInTheDocument()
  })

  it('renders artwork image when artworkUrl is provided', () => {
    render(<SongCard song={baseSong} />)

    const img = screen.getByRole('img', { name: 'Bohemian Rhapsody' })
    expect(img).toHaveAttribute('src', 'https://img.example.com/album.jpg')
  })

  it('renders placeholder when no artworkUrl', () => {
    const songNoArt: Song = { title: 'Song', artistName: 'Artist' }
    render(<SongCard song={songNoArt} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('♪')).toBeInTheDocument()
  })
})
