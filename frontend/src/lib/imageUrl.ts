import { getApiBaseUrl } from "./api/client";

/**
 * Backend'den gelen göreli görsel yollarını (örn. "/uploads/products/xyz.jpg")
 * tam URL'e çevirir. Halihazırda http(s) veya data: URL'leri değiştirmeden döner.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  const base = getApiBaseUrl();
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
