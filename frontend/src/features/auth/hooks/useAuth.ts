import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useAppDispatch } from '@/lib/hooks/redux'
import { setCredentials, logout } from '@/store/slices/authSlice'
import { tokenStorage } from '@/lib/utils/storage'
import toast from 'react-hot-toast'

export function useLogin() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      const tokens = response.data.data
      tokenStorage.setTokens(tokens)
      const userResponse = await authApi.getCurrentUser()
      const user = userResponse.data.data
      dispatch(setCredentials({ user, tokens }))
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      toast.success('Welcome back!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Invalid email or password')
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created successfully! Please check your email to verify.')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed')
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      await queryClient.cancelQueries()
      queryClient.clear()
    },
    onSuccess: () => {
      dispatch(logout())
    },
    onError: () => {
      dispatch(logout())
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset instructions sent to your email')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send reset email')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully! You can now log in.')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reset password')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to change password')
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser().then((res) => res.data.data),
    staleTime: 1000 * 60 * 5,
  })
}
