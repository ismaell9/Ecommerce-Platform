import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WishlistItem } from '@/types'

interface WishlistState {
  items: WishlistItem[]
  totalItems: number
  isLoading: boolean
  error: string | null
}

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,
}

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<{ items: WishlistItem[]; totalItems: number }>) => {
      state.items = action.payload.items
      state.totalItems = action.payload.totalItems
      state.error = null
    },
    addItem: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find((item) => item.productId === action.payload.productId)
      if (!exists) {
        state.items.unshift(action.payload)
        state.totalItems += 1
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload)
      state.totalItems = Math.max(0, state.totalItems - 1)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setWishlist, addItem, removeItem, setLoading, setError } = wishlistSlice.actions
export default wishlistSlice.reducer
