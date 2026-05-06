import { apiClient } from './client'
import type {
  ApiResponse,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/types'

export const cartApi = {
  getCart: () =>
    apiClient.get<ApiResponse<Cart>>('/cart'),

  addToCart: (data: AddToCartRequest) =>
    apiClient.post<ApiResponse<Cart>>('/cart/items', data),

  updateCartItem: (itemId: string, data: UpdateCartItemRequest) =>
    apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, data),

  removeCartItem: (itemId: string) =>
    apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete<ApiResponse<Cart>>('/cart'),

  applyCoupon: (code: string) =>
    apiClient.post<ApiResponse<Cart>>('/cart/coupon', { code }),
}
