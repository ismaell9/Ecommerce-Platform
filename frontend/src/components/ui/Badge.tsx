import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers'

interface BadgeProps {
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-primary-50 text-primary-700',
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
