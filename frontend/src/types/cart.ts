export interface CartItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string
  variantId?: string
  variantAttributes?: Record<string, string>
  quantity: number
  price: number
  originalPrice?: number
  subtotal: number
}

export interface Cart {
  id: string
  items: CartItem[]
  totalItems: number
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
  variantId?: string
}

export interface UpdateCartItemRequest {
  itemId: string
  quantity: number
}
