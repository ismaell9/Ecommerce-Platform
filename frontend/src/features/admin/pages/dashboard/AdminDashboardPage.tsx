import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats().then((res) => res.data.data),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      change: data.revenueChange,
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toString(),
      change: data.ordersChange,
      icon: ShoppingCart,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Total Products',
      value: data.totalProducts.toString(),
      icon: Package,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: 'Total Users',
      value: data.totalUsers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              {stat.change !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.change >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} items - {formatPrice(order.total)}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === 'Delivered'
                      ? 'success'
                      : order.status === 'Cancelled'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <img
                  src={product.images[0]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
