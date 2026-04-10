import { apiRequest } from "./client";
import type {
  CreateProductFeaturePayload,
  ProductFeatureDto,
  UpdateProductFeaturePayload,
} from "./types";

export async function fetchProductFeatures(
  productId: number
): Promise<ProductFeatureDto[]> {
  const list = await apiRequest<ProductFeatureDto[]>(
    `/api/products/${productId}/features`
  );
  return list ?? [];
}

export async function createProductFeature(
  productId: number,
  payload: CreateProductFeaturePayload
): Promise<ProductFeatureDto> {
  const body: Record<string, string | number> = {
    name: payload.name.trim(),
    value: payload.value.trim(),
  };
  if (payload.sortOrder != null && Number.isFinite(payload.sortOrder)) {
    body.sortOrder = payload.sortOrder;
  }
  return apiRequest<ProductFeatureDto>(`/api/products/${productId}/features`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProductFeature(
  productId: number,
  productFeatureId: number,
  payload: UpdateProductFeaturePayload
): Promise<ProductFeatureDto> {
  const body: Record<string, string | number> = {
    value: payload.value.trim(),
    sortOrder: payload.sortOrder,
  };
  const n = payload.name?.trim();
  if (n) body.name = n;
  return apiRequest<ProductFeatureDto>(
    `/api/products/${productId}/features/${productFeatureId}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

export async function deleteProductFeature(
  productId: number,
  productFeatureId: number
): Promise<void> {
  await apiRequest(
    `/api/products/${productId}/features/${productFeatureId}`,
    { method: "DELETE", parseJson: false }
  );
}
