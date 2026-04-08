import { apiRequest } from "./client";
import type {
  CreateProductPayload,
  PagedResult,
  ProductDto,
  UpdateProductPayload,
} from "./types";

export async function fetchProductsPage(
  page = 1,
  pageSize = 50
): Promise<PagedResult<ProductDto>> {
  const q = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return apiRequest<PagedResult<ProductDto>>(`/api/products?${q}`);
}

export type ProductSearchParams = {
  search?: string;
  categoryId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function searchProducts(
  params: ProductSearchParams
): Promise<PagedResult<ProductDto>> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.categoryId != null) q.set("categoryId", String(params.categoryId));
  if (params.status) q.set("status", params.status);
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 50));
  return apiRequest<PagedResult<ProductDto>>(`/api/products/search?${q}`);
}

export async function fetchProduct(id: number): Promise<ProductDto> {
  return apiRequest<ProductDto>(`/api/products/${id}`);
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductDto> {
  return apiRequest<ProductDto>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload
): Promise<ProductDto> {
  return apiRequest<ProductDto>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await apiRequest(`/api/products/${id}`, { method: "DELETE", parseJson: false });
}
