export interface SendFriendRequestBody {
  username: string
}

export interface FriendRequestResponse {
  id: number
  requesterUsername: string
  createdAt: string
}
