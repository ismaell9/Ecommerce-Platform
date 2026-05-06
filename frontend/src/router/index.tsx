import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './ProtectedRoute'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/login/LoginPage'
import { RegisterPage } from '@/features/auth/pages/register/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password/ResetPasswordPage'
import { ProductListPage } from '@/features/products/pages/list/ProductListPage'
import { ProductDetailsPage } from '@/features/products/pages/details/ProductDetailsPage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage'
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { OrderHistoryPage } from '@/features/profile/pages/OrderHistoryPage'
import { AdminDashboardPage } from '@/features/admin/pages/dashboard/AdminDashboardPage'
import { AdminProductsPage } from '@/features/admin/pages/products/AdminProductsPage'
import { AdminOrdersPage } from '@/features/admin/pages/orders/AdminOrdersPage'
import { AdminUsersPage } from '@/features/admin/pages/users/AdminUsersPage'
import { AdminAnalyticsPage } from '@/features/admin/pages/analytics/AdminAnalyticsPage'
import { NotFoundPage } from '@/components/pages/NotFoundPage'
import { UnauthorizedPage } from '@/components/pages/UnauthorizedPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailsPage />,
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/orders',
        element: (
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'products',
            element: <AdminProductsPage />,
          },
          {
            path: 'orders',
            element: <AdminOrdersPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'analytics',
            element: <AdminAnalyticsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
