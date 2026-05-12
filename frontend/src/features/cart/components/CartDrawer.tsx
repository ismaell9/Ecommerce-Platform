import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux'
import { closeCart } from '@/store/slices/cartSlice'
import { useRemoveCartItem } from '@/features/cart/hooks/useCart'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { X, ShoppingBag } from 'lucide-react'

export function CartDrawer() {
  const isOpen = useAppSelector((state) => state.cart.isCartOpen)
  const cart = useAppSelector((state) => state.cart.cart)
  const dispatch = useAppDispatch()
  const removeMutation = useRemoveCartItem()

  if (!isOpen || !cart) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeCart())} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <img
                    src={resolveImageUrl(item.productImage)}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                      onClick={() => dispatch(closeCart())}
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.subtotal)}
                      </span>
                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        className="text-xs text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(cart.total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className="flex items-center justify-center w-full h-10 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all active:scale-[0.98]"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => dispatch(closeCart())}
              className="flex items-center justify-center w-full h-10 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
