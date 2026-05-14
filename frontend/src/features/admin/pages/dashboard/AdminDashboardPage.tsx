import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react'

export function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats().then((res) => res.data.data),
  })

  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now())
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    if (data) {
      setLastUpdatedAt(Date.now())
    }
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const updatedLabel = useMemo(() => {
    const seconds = Math.round((Date.now() - lastUpdatedAt) / 1000)
    if (seconds < 60) return 'Updated just now'
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`
    }
    const hours = Math.floor(seconds / 3600)
    return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`
  }, [lastUpdatedAt, tick])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      change: data.revenueChange,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toString(),
      change: data.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Total Products',
      value: data.totalProducts.toString(),
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Total Users',
      value: data.totalUsers.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{updatedLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg hover:border-transparent transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 ${stat.gradient}" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${stat.bgColor} ring-1 ring-inset ring-black/5`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
                      stat.change >= 0
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10'
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              Latest 5
            </span>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.itemCount} items &middot; {formatPrice(order.total)}
                      </p>
                    </div>
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
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Products</h2>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              By rating
            </span>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
                    'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}>
                    {index + 1}
                  </div>
                  <img
                    src={resolveImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
