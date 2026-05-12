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

  const { data: product, isLoading } = useProductBySlug(slug || '')
  const addToCartMutation = useAddToCart()
  const toggleWishlistMutation = useToggleWishlist()
  const addReviewMutation = useAddReview()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productReviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full" />
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-primary-600">
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
        onSuccess: () => reset(),
      },
    )
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={resolveImageUrl(product.images[selectedImage]?.url || primaryImage?.url)}
              alt={product.images[selectedImage]?.altText || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img src={resolveImageUrl(image.url)} alt={image.altText || ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          {product.brand && (
            <Badge variant="info" className="mb-2">
              {product.brand.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <StarRating rating={product.averageRating} />
              <span className="text-sm text-gray-500">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge variant="danger">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-gray-600">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
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
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
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
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck className="h-5 w-5 text-gray-400" />
              <span>Free shipping</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-gray-400" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RefreshCw className="h-5 w-5 text-gray-400" />
              <span>Easy returns</span>
            </div>
          </div>

          {product.specifications.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex px-4 py-3">
                    <span className="w-1/3 text-sm font-medium text-gray-500">{spec.name}</span>
                    <span className="text-sm text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>

        <form onSubmit={handleSubmit(handleReviewSubmit)} className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-4">Write a review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <StarRating
                rating={0}
                size="lg"
                interactive
                onChange={() => {}}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-danger-600">{errors.rating.message}</p>
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
          {product.reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{review.userName}</span>
                  {review.isVerifiedPurchase && (
                    <Badge variant="success" className="ml-2">
                      Verified
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDateTime(review.createdAt)}</span>
              </div>
              <StarRating rating={review.rating} className="mt-2" />
              <p className="mt-2 text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
