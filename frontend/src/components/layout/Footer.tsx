import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-xl font-bold text-primary-600">
              ShopHub
            </Link>
            <p className="mt-4 text-sm text-gray-500">
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
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-gray-500 hover:text-primary-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=featured" className="text-sm text-gray-500 hover:text-primary-600">
                  Featured
                </Link>
              </li>
              <li>
                <Link to="/products?category=new" className="text-sm text-gray-500 hover:text-primary-600">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/profile" className="text-sm text-gray-500 hover:text-primary-600">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/profile/orders" className="text-sm text-gray-500 hover:text-primary-600">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm text-gray-500 hover:text-primary-600">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                support@shophub.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
