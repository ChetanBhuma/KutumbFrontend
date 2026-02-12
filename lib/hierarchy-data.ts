import { HierarchyNode } from "@/types/hierarchy"
import { apiClient } from "./api-client";

// Fetch full hierarchy tree from Backend
export async function fetchHierarchyTree(): Promise<HierarchyNode[]> {
  try {
    const response = await apiClient.get<any>('/hierarchy');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch hierarchy:", error);
    return [];
  }
}

// Fallback Mock Data (Optional - kept for reference or error fallback if needed)
export const mockRanges = [];
export const mockDistricts = [];
export const mockSubDivisions = [];
export const mockStations = [];
export const mockPosts = [];
export const mockBeats = [];

// Deprecated: Old sync builder
export function buildHierarchyTree(): HierarchyNode[] {
  return [];
}
