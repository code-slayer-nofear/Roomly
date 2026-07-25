import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Spinner } from "../../components/ui";

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics");
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin analytics</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Total GMV</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">${data?.gmv ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Bookings</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{data?.total ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Confirmed</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{data?.confirmed ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-gray-400">Cancelled</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{data?.cancelled ?? 0}</p>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Bookings per day (last 30 days)</h2>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {data?.bookingsPerDay?.map((row: any) => (
            <div key={row._id} className="flex justify-between gap-4">
              <span>{row._id}</span>
              <span>{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
