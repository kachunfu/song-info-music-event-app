import { eq, and, sql } from 'drizzle-orm'
import { db, sharedSongs, sharedSongMembers, users } from '@app/database'
import type { SharedSong, SharedSongMember } from '@app/shared'

async function getMembers(sharedSongId: number): Promise<SharedSongMember[]> {
  const rows = await db
    .select({ id: users.id, username: users.username })
    .from(sharedSongMembers)
    .innerJoin(users, eq(sharedSongMembers.userId, users.id))
    .where(eq(sharedSongMembers.sharedSongId, sharedSongId))

  return rows
}

export async function createSharedSong(creatorId: number, title: string): Promise<SharedSong> {
  const [song] = await db
    .insert(sharedSongs)
    .values({ title, creatorId })
    .returning()

  // Creator is automatically a member
  await db.insert(sharedSongMembers).values({
    sharedSongId: song.id,
    userId: creatorId,
  })

  const creator = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, creatorId))
    .then((r) => r[0])

  return {
    id: song.id,
    title: song.title,
    creatorId: song.creatorId,
    creatorUsername: creator!.username,
    memberCount: 1,
    members: [{ id: creatorId, username: creator!.username }],
    createdAt: song.createdAt.toISOString(),
  }
}

export async function getSharedSongs(userId: number): Promise<SharedSong[]> {
  const rows = await db
    .select({
      id: sharedSongs.id,
      title: sharedSongs.title,
      creatorId: sharedSongs.creatorId,
      creatorUsername: users.username,
      createdAt: sharedSongs.createdAt,
      memberCount: sql<number>`(SELECT COUNT(*) FROM shared_song_members WHERE shared_song_id = ${sharedSongs.id})`,
    })
    .from(sharedSongMembers)
    .innerJoin(sharedSongs, eq(sharedSongMembers.sharedSongId, sharedSongs.id))
    .innerJoin(users, eq(sharedSongs.creatorId, users.id))
    .where(eq(sharedSongMembers.userId, userId))

  const results: SharedSong[] = []
  for (const r of rows) {
    const members = await getMembers(r.id)
    results.push({
      id: r.id,
      title: r.title,
      creatorId: r.creatorId,
      creatorUsername: r.creatorUsername,
      memberCount: Number(r.memberCount),
      members,
      createdAt: r.createdAt.toISOString(),
    })
  }
  return results
}

export async function getSharedSongById(sharedSongId: number): Promise<SharedSong | null> {
  const row = await db
    .select({
      id: sharedSongs.id,
      title: sharedSongs.title,
      creatorId: sharedSongs.creatorId,
      creatorUsername: users.username,
      createdAt: sharedSongs.createdAt,
      memberCount: sql<number>`(SELECT COUNT(*) FROM shared_song_members WHERE shared_song_id = ${sharedSongs.id})`,
    })
    .from(sharedSongs)
    .innerJoin(users, eq(sharedSongs.creatorId, users.id))
    .where(eq(sharedSongs.id, sharedSongId))
    .then((r) => r[0])

  if (!row) return null

  const members = await getMembers(row.id)
  return {
    id: row.id,
    title: row.title,
    creatorId: row.creatorId,
    creatorUsername: row.creatorUsername,
    memberCount: Number(row.memberCount),
    members,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function inviteToSharedSong(
  inviterId: number,
  sharedSongId: number,
  inviteeUsername: string,
): Promise<void> {
  // Verify the inviter is the creator
  const song = await db
    .select()
    .from(sharedSongs)
    .where(eq(sharedSongs.id, sharedSongId))
    .then((r) => r[0])

  if (!song) throw new Error('Shared song not found')
  if (song.creatorId !== inviterId) throw new Error('Only the creator can invite members')

  // Find the invitee
  const invitee = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, inviteeUsername))
    .then((r) => r[0])

  if (!invitee) throw new Error('User not found')

  // Check if already a member
  const existing = await db
    .select()
    .from(sharedSongMembers)
    .where(and(eq(sharedSongMembers.sharedSongId, sharedSongId), eq(sharedSongMembers.userId, invitee.id)))
    .then((r) => r[0])

  if (existing) throw new Error('User is already a member')

  await db.insert(sharedSongMembers).values({
    sharedSongId,
    userId: invitee.id,
  })
}

export async function deleteSharedSong(userId: number, sharedSongId: number): Promise<void> {
  const song = await db
    .select()
    .from(sharedSongs)
    .where(eq(sharedSongs.id, sharedSongId))
    .then((r) => r[0])

  if (!song) throw new Error('Shared song not found')
  if (song.creatorId !== userId) throw new Error('Only the creator can delete this song')

  await db.delete(sharedSongs).where(eq(sharedSongs.id, sharedSongId))
}

export async function isMember(userId: number, sharedSongId: number): Promise<boolean> {
  const row = await db
    .select()
    .from(sharedSongMembers)
    .where(and(eq(sharedSongMembers.sharedSongId, sharedSongId), eq(sharedSongMembers.userId, userId)))
    .then((r) => r[0])

  return !!row
}

export async function isCreator(userId: number, sharedSongId: number): Promise<boolean> {
  const song = await db
    .select({ creatorId: sharedSongs.creatorId })
    .from(sharedSongs)
    .where(eq(sharedSongs.id, sharedSongId))
    .then((r) => r[0])

  return song?.creatorId === userId
}
