import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Cart, CartItem } from '@/types'

interface CartState {
  cart: Cart | null
  isLoading: boolean
  error: string | null
  isCartOpen: boolean
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isCartOpen: false,
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload
      state.error = null
    },
    updateCartItem: (state, action: PayloadAction<CartItem>) => {
      if (state.cart) {
        const index = state.cart.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.cart.items[index] = action.payload
        } else {
          state.cart.items.push(action.payload)
        }
        state.cart.totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
        state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.subtotal, 0)
        state.cart.total =
          state.cart.subtotal - state.cart.discount + state.cart.tax + state.cart.shipping
      }
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      if (state.cart) {
        state.cart.items = state.cart.items.filter((item) => item.id !== action.payload)
        state.cart.totalItems = state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
        state.cart.subtotal = state.cart.items.reduce((sum, item) => sum + item.subtotal, 0)
        state.cart.total =
          state.cart.subtotal - state.cart.discount + state.cart.tax + state.cart.shipping
      }
    },
    clearCart: (state) => {
      state.cart = null
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen
    },
    closeCart: (state) => {
      state.isCartOpen = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  toggleCart,
  closeCart,
  setLoading,
  setError,
} = cartSlice.actions
export default cartSlice.reducer
