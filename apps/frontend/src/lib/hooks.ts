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

// ── Events ──

export function useEvents(page = 1) {
  return useQuery({
    queryKey: ['events', page],
    queryFn: () => api.get<PaginatedResponse<MusicEvent>>(`/events?page=${page}`),
    placeholderData: (prev) => prev,
  })
}
