import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Listing } from "../types";
import type { SearchFilters } from "../store/uiStore";

interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export function useListings(filters: Partial<SearchFilters> & { page?: number } = {}) {
  return useQuery<ListingsResponse>({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) {
          if (Array.isArray(v)) { if (v.length) params.set(k, v.join(",")); }
          else params.set(k, String(v));
        }
      });
      const { data } = await api.get(`/api/listings?${params.toString()}`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
