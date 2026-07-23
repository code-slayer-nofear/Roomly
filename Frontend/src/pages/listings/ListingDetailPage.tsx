import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useListing } from "../../hooks/useListing";
import { useListingReviews } from "../../hooks/useListingReviews";
import { useAuthStore } from "../../store/authStore";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";
import { PhotoGallery, AmenityBadge } from "../../components/listings";
import { ReviewCard, StarRating } from "../../components/reviews";
import { Avatar, Badge, Button, Spinner } from "../../components/ui";
import { formatCurrency, nightsBetween } from "../../utils";
import type { ApiError } from "../../types";
import type { AxiosError } from "axios";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: listing, isLoading } = useListing(id!);
  const { data: reviews } = useListingReviews(id!);

  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingError, setBookingError] = useState("");

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights > 0 && listing ? nights * listing.pricePerNight : 0;

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: () =>
      api.post("/bookings", { listing: id, checkIn, checkOut, guests }),
    onSuccess: ({ data }) => navigate(`/bookings/${data._id}/pay`),
    onError: (err) => {
      const msg = (err as AxiosError<ApiError>)?.response?.data?.message ?? "Booking failed";
      setBookingError(msg);
    },
  });

  function handleBook() {
    setBookingError("");
    if (!user) { navigate("/login"); return; }
    if (!checkIn || !checkOut || nights <= 0) { setBookingError("Please select valid dates"); return; }
    createBooking();
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!listing) return <div className="text-center py-32 text-gray-400">Listing not found.</div>;

  const hostIdValue = listing.hostId;
  const host = listing.host ?? (
    typeof hostIdValue === "string"
      ? {
          id: hostIdValue,
          name: "Host",
          email: "",
          role: ["host"],
        }
      : typeof hostIdValue === "object" && hostIdValue !== null
        ? {
            id: "_id" in hostIdValue ? hostIdValue._id ?? hostIdValue.id ?? "" : hostIdValue.id ?? "",
            name: hostIdValue.name ?? "Host",
            email: hostIdValue.email ?? "",
            role: hostIdValue.role ?? ["host"],
            avatarUrl: hostIdValue.avatarUrl,
            bio: hostIdValue.bio,
          }
        : undefined
  );

  const cancellationColors = { flexible: "success", moderate: "warning", strict: "danger" } as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-600">
        {listing.avgRating != null && (
          <span className="flex items-center gap-1">
            <StarRating rating={listing.avgRating} />
            <span className="font-semibold text-gray-800">{listing.avgRating.toFixed(1)}</span>
            <span>({listing.reviewCount ?? 0} reviews)</span>
          </span>
        )}
        <span>·</span>
        <span>{listing.location.city}, {listing.location.country}</span>
        <span>·</span>
        <Badge variant={cancellationColors[listing.cancellationPolicy]}>
          {listing.cancellationPolicy} cancellation
        </Badge>
      </div>

      {/* Photos */}
      <PhotoGallery photos={listing.photos} title={listing.title} />

      {/* Body */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 pb-8 border-b border-gray-200">
            {[
              { label: "guests", value: listing.maxGuests },
              { label: "bedrooms", value: listing.bedrooms },
              { label: "beds", value: listing.beds },
              { label: "bathrooms", value: listing.bathrooms },
            ].map(({ label, value }) => (
              <div key={label} className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{value}</span> {label}
              </div>
            ))}
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900 capitalize">{listing.propertyType}</span>
              <span className="text-gray-400"> · </span>
              <span className="capitalize">{listing.roomType}</span>
            </div>
          </div>

          {/* Description */}
          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About this place</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((a) => <AmenityBadge key={a} amenity={a} />)}
              </div>
            </div>
          )}

          {/* Host */}
          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hosted by</h2>
            {host ? (
              <Link to={`/users/${host.id}`} className="flex items-center gap-4 group">
                <Avatar src={host.avatarUrl} name={host.name} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-rose-500 transition-colors">
                    {host.name}
                  </p>
                  <p className="text-sm text-gray-500">View profile</p>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-gray-400">Host information unavailable.</p>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Reviews {reviews?.length ? `(${reviews.length})` : ""}
            </h2>
            {!reviews || reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-8">
                {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(listing.pricePerNight, listing.currency)}
              </span>
              <span className="text-gray-500 text-sm">/ night</span>
            </div>

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => { setCheckIn(e.target.value); setBookingError(""); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check-out</label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => { setCheckOut(e.target.value); setBookingError(""); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Guests</label>
              <input
                type="number"
                min={1}
                max={listing.maxGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-400">Max {listing.maxGuests} guests</p>
            </div>

            {/* Price breakdown */}
            {nights > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(listing.pricePerNight, listing.currency)} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>{formatCurrency(total, listing.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total, listing.currency)}</span>
                </div>
              </div>
            )}

            {bookingError && (
              <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {bookingError}
              </p>
            )}

            <Button className="w-full" loading={isPending} onClick={handleBook}>
              {user ? "Reserve" : "Log in to book"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
