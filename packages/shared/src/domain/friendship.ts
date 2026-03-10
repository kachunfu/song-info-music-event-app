export interface Friendship {
  id: number
  requesterId: number
  addresseeId: number
  status: 'pending' | 'accepted'
  createdAt: string
}

export interface Friend {
  id: number
  username: string
  friendshipId: number
}
