import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useCategories, useBrands } from '@/features/products/hooks/useProducts'
import { ProductCard } from '@/features/products/components/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { config } from '@/config/env'
import { Filter, SlidersHorizontal, Search } from 'lucide-react'
import type { ProductFilters, SortingParams } from '@/types'

export function ProductListPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({ search: searchParams.get('search') || undefined })
  const [sorting, setSorting] = useState<SortingParams>({ sortBy: 'createdAt', sortOrder: 'desc' })
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setFilters((prev) => ({ ...prev, search: searchFromUrl }))
      setLocalSearch(searchFromUrl)
    }
  }, [searchParams])

  const { data, isLoading } = useProducts({
    pageNumber: page,
    pageSize: config.defaultPageSize,
    ...filters,
    ...sorting,
  })

  const { data: categories } = useCategories()
  const { data: brands } = useBrands()

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSorting({ sortBy: 'createdAt', sortOrder: 'desc' })
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        <aside
          className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}
        >
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value)
                    handleFilterChange('search', e.target.value || undefined)
                  }}
                  className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h3>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</h3>
              <select
                value={filters.brandId || ''}
                onChange={(e) => handleFilterChange('brandId', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option value="">All Brands</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</h3>
              <div className="space-y-1">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleFilterChange('rating', rating)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {rating}+ stars
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</h3>
              <select
                value={`${sorting.sortBy}-${sorting.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc']
                  setSorting({ sortBy, sortOrder })
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="averageRating-desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No products found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
