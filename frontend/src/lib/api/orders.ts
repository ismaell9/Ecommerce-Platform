import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  CreateOrderRequest,
  ShippingMethod,
  Coupon,
} from '@/types'

export const ordersApi = {
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<Order>>('/orders', data),

  getOrders: (params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),

  getOrder: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  cancelOrder: (id: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`),

  getShippingMethods: () =>
    apiClient.get<ApiResponse<ShippingMethod[]>>('/shipping/methods'),

  validateCoupon: (code: string) =>
    apiClient.get<ApiResponse<Coupon>>(`/coupons/validate/${code}`),
}

export const adminOrdersApi = {
  getAllOrders: (params?: {
    pageNumber?: number
    pageSize?: number
    status?: string
  }) =>
    apiClient.get<PaginatedResponse<Order>>('/admin/orders', { params }),

  updateOrderStatus: (id: string, status: string) =>
    apiClient.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }),

  getOrderStats: () =>
    apiClient.get<ApiResponse<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<string, number>
  }>>('/admin/orders/stats'),
}
