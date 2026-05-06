import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Product,
  Order,
} from '@/types'

export const adminApi = {
  getDashboardStats: () =>
    apiClient.get<ApiResponse<{
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalUsers: number
    revenueChange: number
    ordersChange: number
    recentOrders: Order[]
    topProducts: Product[]
  }>>('/admin/dashboard'),

  getUsers: (params?: {
    pageNumber?: number
    pageSize?: number
    search?: string
    role?: string
  }) =>
    apiClient.get<PaginatedResponse<User>>('/admin/users', { params }),

  updateUserRole: (userId: string, role: string) =>
    apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/role`, { role }),

  toggleUserStatus: (userId: string) =>
    apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/status`),

  getProducts: (params?: {
    pageNumber?: number
    pageSize?: number
    search?: string
    categoryId?: string
  }) =>
    apiClient.get<PaginatedResponse<Product>>('/admin/products', { params }),

  createProduct: (data: FormData) =>
    apiClient.post<ApiResponse<Product>>('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (id: string, data: FormData) =>
    apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProduct: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/products/${id}`),

  toggleProductStatus: (id: string) =>
    apiClient.put<ApiResponse<Product>>(`/admin/products/${id}/status`),

  getSalesAnalytics: (period?: 'day' | 'week' | 'month' | 'year') =>
    apiClient.get<ApiResponse<{
    salesData: { date: string; revenue: number; orders: number }[]
    categoryBreakdown: { category: string; revenue: number }[]
    topProducts: { name: string; revenue: number; units: number }[]
  }>>('/admin/analytics/sales', { params: { period } }),
}
