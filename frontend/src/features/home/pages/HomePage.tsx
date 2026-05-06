import { Link } from 'react-router-dom'
import { useFeaturedProducts, useNewArrivals, useCategories } from '@/features/products/hooks/useProducts'
import { ProductCard } from '@/features/products/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'

export function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts()
  const { data: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals()
  const { data: categories } = useCategories()

  return (
    <div>
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Discover Amazing Products at Unbeatable Prices
            </h1>
            <p className="mt-6 text-lg text-primary-100">
              Shop the latest trends with fast shipping, easy returns, and 24/7 customer support.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products?category=new">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <feature.icon className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link
              to="/products"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 bg-white hover:border-primary-200 hover:shadow-md transition-all"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-primary-600">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  {category.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link
              to="/products"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link
            to="/products?sort=new"
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {newArrivalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Join Our Newsletter</h2>
          <p className="mt-4 text-primary-100 max-w-xl mx-auto">
            Subscribe to get special offers, free giveaways, and exclusive deals.
          </p>
          <div className="mt-8 flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 rounded-lg px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
