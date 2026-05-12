import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-danger-500 dark:text-danger-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Unauthorized</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You do not have permission to access this page.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
