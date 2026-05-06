import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux'
import { closeCart } from '@/store/slices/cartSlice'
import { useRemoveCartItem } from '@/features/cart/hooks/useCart'
import { formatPrice } from '@/lib/utils/helpers'
import { X, ShoppingBag } from 'lucide-react'

export function CartDrawer() {
  const isOpen = useAppSelector((state) => state.cart.isCartOpen)
  const cart = useAppSelector((state) => state.cart.cart)
  const dispatch = useAppDispatch()
  const removeMutation = useRemoveCartItem()

  if (!isOpen || !cart) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => dispatch(closeCart())} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      onClick={() => dispatch(closeCart())}
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {formatPrice(item.subtotal)}
                      </span>
                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        className="text-sm text-danger-600 hover:text-danger-700"
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
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between text-sm mb-4">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-semibold text-gray-900">{formatPrice(cart.total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className="block w-full h-10 bg-primary-600 text-white rounded-lg text-sm font-medium text-center hover:bg-primary-700 transition-colors"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => dispatch(closeCart())}
              className="block w-full h-10 mt-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
