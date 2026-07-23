import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Booking } from "../types";

export function useBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
