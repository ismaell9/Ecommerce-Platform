import { apiClient } from './client'
import type { ApiResponse, Wishlist, WishlistItem } from '@/types'

export const wishlistApi = {
  getWishlist: () =>
    apiClient.get<ApiResponse<Wishlist>>('/wishlist'),

  addToWishlist: (productId: string) =>
    apiClient.post<ApiResponse<WishlistItem>>(`/wishlist/${productId}`),

  removeFromWishlist: (productId: string) =>
    apiClient.delete<ApiResponse<null>>(`/wishlist/${productId}`),

  toggleWishlist: (productId: string) =>
    apiClient.post<ApiResponse<{ isInWishlist: boolean; item?: WishlistItem }>>(
      `/wishlist/toggle/${productId}`,
    ),
}
