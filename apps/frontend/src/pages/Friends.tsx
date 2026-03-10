import { useState } from 'react'
import {
  useFriends,
  useFriendRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRemoveFriend,
} from '@/lib/hooks'

export default function FriendsPage() {
  const [username, setUsername] = useState('')
  const friends = useFriends()
  const requests = useFriendRequests()
  const sendRequest = useSendFriendRequest()
  const acceptRequest = useAcceptFriendRequest()
  const removeFriend = useRemoveFriend()
  const [error, setError] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = username.trim()
    if (!trimmed) return
    sendRequest.mutate(trimmed, {
      onSuccess: () => setUsername(''),
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Friends</h1>

      <form onSubmit={handleSend} className="mb-8 flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username to add friend"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={sendRequest.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {sendRequest.isPending ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {sendRequest.isSuccess && <p className="mb-4 text-sm text-green-500">Friend request sent!</p>}

      {requests.data && requests.data.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Pending Requests</h2>
          <div className="space-y-2">
            {requests.data.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{req.requesterUsername}</span>
                <button
                  onClick={() => acceptRequest.mutate(req.id)}
                  disabled={acceptRequest.isPending}
                  className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">My Friends</h2>
        {friends.isLoading && <p className="text-muted-foreground">Loading...</p>}
        {friends.data && friends.data.length === 0 && (
          <p className="text-muted-foreground">No friends yet. Send a request above!</p>
        )}
        {friends.data && friends.data.length > 0 && (
          <div className="space-y-2">
            {friends.data.map((friend) => (
              <div key={friend.friendshipId} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{friend.username}</span>
                <button
                  onClick={() => removeFriend.mutate(friend.friendshipId)}
                  disabled={removeFriend.isPending}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
