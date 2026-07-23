import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Booking } from "../types";

export function useMyBookings() {
  return useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings/my");
      return data;
    },
    staleTime: 60 * 1000,
  });
}
