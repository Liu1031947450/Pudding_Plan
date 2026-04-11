/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Paginated API response structure
 */
export interface PaginatedResponse<T> {
  code: number;
  data: T[];
  pagination: Pagination;
  message: string;
}

/**
 * Error response structure
 */
export interface ApiError {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}
