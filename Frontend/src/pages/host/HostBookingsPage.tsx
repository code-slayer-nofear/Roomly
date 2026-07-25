export default function HostBookingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Host bookings</h1>
        <p className="text-gray-500 mt-1">A host booking list will appear here once your listings receive reservations.</p>
      </div>

      <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
        No host bookings yet. Create a listing to start receiving requests.
      </div>
    </div>
  );
}
