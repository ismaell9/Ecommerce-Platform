export interface WishlistItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string
  price: number
  originalPrice?: number
  isInStock: boolean
  addedAt: string
}

export interface Wishlist {
  items: WishlistItem[]
  totalItems: number
}
