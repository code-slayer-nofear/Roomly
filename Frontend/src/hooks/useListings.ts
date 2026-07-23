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

function normalizeListing(data: any): Listing {
  const hostId = data?.hostId ?? data?.host;
  const host = data?.host ?? (
    typeof hostId === "string"
      ? {
          id: hostId,
          name: "Host",
          email: "",
          role: ["host"],
        }
      : hostId && typeof hostId === "object"
        ? {
            id: hostId._id ?? hostId.id ?? "",
            name: hostId.name ?? "Host",
            email: hostId.email ?? "",
            role: hostId.role ?? ["host"],
            avatarUrl: hostId.avatarUrl,
            bio: hostId.bio,
          }
        : undefined
  );

  return {
    ...data,
    host,
  };
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

      const { data } = await api.get(`/listings?${params.toString()}`);
      const rawListings = Array.isArray(data) ? data : data?.listings ?? [];

      return {
        listings: rawListings.map(normalizeListing),
        total: Array.isArray(data) ? data.length : data?.total ?? rawListings.length,
        page: Array.isArray(data) ? 1 : data?.page ?? 1,
        pages: Array.isArray(data) ? 1 : data?.pages ?? 1,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}
