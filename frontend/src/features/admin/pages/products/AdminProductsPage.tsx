import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice, resolveImageUrl } from '@/lib/utils/helpers'
import { Plus, Search, Edit, Trash2, Eye, Package, RefreshCw } from 'lucide-react'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    isActive: true,
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () =>
      adminApi
        .getProducts({ pageNumber: page, pageSize: 10, search })
        .then((res) => res.data),
  })

  const createProductMutation = useMutation({
    mutationFn: (payload: {
      name: string
      sku: string
      price: number
      stock: number
      description: string
      isActive: boolean
    }) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'], exact: false })
      setIsProductModalOpen(false)
      toast.success('Product created successfully')
    },
    onError: () => {
      toast.error('Failed to create product')
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: {
      name: string
      sku: string
      price: number
      stock: number
      description: string
      isActive: boolean
    } }) => adminApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'], exact: false })
      setIsProductModalOpen(false)
      toast.success('Product updated successfully')
    },
    onError: () => {
      toast.error('Failed to update product')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleProductStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product status updated')
    },
    onError: () => {
      toast.error('Failed to update product status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product deleted')
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Failed to load products</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-products'], exact: false })}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Button onClick={() => {
            setEditingProduct(null)
            setFormState({ name: '', sku: '', price: '', stock: '', description: '', isActive: true })
            setIsProductModalOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-4" colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Package className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No products found</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {search ? 'Try a different search term' : 'Add your first product to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                data?.data.map((product: Product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={resolveImageUrl(product.images[0]?.url)}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600"
                          />
                          {!product.isActive && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {product.category?.name || (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatPrice(product.price)}</div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        product.stock > 10
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : product.stock > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.stock > 0 ? 'bg-current' : 'bg-red-500'
                        }`} />
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? 'success' : 'danger'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/products/${product.slug}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product)
                            setFormState({
                              name: product.name,
                              sku: product.sku,
                              price: product.price.toString(),
                              stock: product.stock.toString(),
                              description: product.description || '',
                              isActive: product.isActive,
                            })
                            setIsProductModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(product.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span className={`h-4 w-4 block rounded-sm border-2 ${
                            product.isActive
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-400'
                          }`} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${product.name}"?`)) {
                              deleteMutation.mutate(product.id)
                            }
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const payload = {
              name: formState.name,
              sku: formState.sku,
              price: Number(formState.price) || 0,
              stock: Number(formState.stock) || 0,
              description: formState.description,
              isActive: formState.isActive,
            }

            if (editingProduct) {
              updateProductMutation.mutate({ id: editingProduct.id, payload })
            } else {
              createProductMutation.mutate(payload)
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Name"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="SKU"
              value={formState.sku}
              onChange={(e) => setFormState((prev) => ({ ...prev, sku: e.target.value }))}
            />
            <Input
              label="Price"
              type="number"
              value={formState.price}
              onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              value={formState.stock}
              onChange={(e) => setFormState((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[120px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formState.isActive}
                onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              Active
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createProductMutation.status === 'pending' || updateProductMutation.status === 'pending'}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
