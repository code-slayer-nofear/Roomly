import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

export function useMe() {
  const { token, setUser } = useAuthStore();

  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      setUser(data);
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
