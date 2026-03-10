import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  SongSearchResponseItem,
  SongDetailResponse,
  FavoriteSong,
  AddFavoriteRequest,
  MusicEvent,
  PaginatedResponse,
  Friend,
  FriendRequestResponse,
  SharedSong,
  LyricsPost,
  LyricsPostComment,
} from '@app/shared'

// ── Auth ──

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<LoginResponse>('/auth/login', data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<LoginResponse>('/auth/register', data),
  })
}

// ── Songs ──

export type SearchFilter = 'all' | 'title' | 'artist' | 'album'

export function useSearchSongs(query: string, page = 1, filter: SearchFilter = 'all') {
  return useQuery({
    queryKey: ['songs', 'search', query, page, filter],
    queryFn: () => api.get<PaginatedResponse<SongSearchResponseItem>>(
      `/songs/search?q=${encodeURIComponent(query)}&page=${page}&filter=${filter}`,
    ),
    enabled: query.length > 0,
    placeholderData: (prev) => prev,
  })
}

export function useSongDetail(id: string) {
  return useQuery({
    queryKey: ['songs', id],
    queryFn: () => api.get<SongDetailResponse>(`/songs/${id}`),
  })
}

export function useTranslateLyrics() {
  return useMutation({
    mutationFn: (data: { lyrics: string; targetLang: string }) =>
      api.post<{ translatedText: string }>('/songs/translate', data),
  })
}

// ── Favorites ──

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoriteSong[]>('/favorites'),
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (song: AddFavoriteRequest) =>
      api.post<{ success: boolean }>('/favorites', song),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (songId: number) =>
      api.delete<{ success: boolean }>(`/favorites/${songId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}

// ── Friends ──

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get<Friend[]>('/friends'),
  })
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: () => api.get<FriendRequestResponse[]>('/friends/requests'),
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (username: string) =>
      api.post<{ success: boolean }>('/friends/request', { username }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  })
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.post<{ success: boolean }>(`/friends/accept/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests'] })
    },
  })
}

export function useRemoveFriend() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<{ success: boolean }>(`/friends/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  })
}

// ── Shared Songs ──

export function useSharedSongs() {
  return useQuery({
    queryKey: ['shared-songs'],
    queryFn: () => api.get<SharedSong[]>('/shared-songs'),
  })
}

export function useSharedSong(id: number) {
  return useQuery({
    queryKey: ['shared-songs', id],
    queryFn: () => api.get<SharedSong>(`/shared-songs/${id}`),
  })
}

export function useCreateSharedSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) =>
      api.post<SharedSong>('/shared-songs', { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-songs'] }),
  })
}

export function useInviteToSharedSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { sharedSongId: number; username: string }) =>
      api.post<{ success: boolean }>(`/shared-songs/${data.sharedSongId}/invite`, { username: data.username }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-songs'] }),
  })
}

export function useDeleteSharedSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<{ success: boolean }>(`/shared-songs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-songs'] }),
  })
}

// ── Lyrics Posts ──

export function useLyricsPosts(sharedSongId: number) {
  return useQuery({
    queryKey: ['lyrics-posts', sharedSongId],
    queryFn: () => api.get<LyricsPost[]>(`/shared-songs/${sharedSongId}/lyrics`),
  })
}

export function useAddLyricsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { sharedSongId: number; content: string }) =>
      api.post<LyricsPost>(`/shared-songs/${data.sharedSongId}/lyrics`, { content: data.content }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['lyrics-posts', variables.sharedSongId] }),
  })
}

export function useDeleteLyricsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { sharedSongId: number; postId: number }) =>
      api.delete<{ success: boolean }>(`/shared-songs/${data.sharedSongId}/lyrics/${data.postId}`),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['lyrics-posts', variables.sharedSongId] }),
  })
}

export function useFavoriteLyricsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { postId: number; sharedSongId: number }) =>
      api.post<{ success: boolean }>(`/lyrics/${data.postId}/favorite`, {}),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['lyrics-posts', variables.sharedSongId] }),
  })
}

export function useUnfavoriteLyricsPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { postId: number; sharedSongId: number }) =>
      api.delete<{ success: boolean }>(`/lyrics/${data.postId}/favorite`),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['lyrics-posts', variables.sharedSongId] }),
  })
}

export function useLyricsComments(postId: number) {
  return useQuery({
    queryKey: ['lyrics-comments', postId],
    queryFn: () => api.get<LyricsPostComment[]>(`/lyrics/${postId}/comments`),
    enabled: postId > 0,
  })
}

export function useAddLyricsComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { postId: number; content: string }) =>
      api.post<LyricsPostComment>(`/lyrics/${data.postId}/comments`, { content: data.content }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['lyrics-comments', variables.postId] }),
  })
}

// ── Events ──

export function useEvents(page = 1) {
  return useQuery({
    queryKey: ['events', page],
    queryFn: () => api.get<PaginatedResponse<MusicEvent>>(`/events?page=${page}`),
    placeholderData: (prev) => prev,
  })
}
