import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { ListingCard } from "../../components/listings";
import { Spinner } from "../../components/ui";
import type { Listing } from "../../types";

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/users/wishlist");
      return Array.isArray(data) ? data : data?.listings ?? [];
    },
  });

  const { mutate: toggleWishlist, isPending } = useMutation({
    mutationFn: (listingId: string) => api.post(`/users/wishlist/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-gray-500 mt-1">Your saved stays.</p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No saved listings yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="space-y-3">
              <ListingCard listing={listing} />
              <button
                onClick={() => toggleWishlist(listing._id)}
                disabled={isPending}
                className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                Remove from wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
