export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: Record<string, unknown>
}

export interface SessionUser {
  id: string
  sessionToken: string
  displayName: string
  isAnonymous: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
