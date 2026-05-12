import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductBySlug, useAddReview } from '@/features/products/hooks/useProducts'
import { useAddToCart } from '@/features/cart/hooks/useCart'
import { useToggleWishlist } from '@/features/wishlist/hooks/useWishlist'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice, getDiscountPercentage, formatDateTime, resolveImageUrl } from '@/lib/utils/helpers'
import {
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productReviewSchema } from '@/features/products/validators/productSchemas'
import { Textarea } from '@/components/ui/Textarea'

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>()
  const [hoverRating, setHoverRating] = useState(0)

  const { data: product, isLoading } = useProductBySlug(slug || '')
  const addToCartMutation = useAddToCart()
  const toggleWishlistMutation = useToggleWishlist()
  const addReviewMutation = useAddReview()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productReviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  const reviewRating = watch('rating')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:text-primary-700">
          Browse products
        </Link>
      </div>
    )
  }

  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : 0

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      variantId: selectedVariant,
    })
  }

  const handleReviewSubmit = (data: { rating: number; comment: string }) => {
    addReviewMutation.mutate(
      { productId: product.id, data },
      {
        onSuccess: () => {
          reset()
          setHoverRating(0)
        },
      },
    )
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
            <img
              src={resolveImageUrl(product.images[selectedImage]?.url || primaryImage?.url)}
              alt={product.images[selectedImage]?.altText || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === index ? 'border-primary-600 dark:border-primary-400 ring-1 ring-primary-600 dark:ring-primary-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img src={resolveImageUrl(image.url)} alt={image.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <Badge variant="info" className="mb-2">
              {product.brand.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <StarRating rating={product.averageRating} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge variant="danger">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedVariant === variant.id
                        ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {Object.entries(variant.attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}{' '}
                    - {formatPrice(variant.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className={`text-sm ${product.stock > 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              onClick={handleAddToCart}
              isLoading={addToCartMutation.isPending}
              disabled={product.stock === 0}
              size="lg"
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleWishlistMutation.mutate(product.id)}
              className="px-4"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Truck className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-center">Free shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-center">Secure payment</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RefreshCw className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-center">Easy returns</span>
            </div>
          </div>

          {product.specifications.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Specifications</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex px-4 py-3 bg-white dark:bg-gray-800">
                    <span className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">{spec.name}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Customer Reviews</h2>

        <form onSubmit={handleSubmit(handleReviewSubmit)} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Write a review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`h-6 w-6 ${
                        star <= (hoverRating || reviewRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 dark:fill-gray-600 text-gray-200 dark:text-gray-600'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.rating.message}</p>
              )}
            </div>
            <Textarea
              label="Comment"
              placeholder="Share your experience..."
              error={errors.comment?.message}
              {...register('comment')}
            />
            <Button type="submit" isLoading={isSubmitting}>
              Submit Review
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          {product.reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            product.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{review.userName}</span>
                      {review.isVerifiedPurchase && (
                        <Badge variant="success" className="ml-2">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(review.createdAt)}</span>
                </div>
                <StarRating rating={review.rating} className="mt-2" />
                <p className="mt-2 text-gray-600 dark:text-gray-300">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
