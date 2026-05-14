import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/lib/hooks/redux'
import { useRemoveCartItem, useUpdateCartItem } from '@/features/cart/hooks/useCart'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { ordersApi } from '@/lib/api'
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

export function CartPage() {
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const cart = useAppSelector((state) => state.cart.cart)
  const removeMutation = useRemoveCartItem()
  const updateMutation = useUpdateCartItem()
  const navigate = useNavigate()

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await ordersApi.validateCoupon(couponCode.trim())
      if (res.data.success) {
        toast.success(`Coupon "${couponCode}" applied!`)
        setCouponApplied(true)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code')
    } finally {
      setValidatingCoupon(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your cart is empty</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Looks like you haven&apos;t added anything yet.</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    )
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
            >
              <img
                src={resolveImageUrl(item.productImage)}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.productSlug}`}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                >
                  {item.productName}
                </Link>

                {item.variantAttributes && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {Object.entries(item.variantAttributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(item.subtotal)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all"
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
          <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>

            <div className="mb-4 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="h-4 w-4" />
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                />
                <Button
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponApplied || validatingCoupon}
                  isLoading={validatingCoupon}
                >
                  Apply
                </Button>
              </div>
              {couponApplied && (
                <p className="mt-1 text-xs text-success-600 dark:text-success-400">Coupon will be applied at checkout</p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-success-600 dark:text-success-400">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-gray-900 dark:text-gray-100">{cart.shipping > 0 ? formatPrice(cart.shipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-lg text-gray-900 dark:text-gray-100">
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
              className="block mt-3 text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
