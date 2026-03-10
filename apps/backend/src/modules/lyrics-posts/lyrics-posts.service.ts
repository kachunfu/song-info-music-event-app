import { eq, and, sql } from 'drizzle-orm'
import { db, lyricsPosts, lyricsPostFavorites, lyricsPostComments, users, sharedSongs } from '@app/database'
import type { LyricsPost, LyricsPostComment } from '@app/shared'

export async function addLyricsPost(
  sharedSongId: number,
  authorId: number,
  content: string,
): Promise<LyricsPost> {
  const [post] = await db
    .insert(lyricsPosts)
    .values({ sharedSongId, authorId, content })
    .returning()

  const author = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, authorId))
    .then((r) => r[0])

  return {
    id: post.id,
    sharedSongId: post.sharedSongId,
    authorId: post.authorId,
    authorUsername: author!.username,
    content: post.content,
    favoriteCount: 0,
    isFavorited: false,
    commentCount: 0,
    createdAt: post.createdAt.toISOString(),
  }
}

export async function getLyricsPosts(sharedSongId: number, currentUserId: number): Promise<LyricsPost[]> {
  const rows = await db
    .select({
      id: lyricsPosts.id,
      sharedSongId: lyricsPosts.sharedSongId,
      authorId: lyricsPosts.authorId,
      authorUsername: users.username,
      content: lyricsPosts.content,
      createdAt: lyricsPosts.createdAt,
      favoriteCount: sql<number>`(SELECT COUNT(*) FROM lyrics_post_favorites WHERE lyrics_post_id = ${lyricsPosts.id})`,
      isFavorited: sql<boolean>`EXISTS(SELECT 1 FROM lyrics_post_favorites WHERE lyrics_post_id = ${lyricsPosts.id} AND user_id = ${currentUserId})`,
      commentCount: sql<number>`(SELECT COUNT(*) FROM lyrics_post_comments WHERE lyrics_post_id = ${lyricsPosts.id})`,
    })
    .from(lyricsPosts)
    .innerJoin(users, eq(lyricsPosts.authorId, users.id))
    .where(eq(lyricsPosts.sharedSongId, sharedSongId))
    .orderBy(lyricsPosts.createdAt)

  return rows.map((r) => ({
    id: r.id,
    sharedSongId: r.sharedSongId,
    authorId: r.authorId,
    authorUsername: r.authorUsername,
    content: r.content,
    favoriteCount: Number(r.favoriteCount),
    isFavorited: Boolean(r.isFavorited),
    commentCount: Number(r.commentCount),
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function deleteLyricsPost(
  userId: number,
  sharedSongId: number,
  postId: number,
): Promise<void> {
  // Only the song creator can delete posts
  const song = await db
    .select({ creatorId: sharedSongs.creatorId })
    .from(sharedSongs)
    .where(eq(sharedSongs.id, sharedSongId))
    .then((r) => r[0])

  if (!song) throw new Error('Shared song not found')
  if (song.creatorId !== userId) throw new Error('Only the song creator can delete lyrics')

  await db.delete(lyricsPosts).where(
    and(eq(lyricsPosts.id, postId), eq(lyricsPosts.sharedSongId, sharedSongId)),
  )
}

// ── Favorites ──

export async function favoriteLyricsPost(postId: number, userId: number): Promise<void> {
  await db.insert(lyricsPostFavorites).values({ lyricsPostId: postId, userId }).onConflictDoNothing()
}

export async function unfavoriteLyricsPost(postId: number, userId: number): Promise<void> {
  await db.delete(lyricsPostFavorites).where(
    and(eq(lyricsPostFavorites.lyricsPostId, postId), eq(lyricsPostFavorites.userId, userId)),
  )
}

// ── Comments ──

export async function addComment(
  postId: number,
  authorId: number,
  content: string,
): Promise<LyricsPostComment> {
  const [comment] = await db
    .insert(lyricsPostComments)
    .values({ lyricsPostId: postId, authorId, content })
    .returning()

  const author = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, authorId))
    .then((r) => r[0])

  return {
    id: comment.id,
    lyricsPostId: comment.lyricsPostId,
    authorId: comment.authorId,
    authorUsername: author!.username,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  }
}

export async function getComments(postId: number): Promise<LyricsPostComment[]> {
  const rows = await db
    .select({
      id: lyricsPostComments.id,
      lyricsPostId: lyricsPostComments.lyricsPostId,
      authorId: lyricsPostComments.authorId,
      authorUsername: users.username,
      content: lyricsPostComments.content,
      createdAt: lyricsPostComments.createdAt,
    })
    .from(lyricsPostComments)
    .innerJoin(users, eq(lyricsPostComments.authorId, users.id))
    .where(eq(lyricsPostComments.lyricsPostId, postId))
    .orderBy(lyricsPostComments.createdAt)

  return rows.map((r) => ({
    id: r.id,
    lyricsPostId: r.lyricsPostId,
    authorId: r.authorId,
    authorUsername: r.authorUsername,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }))
}
