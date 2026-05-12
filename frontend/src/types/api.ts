export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: PaginatedResponse<T>
  statusCode: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

export interface PaginationParams {
  pageNumber?: number
  pageSize?: number
}

export interface SortingParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
