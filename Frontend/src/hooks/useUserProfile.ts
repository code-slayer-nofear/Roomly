import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { User } from "../types";

export function useUserProfile(id: string) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
