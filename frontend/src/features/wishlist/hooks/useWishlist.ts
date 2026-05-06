import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/lib/api'
import { useAppDispatch } from '@/lib/hooks/redux'
import { setWishlist, addItem, removeItem } from '@/store/slices/wishlistSlice'
import toast from 'react-hot-toast'

export function useWishlist() {
  const dispatch = useAppDispatch()

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () =>
      wishlistApi.getWishlist().then((res) => {
        dispatch(setWishlist(res.data.data))
        return res.data.data
      }),
    enabled: true,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.toggleWishlist(productId),
    onSuccess: (response) => {
      const { isInWishlist, item } = response.data.data
      if (isInWishlist && item) {
        dispatch(addItem(item))
        toast.success('Added to wishlist')
      } else {
        dispatch(removeItem(response.config?.url?.split('/').pop() || ''))
        toast.success('Removed from wishlist')
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}
