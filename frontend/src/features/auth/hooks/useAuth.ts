import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useAppDispatch } from '@/lib/hooks/redux'
import { setCredentials, logout } from '@/store/slices/authSlice'
import { tokenStorage } from '@/lib/utils/storage'

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
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
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
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
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
