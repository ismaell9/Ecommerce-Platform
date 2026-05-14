import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-primary-600 dark:bg-primary-500 px-8 py-10 sm:px-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">Privacy Policy</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-blue-100">
            This policy explains how ShopHub collects, uses, and protects your information when you shop with us.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 space-y-8 text-gray-700 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Information We Collect</h2>
            <p className="leading-7">
              We collect the information you provide when you create an account, place an order, subscribe to our newsletter, or interact with customer service. This includes your name, email address, shipping and billing address, payment details, and order history.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">How We Use Your Information</h2>
            <p className="leading-7">
              Your information helps us process orders, deliver packages, personalize your shopping experience, respond to inquiries, send promotional offers, and improve our website and services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sharing and Security</h2>
            <p className="leading-7">
              We never sell your personal data. We may share information with trusted service providers that help us ship orders, process payments, and support our website. We protect your data using industry-standard security practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Cookies and Tracking</h2>
            <p className="leading-7">
              We use cookies and similar technologies to remember your preferences, analyze site traffic, and deliver a better experience across devices. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Rights</h2>
            <p className="leading-7">
              You may access, update, or delete your account information. To request changes or ask questions about this policy, contact our support team at support@shophub.com.
            </p>
          </section>

          <div className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For more details, read our <Link to="/terms-of-service" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
