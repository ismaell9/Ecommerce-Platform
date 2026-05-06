import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthTokens } from '@/types'
import { tokenStorage, userStorage } from '@/lib/utils/storage'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: userStorage.getUser(),
  tokens: tokenStorage.getTokens(),
  isAuthenticated: tokenStorage.isAuthenticated(),
  isLoading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      const { user, tokens } = action.payload
      state.user = user
      state.tokens = tokens
      state.isAuthenticated = true
      state.error = null
      tokenStorage.setTokens(tokens)
      userStorage.setUser(user)
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        userStorage.setUser(state.user)
      }
    },
    logout: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = null
      tokenStorage.clearTokens()
      userStorage.clearUser()
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions
export default authSlice.reducer
