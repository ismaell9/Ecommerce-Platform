import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  className?: string
  children: ReactNode
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
}

interface CardContentProps {
  className?: string
  children: ReactNode
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

interface CardFooterProps {
  className?: string
  children: ReactNode
}

export function CardFooter({ className, children }: CardFooterProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>
}
