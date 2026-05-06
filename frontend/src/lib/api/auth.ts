import { apiClient } from './client'
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
  AuthTokens,
} from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<User>>('/auth/register', data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/change-password', data),

  verifyEmail: (token: string) =>
    apiClient.get<ApiResponse<null>>(`/auth/verify-email?token=${token}`),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  uploadProfileImage: (formData: FormData) =>
    apiClient.post<ApiResponse<{ url: string }>>('/auth/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
