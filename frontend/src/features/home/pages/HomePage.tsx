import { Link } from 'react-router-dom'
import { useFeaturedProducts, useNewArrivals, useCategories } from '@/features/products/hooks/useProducts'
import { ProductCard } from '@/features/products/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import { FloatingCartAnimation } from '@/features/home/components/FloatingCartAnimation'

export function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts()
  const { data: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals()
  const { data: categories } = useCategories()

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team' },
  ]

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300/10 rounded-full blur-lg animate-float-slower"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-purple-300/10 rounded-full blur-md animate-float-slow-reverse"></div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-6 animate-fade-in-up animation-delay-100">
              New arrivals added weekly
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight animate-fade-in-up animation-delay-200">
              Discover Amazing Products at Unbeatable Prices
            </h1>
            <p className="mt-6 text-lg text-indigo-200 leading-relaxed max-w-xl animate-fade-in-up animation-delay-300">
              Shop the latest trends with fast shipping, easy returns, and 24/7 customer support. Your satisfaction is our priority.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
              <Link to="/products">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-300">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products?category=new">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:scale-105 transition-all duration-300"
                >
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-slow-reverse {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 8s ease-in-out infinite;
        }

        .animate-float-slow-reverse {
          animation: float-slow-reverse 7s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-float-slow,
          .animate-float-slower,
          .animate-float-slow-reverse {
            animation: none;
          }
        }
      `}</style>

      <FloatingCartAnimation />

      <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Shop by Category</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse our curated categories</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg dark:hover:shadow-primary-500/5 transition-all duration-200 hover:-translate-y-1"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded-lg mb-3 group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/10 dark:to-primary-500/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {category.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Products</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Handpicked just for you</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Arrivals</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The latest products added</p>
          </div>
          <Link
            to="/products?sort=new"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold">Join Our Newsletter</h2>
          <p className="mt-4 text-indigo-200 max-w-xl mx-auto text-lg">
            Subscribe to get special offers, free giveaways, and exclusive deals straight to your inbox.
          </p>
          <div className="mt-8 flex max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 rounded-xl px-4 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            />
            <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 shadow-lg shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
