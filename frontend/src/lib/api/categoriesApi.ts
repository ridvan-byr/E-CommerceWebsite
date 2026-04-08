import { apiRequest } from "./client";
import type {
  CategoryDto,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types";

export async function fetchCategories(): Promise<CategoryDto[]> {
  return apiRequest<CategoryDto[]>("/api/categories");
}

export async function fetchCategory(id: number): Promise<CategoryDto> {
  return apiRequest<CategoryDto>(`/api/categories/${id}`);
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryDto> {
  return apiRequest<CategoryDto>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload
): Promise<CategoryDto> {
  return apiRequest<CategoryDto>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<unknown>(`/api/categories/${id}`, { method: "DELETE" });
}
