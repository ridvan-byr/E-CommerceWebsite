import { apiRequest, ApiRequestError } from "./client";
import type { FeatureDefinitionDto } from "./types";

function asObject(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

/** Sunucu / ara katman farklı anahtar adları kullanabilir. */
function extractFeatureId(o: Record<string, unknown>): number | null {
  const tryKeys = ["featureId", "FeatureId", "featureID", "id", "Id"];
  for (const k of tryKeys) {
    if (!(k in o)) continue;
    const v = o[k];
    if (v === undefined || v === null) continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n >= 1) return Math.trunc(n);
  }
  return null;
}

function normalizeFeatureList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const o = asObject(raw);
  if (!o) return [];
  const items = o.items ?? o.Items ?? o.data ?? o.Data;
  return Array.isArray(items) ? items : [];
}

/** API yanıtını FeatureDefinitionDto'ya çevirir. */
function parseFeatureDefinition(raw: unknown): FeatureDefinitionDto {
  const o = asObject(raw);
  if (!o) {
    return {
      featureId: 0,
      name: "",
      isDeleted: false,
      createdAt: "",
    };
  }
  const fid = extractFeatureId(o);
  return {
    featureId: fid ?? 0,
    name: String(o.name ?? o.Name ?? ""),
    isDeleted: Boolean(o.isDeleted ?? o.IsDeleted ?? false),
    createdBy: (o.createdBy ?? o.CreatedBy) as string | null | undefined,
    createdAt: String(o.createdAt ?? o.CreatedAt ?? ""),
    updatedBy: (o.updatedBy ?? o.UpdatedBy) as string | null | undefined,
    updatedAt: (o.updatedAt ?? o.UpdatedAt) as string | null | undefined,
  };
}

export async function fetchFeatureDefinitions(): Promise<FeatureDefinitionDto[]> {
  const raw = await apiRequest<unknown>("/api/features");
  return normalizeFeatureList(raw).map(parseFeatureDefinition);
}

export async function createFeatureDefinition(payload: {
  name: string;
}): Promise<FeatureDefinitionDto> {
  const raw = await apiRequest<unknown>("/api/features", {
    method: "POST",
    body: JSON.stringify({ name: payload.name.trim() }),
  });

  let parsed = parseFeatureDefinition(raw);

  if (!parsed.featureId || parsed.featureId < 1) {
    const nameNorm = payload.name.trim().toLowerCase();
    const list = await fetchFeatureDefinitions();
    const found = list.find(
      (f) => f.name.trim().toLowerCase() === nameNorm && f.featureId >= 1,
    );
    if (found) return found;
    throw new ApiRequestError(
      "Özellik oluşturuldu ancak yanıttan özellik numarası okunamadı. GET /api/features çıktısını kontrol edin.",
      500,
      raw,
    );
  }

  return parsed;
}
