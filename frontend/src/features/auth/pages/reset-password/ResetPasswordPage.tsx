import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPasswordSchema } from '@/features/auth/validators/authSchemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = async (data: { newPassword: string; confirmNewPassword: string }) => {
    if (!token || !email) {
      toast.error('Invalid reset link')
      return
    }

    try {
      await authApi.resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      })
      toast.success('Password reset successfully')
      navigate('/login')
    } catch {
      toast.error('Failed to reset password')
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Invalid reset link</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Please request a new password reset link.
          </p>
          <Link to="/forgot-password" className="mt-4 inline-block">
            <Button>Request New Link</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset password</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Enter your new password</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              icon={<Lock className="h-4 w-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
