import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { shippingAddressSchema } from '@/features/checkout/validators/checkoutSchemas'
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux'
import { clearCart } from '@/store/slices/cartSlice'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CardDetailsForm } from '@/features/checkout/components/CardDetailsForm'
import { ordersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { ShippingAddress, CreateOrderRequest, CardDetails } from '@/types'
import { CreditCard, Truck, Tag } from 'lucide-react'

export function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const cart = useAppSelector((state) => state.cart.cart)
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [couponValid, setCouponValid] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await ordersApi.validateCoupon(couponCode.trim())
      if (res.data.success) {
        setCouponValid(true)
        toast.success(`Coupon "${couponCode}" applied!`)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
    },
  })

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  const onSubmit = async (data: ShippingAddress) => {
    try {
      // Validate card details if paying with card
      if (selectedPayment === 'card') {
        if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
          toast.error('Please fill in all card details')
          return
        }
      }

      const orderData: CreateOrderRequest = {
        shippingAddress: data,
        paymentMethod: selectedPayment,
        couponCode: couponValid ? couponCode.trim() : undefined,
        cardholderName: cardDetails.cardholderName,
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
      }

      const response = await ordersApi.createOrder(orderData)
      const order = response.data.data

      if (order.paymentStatus === 'Paid') {
        toast.success('Order placed successfully!')
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
        dispatch(clearCart())
      } else {
        toast.error('Payment failed. Please try again.')
        return
      }

      navigate('/profile/orders')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to place order'
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary-600 text-white"
              >
                1
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Shipping Address</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Address Line 1"
                error={errors.addressLine1?.message}
                {...register('addressLine1')}
              />
              <Input
                label="Address Line 2 (optional)"
                {...register('addressLine2')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="State"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  error={errors.postalCode?.message}
                  {...register('postalCode')}
                />
                <Input
                  label="Country"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
              <Input
                label="Phone"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Shipping Method</h2>
            </div>

            <div className="space-y-3">
              {[
                { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 days' },
                { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 days' },
                { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 day' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedShipping === method.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShipping === method.id}
                      onChange={() => setSelectedShipping(method.id)}
                      className="h-4 w-4"
                    />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{method.name}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{method.days}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(method.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Coupon Code</h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value)
                  setCouponValid(false)
                }}
                disabled={couponValid}
                className="flex-1 h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              />
              <Button
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || couponValid}
                isLoading={validatingCoupon}
              >
                Apply
              </Button>
            </div>
            {couponValid && (
              <p className="mt-2 text-sm text-success-600 dark:text-success-400">
                Coupon "{couponCode}" applied!
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {[
                { id: 'card', name: 'Credit / Debit Card' },
                { id: 'paypal', name: 'PayPal' },
                { id: 'wallet', name: 'Wallet' },
                { id: 'cod', name: 'Cash on Delivery' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPayment === method.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedPayment === 'card' && (
            <CardDetailsForm onCardDetailsChange={setCardDetails} />
          )}

          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            size="lg"
            className="w-full"
          >
            Place Order - {formatPrice(cart.total)}
          </Button>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={resolveImageUrl(item.productImage)}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{formatPrice(cart.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-semibold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
