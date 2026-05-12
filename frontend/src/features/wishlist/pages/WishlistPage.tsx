import { Link } from 'react-router-dom'
import { useWishlist, useToggleWishlist } from '@/features/wishlist/hooks/useWishlist'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

export function WishlistPage() {
  const { data } = useWishlist()
  const toggleMutation = useToggleWishlist()

  if (!data || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
        <p className="mt-2 text-gray-500">Save items you love for later.</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button>Explore Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            <Link to={`/products/${item.productSlug}`}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={resolveImageUrl(item.productImage)}
                  alt={item.productName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link
                to={`/products/${item.productSlug}`}
                className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
              >
                {item.productName}
              </Link>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>

              <p
                className={`mt-1 text-xs ${
                  item.isInStock ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {item.isInStock ? 'In Stock' : 'Out of Stock'}
              </p>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!item.isInStock}
                >
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Add to Cart
                </Button>
                <button
                  onClick={() => toggleMutation.mutate(item.productId)}
                  className="p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-danger-600 hover:border-danger-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
