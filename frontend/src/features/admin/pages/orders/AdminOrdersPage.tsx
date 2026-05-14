import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminOrdersApi } from '@/lib/api'
import { formatPrice, formatDateTime } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { Search, Eye, Package, RefreshCw, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  Pending: 'warning',
  Processing: 'info',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'danger',
  Refunded: 'default',
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300',
  Processing: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
  Shipped: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  Delivered: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  Cancelled: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300',
  Refunded: 'bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20 text-gray-700 dark:text-gray-300',
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn: () =>
      adminOrdersApi
        .getAllOrders({ pageNumber: page, pageSize: 10, status: statusFilter || undefined, search: search || undefined })
        .then((res) => res.data),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOrdersApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated')
    },
    onError: () => {
      toast.error('Failed to update order status')
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Failed to load orders</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track customer orders</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'], exact: false })}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer or email..."
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 pl-3 pr-8 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            >
              <option value="">All Status</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-4" colSpan={7}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Package className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No orders found</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {statusFilter ? 'Try changing the status filter' : 'Orders will appear here once customers start purchasing'}
                    </p>
                  </td>
                </tr>
              ) : (
                data?.data.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono font-medium text-sm text-gray-900 dark:text-gray-100">#{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.customerName || order.shippingAddress?.fullName || (
                        <span className="text-gray-400 italic">No customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })
                        }
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${statusStyles[order.status] || 'bg-gray-50 border-gray-200 text-gray-700'}`}
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentMethod?.toLowerCase() === 'cod' && order.paymentStatus !== 'Paid' ? 'warning' : statusColors[order.paymentStatus] || 'default'}>
                        {order.paymentMethod?.toLowerCase() === 'cod' && order.paymentStatus !== 'Paid'
                          ? 'Pending (COD)'
                          : order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
          size="lg"
        >
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Order</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.customerName || selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.paymentMethod || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(selectedOrder.total)}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Shipping Address</h3>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-600 dark:text-gray-200">
                  {JSON.stringify(selectedOrder.shippingAddress, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </Modal>

        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
