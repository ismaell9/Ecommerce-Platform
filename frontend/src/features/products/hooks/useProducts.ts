import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import type { ProductFilters, PaginationParams, SortingParams } from '@/types'

export function useProducts(
  params: ProductFilters & PaginationParams & SortingParams = {},
) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params).then((res) => res.data.data),
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug).then((res) => res.data.data),
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories().then((res) => res.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => productsApi.getBrands().then((res) => res.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeaturedProducts().then((res) => res.data.data),
  })
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productsApi.getNewArrivals().then((res) => res.data.data),
  })
}

export function useAddReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { rating: number; comment: string } }) =>
      productsApi.addReview(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    },
  })
}
