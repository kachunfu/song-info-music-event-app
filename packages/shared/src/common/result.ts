/** Standard API error response */
export interface ApiError {
  error: string | Record<string, unknown>
}

/** Paginated response wrapper for future use */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
