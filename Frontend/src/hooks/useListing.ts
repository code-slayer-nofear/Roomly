import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Listing } from "../types";

export function useListing(id: string) {
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/listings/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
