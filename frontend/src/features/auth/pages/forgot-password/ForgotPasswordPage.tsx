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
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <Mail className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Check your email</h2>
            <p className="mt-2 text-gray-500">
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
          <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
          <p className="mt-2 text-gray-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
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

          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
