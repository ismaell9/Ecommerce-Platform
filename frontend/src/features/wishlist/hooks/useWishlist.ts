import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux'
import { setWishlist, addItem, removeItem } from '@/store/slices/wishlistSlice'
import toast from 'react-hot-toast'

export function useWishlist() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () =>
      wishlistApi.getWishlist().then((res) => {
        dispatch(setWishlist(res.data.data))
        return res.data.data
      }),
    enabled: isAuthenticated,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return useMutation({
    mutationFn: (productId: string) => {
      if (!isAuthenticated) {
        window.location.href = '/login'
        return Promise.reject(new Error('Not authenticated'))
      }
      return wishlistApi.toggleWishlist(productId)
    },
    onSuccess: (response) => {
      const { isInWishlist, item } = response.data.data
      if (isInWishlist && item) {
        dispatch(addItem(item))
        toast.success('Added to wishlist')
      } else {
        const productId = response.config?.url?.split('/').pop() || ''
        dispatch(removeItem(productId))
        toast.success('Removed from wishlist')
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
    onError: (error) => {
      if (error.message !== 'Not authenticated') {
        toast.error('Failed to update wishlist')
      }
    },
  })
}
