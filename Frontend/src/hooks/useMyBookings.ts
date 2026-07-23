import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Booking } from "../types";

function normalizeBooking(data: any): Booking {
  const totalPrice = Number(data?.totalPrice ?? data?.priceBreakdown?.total ?? 0);
  const guests = typeof data?.guests === "number"
    ? data.guests
    : (data?.guests?.adults ?? 0) + (data?.guests?.children ?? 0) + (data?.guests?.infants ?? 0);

  return {
    ...data,
    listing: data?.listing ?? (data?.listingId && typeof data.listingId === "object"
      ? {
          _id: data.listingId._id ?? "",
          title: data.listingId.title ?? "Listing",
          description: "",
          propertyType: "",
          roomType: "",
          location: {
            address: "",
            city: data.listingId.location?.city ?? "",
            country: data.listingId.location?.country ?? "",
          },
          pricePerNight: 0,
          currency: data.listingId.currency ?? "USD",
          maxGuests: 0,
          bedrooms: 0,
          beds: 0,
          bathrooms: 0,
          amenities: [],
          photos: [],
          status: "published",
          cancellationPolicy: "flexible",
        }
      : undefined),
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
    guests,
  };
}

export function useMyBookings() {
  return useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings/my");
      return Array.isArray(data) ? data.map(normalizeBooking) : [];
    },
    staleTime: 60 * 1000,
  });
}
