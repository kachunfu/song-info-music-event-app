export interface SharedSongMember {
  id: number
  username: string
}

export interface SharedSong {
  id: number
  title: string
  creatorId: number
  creatorUsername: string
  memberCount: number
  members: SharedSongMember[]
  createdAt: string
}

export interface LyricsPost {
  id: number
  sharedSongId: number
  authorId: number
  authorUsername: string
  content: string
  favoriteCount: number
  isFavorited: boolean
  commentCount: number
  createdAt: string
}

export interface LyricsPostComment {
  id: number
  lyricsPostId: number
  authorId: number
  authorUsername: string
  content: string
  createdAt: string
}
