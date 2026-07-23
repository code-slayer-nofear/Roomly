import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useBooking } from "../../hooks/useBooking";
import api from "../../lib/api";
import { Spinner } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBooking(id!);
  const [clientSecret, setClientSecret] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/bookings/${id}/pay`),
    onSuccess: ({ data }) => setClientSecret(data.clientSecret ?? ""),
  });

  const detailLine = useMemo(() => {
    if (!booking) return "";
    return `${booking.listing?.title ?? "Listing"} · ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)}`;
  }, [booking]);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  if (!booking) {
    return <div className="text-center py-32 text-gray-400">Booking not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-rose-500 font-semibold">Payment test</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Checkout for {booking.listing?.title ?? "listing"}</h1>
        <p className="text-gray-500 mt-2">{detailLine}</p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <span>Total amount</span>
            <span className="font-semibold text-gray-900">{formatCurrency(booking.totalPrice, booking.listing?.currency ?? "USD")}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {isPending ? "Requesting payment intent..." : "Create payment intent"}
          </button>
        </div>

        {clientSecret ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">Client secret received</p>
            <p className="mt-2 text-xs text-emerald-900 break-all">{clientSecret}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Use this page to verify your backend Stripe payment flow is responding.</p>
        )}
      </div>
    </div>
  );
}
