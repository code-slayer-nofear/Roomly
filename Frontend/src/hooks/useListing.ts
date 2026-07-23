import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Listing } from "../types";

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

export function useListing(id: string) {
  return useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`);
      return normalizeListing(data);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
