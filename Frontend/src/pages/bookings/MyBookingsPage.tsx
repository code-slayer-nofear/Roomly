import { Link } from "react-router-dom";
import { useMyBookings } from "../../hooks/useMyBookings";
import { Spinner } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-sky-100 text-sky-700",
};

export default function MyBookingsPage() {
  const { data: bookings, isLoading } = useMyBookings();

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
        <p className="text-gray-500 mt-1">A tiny dashboard to confirm the booking flow is wired.</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No bookings yet. Visit a listing and create one to test the flow.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{booking.listing?.title ?? "Listing"}</p>
                  <p className="text-sm text-gray-500">
                    {booking.listing?.location?.city ?? "Unknown city"} · {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {booking.guests} guest{booking.guests > 1 ? "s" : ""} · {booking.paymentStatus}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[booking.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {booking.status}
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(booking.totalPrice ?? 0, booking.listing?.currency ?? "USD")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/bookings/${booking._id}`} className="text-sm font-medium text-rose-500 hover:underline">
                  View booking
                </Link>
                <Link to={`/bookings/${booking._id}/pay`} className="text-sm font-medium text-slate-700 hover:underline">
                  Payment test page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
