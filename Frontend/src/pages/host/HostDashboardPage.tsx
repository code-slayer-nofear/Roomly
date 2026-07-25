import { Link } from "react-router-dom";

export default function HostDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Host dashboard</h1>
        <p className="text-gray-500 mt-1">This page is a placeholder for host analytics and bookings.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Earnings</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">$0.00</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Upcoming bookings</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">0</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Active listings</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">0</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link to="/host/bookings" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-rose-300 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900">Manage bookings</h2>
          <p className="mt-2 text-sm text-gray-500">View and manage incoming booking requests.</p>
        </Link>
        <Link to="/host/listings/new" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:border-rose-300 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900">Create listing</h2>
          <p className="mt-2 text-sm text-gray-500">Add a new property and publish it for guests.</p>
        </Link>
      </div>
    </div>
  );
}
