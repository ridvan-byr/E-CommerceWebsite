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
  return apiRequest<ProductFeatureDto>(`/api/products/${productId}/features`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProductFeature(
  productId: number,
  productFeatureId: number,
  payload: UpdateProductFeaturePayload
): Promise<ProductFeatureDto> {
  return apiRequest<ProductFeatureDto>(
    `/api/products/${productId}/features/${productFeatureId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
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
