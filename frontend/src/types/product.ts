export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  productCount: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  productCount: number
}

export interface ProductVariant {
  id: string
  sku: string
  price: number
  originalPrice?: number
  stock: number
  attributes: Record<string, string>
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
  order: number
}

export interface ProductSpecification {
  name: string
  value: string
}

export interface ProductReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  isVerifiedPurchase: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  stock: number
  sku: string
  categoryId: string
  category: Category
  brandId?: string
  brand?: Brand
  images: ProductImage[]
  variants: ProductVariant[]
  specifications: ProductSpecification[]
  reviews: ProductReview[]
  averageRating: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  search?: string
  inStock?: boolean
}
