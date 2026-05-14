import { Link } from 'react-router-dom'

export function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-primary-600 dark:bg-primary-500 px-8 py-10 sm:px-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">Terms of Service</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-blue-100">
            These terms govern your use of ShopHub, including ordering, shipping, returns, and account management.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 space-y-8 text-gray-700 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Acceptance of Terms</h2>
            <p className="leading-7">
              By using ShopHub, you agree to these terms and our privacy policy. You must be at least 18 years old or have parental consent to place orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ordering and Payment</h2>
            <p className="leading-7">
              All orders are subject to availability and confirmation of payment. Prices and promotions may change without notice. You are responsible for providing accurate shipping information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Shipping and Returns</h2>
            <p className="leading-7">
              We offer fast shipping, easy returns, and customer support for eligible orders. Returns must comply with our return policy and be initiated within the specified return window.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Responsibilities</h2>
            <p className="leading-7">
              You are responsible for maintaining the security of your account credentials and for all activity under your account. Report unauthorized access immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Limited Liability</h2>
            <p className="leading-7">
              ShopHub is not liable for indirect, incidental, or consequential damages arising from your use of the service, except where prohibited by law.
            </p>
          </section>

          <div className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For details about how we handle your data, view our <Link to="/privacy-policy" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
