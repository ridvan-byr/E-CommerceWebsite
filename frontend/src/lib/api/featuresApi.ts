import { apiRequest } from "./client";
import type { FeatureDefinitionDto } from "./types";

export async function fetchFeatureDefinitions(): Promise<FeatureDefinitionDto[]> {
  return apiRequest<FeatureDefinitionDto[]>("/api/features");
}
