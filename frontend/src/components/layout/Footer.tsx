import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/lib/api/client'
import toast from 'react-hot-toast'

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await apiClient.post('/newsletter/subscribe', { email })
      toast.success('Subscribed to newsletter!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-xl font-bold text-primary-600">
              ShopHub
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Your one-stop destination for quality products at great prices.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-600">
                <span className="h-5 w-5">FB</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600">
                <span className="h-5 w-5">TW</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600">
                <span className="h-5 w-5">IG</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=featured" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/products?category=new" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/profile/orders" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stay Updated</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Subscribe to our newsletter for exclusive deals.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? '...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
