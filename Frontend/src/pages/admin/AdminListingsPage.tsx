import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Spinner, Button } from "../../components/ui";
import type { Listing } from "../../types";

export default function AdminListingsPage() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data } = await api.get("/admin/listings");
      return Array.isArray(data) ? data : [];
    },
  });

  const { mutate: approveListing } = useMutation({
    mutationFn: (listingId: string) => api.patch(`/admin/listings/${listingId}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-listings"] }),
  });

  const { mutate: suspendListing } = useMutation({
    mutationFn: (listingId: string) => api.patch(`/admin/listings/${listingId}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-listings"] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin listings</h1>
      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing._id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{listing.title}</p>
              <p className="text-sm text-gray-500">{listing.location.city}, {listing.location.country}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => approveListing(listing._id)}>Approve</Button>
              <Button variant="danger" onClick={() => suspendListing(listing._id)}>Suspend</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
