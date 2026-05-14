import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { config } from '@/config/env'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder-product.jpg'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${config.serverBaseUrl}${url}`
  return `${config.serverBaseUrl}/${url}`
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function getDiscountPercentage(original: number, current: number): number {
  if (original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function highlightText(text: string, query: string): { text: string; highlighted: boolean }[] {
  if (!query) return [{ text, highlighted: false }]
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part) => ({
    text: part,
    highlighted: part.toLowerCase() === query.toLowerCase(),
  }))
}
