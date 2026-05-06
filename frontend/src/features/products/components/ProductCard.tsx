import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { formatPrice, getDiscountPercentage } from '@/lib/utils/helpers'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : 0

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img
            src={product.images[0]?.url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-danger-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">{product.brand.name}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1">
          {product.averageRating > 0 && (
            <>
              <span className="text-sm text-yellow-500">&#9733;</span>
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
