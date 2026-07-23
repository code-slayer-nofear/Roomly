import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Review } from "../types";

function normalizeReview(review: any): Review {
  return {
    ...review,
    author: review.author ?? (review.authorId
      ? {
          id: review.authorId._id ?? review.authorId.id ?? "",
          name: review.authorId.name ?? "User",
          email: "",
          role: ["guest"],
          avatarUrl: review.authorId.avatarUrl,
        }
      : undefined),
  };
}

export function useListingReviews(listingId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", listingId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/listing/${listingId}`);
      return Array.isArray(data) ? data.map(normalizeReview) : [];
    },
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000,
  });
}
