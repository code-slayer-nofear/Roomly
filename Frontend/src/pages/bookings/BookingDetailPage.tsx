import { Link, useParams } from "react-router-dom";
import { useBooking } from "../../hooks/useBooking";
import { Spinner } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBooking(id!);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  if (!booking) {
    return <div className="text-center py-32 text-gray-400">Booking not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-rose-500 font-semibold">Booking</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{booking.listing?.title ?? "Listing"}</h1>
            <p className="text-sm text-gray-500 mt-2">{booking.listing?.location?.city ?? "Unknown city"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="font-semibold text-gray-900">Status: {booking.status}</div>
            <div>Payment: {booking.paymentStatus}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Check-in</p>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Check-out</p>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Guests</p>
            <p className="mt-1 font-semibold text-gray-900">{booking.guests}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
            <p className="mt-1 font-semibold text-gray-900">{formatCurrency(booking.totalPrice, booking.listing?.currency ?? "USD")}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/bookings/${booking._id}/pay`} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
            Open payment test page
          </Link>
          <Link to="/bookings" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Back to my bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
