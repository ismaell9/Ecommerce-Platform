import type { AuthTokens } from '@/types'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export const tokenStorage = {
  getTokens: (): AuthTokens | null => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken, expiresAt: '' }
  },

  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY)
  },
}

export const userStorage = {
  getUser: () => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setUser: (user: unknown) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY)
  },
}

export const cartStorage = {
  getCartId: (): string | null => {
    return localStorage.getItem('cart_id')
  },

  setCartId: (cartId: string): void => {
    localStorage.setItem('cart_id', cartId)
  },

  clearCartId: (): void => {
    localStorage.removeItem('cart_id')
  },
}
