import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut, Package, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { useAppSelector } from '@/lib/hooks/redux'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { config } from '@/config/env'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useTheme()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const user = useAppSelector((state) => state.auth.user)
  const cart = useAppSelector((state) => state.cart.cart)
  const wishlist = useAppSelector((state) => state.wishlist)
  const navigate = useNavigate()
  const logoutMutation = useLogout()

  const handleSearch = useCallback((e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }, [searchQuery, navigate])

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/')
  }

  const isAdmin = user?.roles.includes(config.roles.admin)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-600">ShopHub</span>
            </Link>

              <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600">
                Home
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600"
              >
                Products
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:focus:border-primary-400"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-primary-600"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-primary-600"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-medium text-white">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-600 hover:text-primary-600"
                >
                  <Heart className="h-5 w-5" />
                  {wishlist.totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-medium text-white">
                      {wishlist.totalItems}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-600 hover:text-primary-600"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 shadow-lg">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/profile/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-600 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </form>
            </div>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
