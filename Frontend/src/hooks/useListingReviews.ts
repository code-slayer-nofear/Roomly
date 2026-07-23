import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Review } from "../types";

export function useListingReviews(listingId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", listingId],
    queryFn: async () => {
      const { data } = await api.get(`/api/reviews/listing/${listingId}`);
      return data;
    },
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000,
  });
}
