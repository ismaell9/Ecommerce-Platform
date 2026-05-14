export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  variantAttributes?: Record<string, string>
  quantity: number
  price: number
  subtotal: number
}

export interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  paymentTransactionId?: string
  shippingAddress: ShippingAddress
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const OrderStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const PaymentStatus = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Refunded: 'Refunded',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress
  paymentMethod: string
  couponCode?: string
  notes?: string
  cardholderName?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

export interface CardDetails {
  cardholderName: string
  cardNumber: string
  expiryDate: string
  cvv: string
}
