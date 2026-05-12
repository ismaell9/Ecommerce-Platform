import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers'

interface BadgeProps {
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  success: 'bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400',
  warning: 'bg-warning-50 dark:bg-warning-500/10 text-warning-700 dark:text-warning-400',
  danger: 'bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400',
  info: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400',
}

export function Badge({ className, variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
