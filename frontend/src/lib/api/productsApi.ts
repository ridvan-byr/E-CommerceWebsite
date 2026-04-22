import { apiRequest, getApiBaseUrl, performSessionInvalidationFromUnauthorized } from "./client";
import type {
  CreateProductPayload,
  PagedResult,
  ProductDto,
  UpdateProductPayload,
} from "./types";

export type ProductSearchParams = {
  search?: string;
  categoryId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  /** name sırası için boş bırakın; backend: price_asc, price_desc, stock */
  sortBy?: string;
};

export async function searchProducts(
  params: ProductSearchParams
): Promise<PagedResult<ProductDto>> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.categoryId != null) q.set("categoryId", String(params.categoryId));
  if (params.status) q.set("status", params.status);
  if (params.minPrice != null && !Number.isNaN(params.minPrice))
    q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null && !Number.isNaN(params.maxPrice))
    q.set("maxPrice", String(params.maxPrice));
  if (params.minStock != null && !Number.isNaN(params.minStock))
    q.set("minStock", String(Math.floor(params.minStock)));
  if (params.sortBy) q.set("sortBy", params.sortBy);
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

/**
 * Ürün görselini API üzerinden yükler; backend Cloudflare R2'ye yazar ve genel HTTPS URL döner.
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const url = `${getApiBaseUrl()}/api/products/upload-image`;

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string };
          resolve(data.url);
        } catch {
          reject(new Error("Sunucu yanıtı geçersiz."));
        }
      } else {
        if (xhr.status === 401) {
          performSessionInvalidationFromUnauthorized();
        }
        let msg = `HTTP ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText) as { message?: string };
          if (err.message) msg = err.message;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Ağ hatası oluştu."));
    xhr.ontimeout = () => reject(new Error("Yükleme zaman aşımına uğradı."));
    xhr.timeout = 30_000;

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}
