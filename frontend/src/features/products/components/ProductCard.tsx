import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { formatPrice, getDiscountPercentage, resolveImageUrl, highlightText } from '@/lib/utils/helpers'
import { useAddToCart } from '@/features/cart/hooks/useCart'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  searchQuery?: string
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>
  const parts = highlightText(text, query)
  return (
    <>
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm px-0.5">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

export function ProductCard({ product, searchQuery }: ProductCardProps) {
  const addToCart = useAddToCart()
  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart.mutate({ productId: product.id, quantity: 1 })
  }

  return (
    <div className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary-500/5 hover:-translate-y-1">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
          <img
            src={resolveImageUrl(product.images[0]?.url)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-danger-600 to-danger-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/40 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <HighlightedText text={product.name} query={searchQuery} />
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.brand.name}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.averageRating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-sm text-yellow-500">&#9733;</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50 active:scale-[0.97]"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-600 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:bg-primary-50 dark:hover:bg-primary-500/10">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
