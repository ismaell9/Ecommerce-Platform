import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, changePasswordSchema } from '@/features/auth/validators/authSchemas'
import { useAppSelector } from '@/lib/hooks/redux'
import { useUpdateProfile, useChangePassword } from '@/features/auth/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, Package, Heart, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'security', label: 'Security', icon: Lock },
]

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-500/10 dark:to-primary-500/5 flex items-center justify-center">
                <User className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'wishlist' && <WishlistTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user }: { user: { firstName: string; lastName: string; email: string; phoneNumber?: string } | null }) {
  const updateProfileMutation = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  })

  const onSubmit = async (data: UpdateProfileRequest) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          disabled
          icon={<Mail className="h-4 w-4" />}
        />

        <Input
          label="Phone"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />

        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </form>
    </div>
  )
}

function OrdersTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order History</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">View and track all your orders</p>
      <Link to="/profile/orders" className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors">
        View all orders &rarr;
      </Link>
    </div>
  )
}

function WishlistTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Wishlist</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Items you&apos;ve saved for later</p>
      <Link to="/wishlist" className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors">
        View wishlist &rarr;
      </Link>
    </div>
  )
}

function SecurityTab() {
  const changePasswordMutation = useChangePassword()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = async (data: ChangePasswordRequest) => {
    try {
      await changePasswordMutation.mutateAsync(data)
      toast.success('Password changed successfully')
      reset()
    } catch {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Change Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <Input
          label="Current Password"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label="New Password"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />

        <Button type="submit" isLoading={isSubmitting}>
          Change Password
        </Button>
      </form>
    </div>
  )
}
