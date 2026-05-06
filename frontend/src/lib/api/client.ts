import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { config } from '@/config/env'
import { tokenStorage } from '@/lib/utils/storage'
import type { ApiError } from '@/types'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: ApiError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  client.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config

      if (!originalRequest) {
        return Promise.reject(error)
      }

      if (error.response?.status === 401 && !(originalRequest as { _retry?: boolean })._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return client(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        ;(originalRequest as unknown as { _retry: boolean })._retry = true
        isRefreshing = true

        const refreshToken = tokenStorage.getRefreshToken()

        if (!refreshToken) {
          tokenStorage.clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          tokenStorage.setTokens({
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt: '',
          })

          processQueue(null, accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return client(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as ApiError, null)
          tokenStorage.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      const apiError: ApiError = {
        message: error.response?.data?.message || 'An unexpected error occurred',
        errors: error.response?.data?.errors,
        statusCode: error.response?.status || 500,
      }

      return Promise.reject(apiError)
    },
  )

  return client
}

export const apiClient = createApiClient()
