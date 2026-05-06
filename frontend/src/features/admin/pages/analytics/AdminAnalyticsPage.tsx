import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils/helpers'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminApi.getSalesAnalytics(period).then((res) => res.data.data),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const totalRevenue = data.salesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.salesData.reduce((sum, d) => sum + d.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="h-9 rounded-lg border border-gray-300 px-3 text-sm"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatPrice(avgOrderValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          <div className="space-y-4">
            {data.categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{cat.category}</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(cat.revenue)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{
                      width: `${(cat.revenue / totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.units} units sold</p>
                </div>
                <span className="font-medium text-gray-900">
                  {formatPrice(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.salesData.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
          <div className="flex items-end gap-1 h-40">
            {data.salesData.map((day, index) => {
              const maxRevenue = Math.max(...data.salesData.map((d) => d.revenue))
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex-1 bg-primary-100 hover:bg-primary-200 rounded-t transition-colors relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatPrice(day.revenue)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{data.salesData[0]?.date}</span>
            <span>{data.salesData[data.salesData.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}
