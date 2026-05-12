export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  serverBaseUrl: import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:7001',
  appName: import.meta.env.VITE_APP_NAME || 'Ecommerce',
  tokenExpiryMinutes: Number(import.meta.env.VITE_TOKEN_EXPIRY_MINUTES) || 60,
  defaultPageSize: 12,
  roles: {
    admin: 'Admin',
    customer: 'Customer',
  },
} as const
