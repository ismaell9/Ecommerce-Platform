import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { formatPrice, formatDateTime } from '@/lib/utils/helpers'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Package } from 'lucide-react'
import type { Order } from '@/types'

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  Pending: 'warning',
  Processing: 'info',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'danger',
  Refunded: 'default',
}

const paymentColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  Pending: 'warning',
  Paid: 'success',
  Failed: 'danger',
  Refunded: 'default',
}

export function OrderHistoryPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () =>
      ordersApi
        .getOrders({ pageNumber: page, pageSize: 10 })
        .then((res) => res.data),
  })

  if (isLoading) {
    return <div className="p-8 text-center">Loading orders...</div>
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">No orders yet</h2>
        <p className="mt-2 text-gray-500">When you place orders, they will appear here.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Order History</h1>

      <div className="space-y-4">
        {data.data.map((order: Order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[order.status] || 'default'}>
                  {order.status}
                </Badge>
                <Badge variant={paymentColors[order.paymentStatus] || 'default'}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{order.items.length - 3} more items
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-sm text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-gray-900">
                Total: {formatPrice(order.total)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
