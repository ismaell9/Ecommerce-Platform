import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { formatPrice, formatDateTime, resolveImageUrl } from '@/lib/utils/helpers'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Package, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
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

const cancellableStatuses = ['Pending', 'Processing']

export function OrderHistoryPage() {
  const [page, setPage] = useState(1)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () =>
      ordersApi
        .getOrders({ pageNumber: page, pageSize: 10 })
        .then((res) => res.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel order')
    },
  })

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancellingId(orderId)
      cancelMutation.mutate(orderId, { onSettled: () => setCancellingId(null) })
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto" />
        </div>
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No orders yet</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">When you place orders, they will appear here.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Order History</h1>

      <div className="space-y-4">
        {data.data.map((order: Order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(order.createdAt)}</p>
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
                    src={resolveImageUrl(item.productImage)}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                  +{order.items.length - 3} more items
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
                {cancellableStatuses.includes(order.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(order.id)}
                    isLoading={cancellingId === order.id}
                    className="text-danger-600 dark:text-danger-400 border-danger-300 dark:border-danger-700 hover:bg-danger-50 dark:hover:bg-danger-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
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
