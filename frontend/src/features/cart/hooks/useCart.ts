import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/lib/api'
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux'
import { setCart } from '@/store/slices/cartSlice'
import type { AddToCartRequest, UpdateCartItemRequest } from '@/types'
import toast from 'react-hot-toast'

export function useCart() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return useQuery({
    queryKey: ['cart'],
    queryFn: () =>
      cartApi.getCart().then((res) => {
        dispatch(setCart(res.data.data))
        return res.data.data
      }),
    enabled: isAuthenticated,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart')
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemRequest }) =>
      cartApi.updateCartItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed from cart')
    },
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
