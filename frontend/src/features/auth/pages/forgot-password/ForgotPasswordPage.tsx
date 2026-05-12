import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema } from '@/features/auth/validators/authSchemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import type { ForgotPasswordRequest } from '@/types'
import { useState } from 'react'

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      await authApi.forgotPassword(data)
      setIsSubmitted(true)
      toast.success('Password reset link sent to your email')
    } catch {
      toast.error('Failed to send reset link')
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Check your email</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              We&apos;ve sent a password reset link to your email address.
            </p>
            <Link to="/login" className="mt-6 inline-block">
              <Button>Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
