import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="mx-auto h-16 w-16 text-danger-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Unauthorized</h1>
        <p className="mt-2 text-gray-500">
          You do not have permission to access this page.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
