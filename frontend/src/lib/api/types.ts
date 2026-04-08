/** API JSON (ASP.NET camelCase) */

export interface CategoryDto {
  categoryId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  isDeleted: boolean;
  createdBy?: string | null;
  createdAt: string;
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
  createdBy?: string | null;
  createdAt: string;
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

export interface FeatureDefinitionDto {
  featureId: number;
  name: string;
  isDeleted: boolean;
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
  description: string;
  imageUrl?: string | null;
}

export interface UpdateCategoryPayload {
  name: string;
  description: string;
  imageUrl?: string | null;
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  description: string;
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
  price: number;
  originalPrice?: number | null;
  isDiscount: boolean;
  stock: number;
  status: string;
  imageUrl?: string | null;
  barcode?: string | null;
}

export interface CreateProductFeaturePayload {
  featureId: number;
  value: string;
  sortOrder?: number | null;
}

export interface UpdateProductFeaturePayload {
  value: string;
  sortOrder: number;
}
