import { eq, and, or, sql } from 'drizzle-orm'
import { db, friendships, users } from '@app/database'
import type { Friend, FriendRequestResponse } from '@app/shared'

export async function sendFriendRequest(requesterId: number, addresseeUsername: string): Promise<void> {
  const addressee = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, addresseeUsername))
    .then((r) => r[0])

  if (!addressee) throw new Error('User not found')
  if (addressee.id === requesterId) throw new Error('Cannot send friend request to yourself')

  const existing = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addressee.id)),
        and(eq(friendships.requesterId, addressee.id), eq(friendships.addresseeId, requesterId)),
      ),
    )
    .then((r) => r[0])

  if (existing) throw new Error('Friend request already exists')

  await db.insert(friendships).values({
    requesterId,
    addresseeId: addressee.id,
  })
}

export async function getPendingRequests(userId: number): Promise<FriendRequestResponse[]> {
  const rows = await db
    .select({
      id: friendships.id,
      requesterUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.requesterId, users.id))
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))

  return rows.map((r) => ({
    id: r.id,
    requesterUsername: r.requesterUsername,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function acceptFriendRequest(userId: number, friendshipId: number): Promise<void> {
  const friendship = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.id, friendshipId), eq(friendships.addresseeId, userId)))
    .then((r) => r[0])

  if (!friendship) throw new Error('Friend request not found')
  if (friendship.status === 'accepted') throw new Error('Already accepted')

  await db
    .update(friendships)
    .set({ status: 'accepted' })
    .where(eq(friendships.id, friendshipId))
}

export async function getFriends(userId: number): Promise<Friend[]> {
  const rows = await db
    .select({
      friendshipId: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      friendId: sql<number>`CASE WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId} ELSE ${friendships.requesterId} END`,
      friendUsername: sql<string>`CASE WHEN ${friendships.requesterId} = ${userId} THEN addressee.username ELSE requester.username END`,
    })
    .from(friendships)
    .innerJoin(sql`${users} AS requester`, sql`requester.id = ${friendships.requesterId}`)
    .innerJoin(sql`${users} AS addressee`, sql`addressee.id = ${friendships.addresseeId}`)
    .where(
      and(
        eq(friendships.status, 'accepted'),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      ),
    )

  return rows.map((r) => ({
    id: r.friendId,
    username: r.friendUsername,
    friendshipId: r.friendshipId,
  }))
}

export async function removeFriend(userId: number, friendshipId: number): Promise<void> {
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      ),
    )
}
