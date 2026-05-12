import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { StoreProvider } from './providers/StoreProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <QueryProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryProvider>
    </StoreProvider>
  </StrictMode>,
)
