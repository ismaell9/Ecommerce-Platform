import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Category,
  Brand,
  ProductFilters,
  PaginationParams,
  SortingParams,
  ProductReview,
} from '@/types'

export const productsApi = {
  getProducts: (
    params: ProductFilters & PaginationParams & SortingParams,
  ) =>
    apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params }),

  getProductBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${slug}`),

  getProductById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  getCategories: () =>
    apiClient.get<ApiResponse<Category[]>>('/products/categories'),

  getBrands: () =>
    apiClient.get<ApiResponse<Brand[]>>('/products/brands'),

  getFeaturedProducts: () =>
    apiClient.get<ApiResponse<Product[]>>('/products/featured'),

  getNewArrivals: () =>
    apiClient.get<ApiResponse<Product[]>>('/products/new-arrivals'),

  searchProducts: (query: string) =>
    apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products/search', {
      params: { query },
    }),

  getReviews: (productId: string) =>
    apiClient.get<ApiResponse<ProductReview[]>>(`/products/${productId}/reviews`),

  addReview: (productId: string, data: { rating: number; comment: string }) =>
    apiClient.post<ApiResponse<ProductReview>>(`/products/${productId}/reviews`, data),
}
