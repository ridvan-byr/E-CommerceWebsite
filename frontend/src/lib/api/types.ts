/** API JSON (ASP.NET camelCase) */

export interface CategoryDto {
  categoryId: number;
  name: string;
  productCount: number;
  isDeleted: boolean;
  createdByUserId?: number | null;
  createdBy?: string | null;
  createdAt: string;
  updatedByUserId?: number | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface ProductDto {
  productId: number;
  categoryId: number;
  categoryName?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  originalPrice?: number | null;
  isDiscount: boolean;
  stock: number;
  status: string;
  imageUrl?: string | null;
  isDeleted: boolean;
  createdByUserId?: number | null;
  createdBy?: string | null;
  createdAt: string;
  updatedByUserId?: number | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  features?: ProductFeatureDto[] | null;
}

export interface ProductFeatureDto {
  productFeatureId: number;
  productId: number;
  featureId: number;
  featureName: string;
  value: string;
  sortOrder: number;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name: string;
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  originalPrice?: number | null;
  isDiscount: boolean;
  stock: number;
  status: string;
  imageUrl?: string | null;
  barcode?: string | null;
}

export interface UpdateProductPayload {
  categoryId: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  originalPrice?: number | null;
  isDiscount: boolean;
  stock: number;
  status: string;
  imageUrl?: string | null;
  barcode?: string | null;
}

/** POST /api/products/{id}/features — sunucu özellik adına göre Feature kaydı bulur veya oluşturur */
export interface CreateProductFeaturePayload {
  name: string;
  value: string;
  sortOrder?: number | null;
}

export interface UpdateProductFeaturePayload {
  value: string;
  sortOrder: number;
  /** Özellik adını değiştirmek için; verilmezse sunucu mevcut adı korur */
  name?: string | null;
}

export interface UserProfileDto {
  userId: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  photoUrl?: string | null;
  kvkkAccepted: boolean;
}

/** JWT, HttpOnly cookie'de; gövdeye isteğe bağlı (artık normalde dönülmez). */
export interface AuthResponseDto {
  accessToken?: string;
  expiresAtUtc: string;
  user: UserProfileDto;
}
