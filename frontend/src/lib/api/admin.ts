import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  User,
} from '@/types'

interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  itemCount: number
}

interface DashboardProduct {
  id: string
  name: string
  price: number
  imageUrl: string
}

export const adminApi = {
  getDashboardStats: () =>
    apiClient.get<ApiResponse<{
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalUsers: number
    revenueChange: number
    ordersChange: number
    recentOrders: RecentOrder[]
    topProducts: DashboardProduct[]
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

  createProduct: (data: {
    name: string
    sku: string
    price: number
    stock: number
    description: string
    isActive: boolean
  }) => apiClient.post<ApiResponse<Product>>('/admin/products', data),

  updateProduct: (id: string, data: {
    name: string
    sku: string
    price: number
    stock: number
    description: string
    isActive: boolean
  }) => apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data),

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
