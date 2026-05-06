import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/lib/hooks/redux'
import { useRemoveCartItem, useUpdateCartItem } from '@/features/cart/hooks/useCart'
import { formatPrice } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export function CartPage() {
  const cart = useAppSelector((state) => state.cart.cart)
  const removeMutation = useRemoveCartItem()
  const updateMutation = useUpdateCartItem()
  const navigate = useNavigate()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Looks like you have not added anything yet.</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    )
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateMutation.mutate({
      itemId,
      data: { itemId, quantity },
    })
  }

  const handleRemove = (itemId: string) => {
    removeMutation.mutate(itemId)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200"
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded-lg"
              />

              <div className="flex-1">
                <Link
                  to={`/products/${item.productSlug}`}
                  className="font-medium text-gray-900 hover:text-primary-600"
                >
                  {item.productName}
                </Link>

                {item.variantAttributes && (
                  <p className="mt-1 text-sm text-gray-500">
                    {Object.entries(item.variantAttributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.subtotal)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-gray-400 hover:text-danger-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{cart.shipping > 0 ? formatPrice(cart.shipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/products"
              className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
