export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  profileImageUrl?: string
  roles: string[]
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmNewPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phoneNumber?: string
}
