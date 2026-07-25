import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

export default function BecomeHostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-gray-900">Become a host</h1>
        <p className="mt-4 text-gray-600">Create listings, manage bookings, and earn money hosting on Roomly.</p>

        <div className="mt-10 space-y-4 text-left text-gray-700">
          <p className="font-semibold">What you can do as a host:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Publish your property and manage availability</li>
            <li>Receive and accept booking requests</li>
            <li>Track earnings in a dedicated dashboard</li>
            <li>Connect with guests through messaging</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/host/dashboard">
            <Button>Go to Host Dashboard</Button>
          </Link>
          <Link to="/host/listings/new">
            <Button variant="outline">Create a listing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
