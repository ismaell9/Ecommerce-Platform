# Ecommerce-Platform — Project State Reference

> **Generated:** 2026-05-12  
> **Purpose:** Reference for any agent to understand the project, all fixes applied, and where to continue.

---

## 1. Project Overview

Full-stack ecommerce platform:
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Redux Toolkit, TanStack Query v5, React Router, Axios
- **Backend:** ASP.NET Core (.NET 10), Clean Architecture (Domain → Application → Infrastructure → API), EF Core + SQLite, MediatR (CQRS), JWT Auth, Serilog
- **Database:** SQLite (`ecommerce.db`)
- **GitHub:** `https://github.com/ismaell9/Ecommerce-Platform` (branches: `main`, `develop`)

### Architecture

```
backend/
├── src/
│   ├── Domain/          # Entities, Enums
│   ├── Application/     # Commands, Queries (CQRS), Interfaces, DTOs
│   ├── Infrastructure/  # EF Core DbContext, Repositories, Services (Email, Payment, Token)
│   └── API/             # Controllers, Middleware, DbSeeder, Program.cs
frontend/
├── src/
│   ├── components/      # UI components (Button, Input, Pagination, Skeleton)
│   │   ├── layout/      # AppLayout, Header, Footer, AdminLayout
│   │   └── providers/   # ThemeProvider
│   ├── config/          # env.ts (API URLs, defaults)
│   ├── features/        # Domain feature modules (auth, cart, checkout, products, profile, wishlist, admin)
│   ├── lib/
│   │   ├── api/         # Axios client + service files (products, cart, orders, auth, etc.)
│   │   ├── hooks/       # Redux typed hooks
│   │   └── utils/       # helpers.ts (resolveImageUrl, formatPrice, twMerge)
│   ├── store/           # Redux slices (auth, cart, wishlist)
│   └── types/           # TypeScript interfaces
```

### Credentials (seeded)

| Role     | Email               | Password       |
|----------|---------------------|----------------|
| Admin    | admin@shophub.com   | Admin@123      |
| Customer | john@example.com    | Customer@123   |

---

## 2. What Was Fixed / Implemented

### 2.1 Search & Filter

**Problem:** The header had a visible search bar but it was not wired — typing and pressing Enter did nothing.

**Fix:**
- `Header.tsx` — Added `handleSearch` callback that navigates to `/products?search=<query>` on Enter/submit. Made the search input a controlled component (`searchQuery` state).
- `ProductListPage.tsx` — Added `useSearchParams()` to read `search` from URL on mount. Added a search input in the filter sidebar. The `search` param is passed to `useProducts()` as `filters.search`.
- `products.ts` (API) — Fixed the TypeScript type from `PaginatedResponse<Product>` to `ApiResponse<PaginatedResponse<Product>>` to match actual backend response shape.

### 2.2 Database Persistence (Prevent Reseeding on Every Run)

**Problem:** SQLite connection string was relative (`Data Source=ecommerce.db`). Depending on working directory, the database was created in different locations or recreated on every restart.

**Fix:**
- `Program.cs:14-15` — Added: `var dbPath = Path.Combine(builder.Environment.ContentRootPath, "ecommerce.db"); builder.Configuration["ConnectionStrings:DefaultConnection"] = $"Data Source={dbPath}";`
- Database is now always at `backend/src/API/ecommerce.db`.

### 2.3 Cart Not Refreshed After Payment

**Problem:** After successful order, the cart React Query cache and Redux state were stale. The user could still see old items and counts.

**Fix:**
- `CheckoutPage.tsx` — Added:
  - `useQueryClient()` — calls `queryClient.invalidateQueries({ queryKey: ['cart'] })` on successful payment.
  - `useAppDispatch()` + `clearCart()` — dispatches `clearCart()` from Redux cart slice.

### 2.4 Product Images (Including Product Details)

**Problem:** Images were external Unsplash URLs. On product detail page, images appeared broken because EF Core queries didn't `.Include()` related entities.

**Fix:**
- `DbSeeder.cs` — Downloads Unsplash images to `wwwroot/uploads/products/` on first seed and stores local relative URLs.
- All product queries (`GetProductsQuery`, `GetFeaturedProductsQuery`, `GetNewArrivalsQuery`, `GetProductBySlugQuery`, `GetCartQuery`, `AddToCartCommand`, `CreateOrderCommand`, `GetWishlistQuery`) now use `ProductsWithIncludes` + `.Include(p => p.Images)` (and `.Include(p => p.Category)` / `.Include(p => p.Brand)` / `.Include(p => p.Variants)` as needed).
- `IApplicationDbContext.cs` — Added `DbSet<Product> ProductsWithIncludes` property.
- `ApplicationDbContext.cs` — Exposed `ProductsWithIncludes` returning `Set<Product>()`.
- `helpers.ts` — Added `resolveImageUrl(url)` to prepend `serverBaseUrl`.
- `UploadController.cs` — `POST /api/upload/product-image` for admin image uploads.

### 2.5 Newsletter Subscribe

**Problem:** No newsletter functionality existed.

**Fix:**
- `NewsletterController.cs` — `POST /api/newsletter/subscribe` accepts `{ email }`, logs it via `ILogger`, returns success.
- `Footer.tsx` — Added email input + subscribe button with API call.

### 2.6 Dark Mode

**Problem:** No dark mode support.

**Fix:**
- `ThemeProvider.tsx` — React context provider that toggles `.dark` class on `<html>`, persists to `localStorage`, respects `prefers-color-scheme`.
- `index.css` — Added `@custom-variant dark (&:where(.dark, .dark *));` (Tailwind v4 class-based dark mode).
- `main.tsx` — Wrapped app with `<ThemeProvider>`.
- `Header.tsx` — Added Sun/Moon toggle button.
- Dark mode classes applied to: Header, Footer, AppLayout, ProductListPage, CheckoutPage.

### 2.7 Missing Backend Endpoints

| Endpoint | File | Description |
|----------|------|-------------|
| `PUT /api/auth/profile` | `AuthController.cs` | Update profile (name, email, phone) |
| `POST /api/auth/profile/image` | `AuthController.cs` | Upload profile picture |
| `POST /api/auth/change-password` | `AuthController.cs` | Change password |
| `POST /api/upload/product-image` | `UploadController.cs` | Admin product image upload |
| `POST /api/newsletter/subscribe` | `NewsletterController.cs` | Newsletter subscription |

### 2.8 Wallet Payment Gateway

**Problem:** No wallet payment flow existed.

**Fix:**
- `IPaymentGatewayService.cs` — Interface with `ProcessPaymentAsync`, `RefundPaymentAsync`, `GetPaymentStatus`.
- `DummyPaymentGatewayService.cs` — Simulates wallet deduction (checks user's wallet, if insufficient falls back to simulated success).
- `PaymentsController.cs` — `POST /api/payments/process` processes payment via wallet balance check.

### 2.9 CORS & Proxy

- `Program.cs` — CORS origins updated to include ports 3000, 3001, 3002 with `AllowCredentials()`.
- `vite.config.ts` — Proxy target changed from `localhost:5000` to `localhost:7001`.

### 2.10 Build & TypeScript Fixes

- `products.ts` — Fixed `PaginatedResponse` → `ApiResponse<PaginatedResponse>` type mismatch.
- Removed unused imports/variables (`isAuthenticated` in AppLayout, `Mail` in Footer, `toggleCart`/`dispatch` in Header).

---

## 3. How to Run

```bash
# Backend (port 7001)
dotnet run --project backend/src/API

# Frontend (port 3000)
cd frontend && npm run dev
```

Frontend proxies `/api/*` to `http://localhost:7001`.

---

## 4. Known Issues / Future Work

### High Priority
- **Forgot password email** — `EmailService.cs` only logs. Needs SendGrid/Mailgun/SMTP integration to actually send emails.
- **Product image in `ProductDetailsPage.tsx`** — The `/reviews/{productId}` endpoint on `ProductsController.cs:84` is a stub (uses empty slug). Need a proper handler.

### Medium Priority
- **Dark mode coverage** — Only applied to Header, Footer, ProductListPage, CheckoutPage. Missing: HomePage, Login, Register, ProductDetailsPage, Profile pages, OrderHistoryPage, AdminDashboard, CartPage, WishlistPage.
- **Review system** — `AddReview` endpoint is a TODO stub. Need a complete review CRUD in Application layer.
- **Email verification** — `GET /api/auth/verify-email` is a stub.
- **Search result highlights** — No UI feedback showing the current search term on the product list page.
- **Infinite scroll / pagination UX** — Current pagination works but could be improved with URL-persisted page number.

### Low Priority
- **Order cancellation flow** — `POST /api/orders/{id}/cancel` exists but may need refund integration.
- **Admin product management** — No UI for adding/editing products via admin panel.
- **Coupon validation** — `GET /api/coupons/validate/:code` exists but no UI in checkout to apply coupon codes.
- **Real payment gateway** — `DummyPaymentGatewayService` simulates success. Replace with Stripe/PayPal for production.
- **EF Core Migrations** — Uses `EnsureCreatedAsync()`. Switch to `dotnet ef migrations` for production schema management.

### Tech Debt
- `AuthController.cs:84` — Uses `GetProductBySlugQuery("")` which throws `NotFoundException` for any review lookup.
- Add `.vite/` to `.gitignore`.

---

## 5. Key File Reference

| File | Purpose |
|------|---------|
| `backend/src/API/Program.cs` | App bootstrap, CORS, JWT, DB path fix, middleware |
| `backend/src/API/DbSeeder.cs` | Seeds all data + downloads product images |
| `backend/src/API/Controllers/*` | All API endpoints |
| `backend/src/Application/Features/**/*.cs` | CQRS commands/queries/handlers |
| `backend/src/Infrastructure/Data/ApplicationDbContext.cs` | EF Core DbContext |
| `backend/src/Infrastructure/Services/DummyPaymentGatewayService.cs` | Wallet payment simulation |
| `backend/src/Infrastructure/Services/EmailService.cs` | Email stub (logs only) |
| `backend/src/Infrastructure/DependencyInjection.cs` | DI registration |
| `frontend/src/main.tsx` | App entry, providers wrapping |
| `frontend/src/components/providers/ThemeProvider.tsx` | Dark mode context |
| `frontend/src/components/layout/Header.tsx` | Nav, search bar, dark mode toggle |
| `frontend/src/components/layout/Footer.tsx` | Newsletter subscribe form |
| `frontend/src/features/products/pages/list/ProductListPage.tsx` | Product grid, filters, search, pagination |
| `frontend/src/features/checkout/pages/CheckoutPage.tsx` | Checkout form, cart invalidation after payment |
| `frontend/src/lib/utils/helpers.ts` | `resolveImageUrl()`, `formatPrice()`, `cn()` |
| `frontend/src/lib/api/products.ts` | Product API service (typed) |
| `frontend/src/lib/api/client.ts` | Axios instance with JWT interceptor |
| `frontend/src/index.css` | Tailwind v4 import, dark variant, theme tokens |
| `frontend/vite.config.ts` | Dev server, proxy config |
