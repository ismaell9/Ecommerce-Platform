import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shippingAddressSchema } from '@/features/checkout/validators/checkoutSchemas'
import { useAppSelector } from '@/lib/hooks/redux'
import { formatPrice } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ordersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { ShippingAddress, CreateOrderRequest } from '@/types'
import { CreditCard, Truck } from 'lucide-react'

export function CheckoutPage() {
  const navigate = useNavigate()
  const cart = useAppSelector((state) => state.cart.cart)
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [selectedPayment, setSelectedPayment] = useState('card')

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
        <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  const onSubmit = async (data: ShippingAddress) => {
    try {
      const orderData: CreateOrderRequest = {
        shippingAddress: data,
        paymentMethod: selectedPayment,
      }

      await ordersApi.createOrder(orderData)
      toast.success('Order placed successfully!')
      navigate('/profile/orders')
    } catch {
      toast.error('Failed to place order')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary-600 text-white"
              >
                1
              </div>
              <h2 className="font-semibold text-gray-900">Shipping Address</h2>
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

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Shipping Method</h2>
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
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <p className="text-sm text-gray-500">{method.days}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(method.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {[
                { id: 'card', name: 'Credit / Debit Card' },
                { id: 'paypal', name: 'PayPal' },
                { id: 'cod', name: 'Cash on Delivery' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPayment === method.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium text-gray-900">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

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
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
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
                <span>{formatPrice(cart.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
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
