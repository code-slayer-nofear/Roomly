import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function useUnreadCount() {
  const { token } = useAuthStore();

  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread-count");
      return data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!token,
  });
}
