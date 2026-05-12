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
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your wishlist is empty</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Save items you love for later.</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button>Explore Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden group transition-all hover:shadow-lg"
          >
            <Link to={`/products/${item.productSlug}`}>
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={resolveImageUrl(item.productImage)}
                  alt={item.productName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link
                to={`/products/${item.productSlug}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors"
              >
                {item.productName}
              </Link>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.price)}</span>
                {item.originalPrice && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
              </div>

              <p className={`mt-1 text-xs ${item.isInStock ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
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
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:border-danger-400 dark:hover:border-danger-500 transition-all"
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
