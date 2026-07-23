import { useParams } from "react-router-dom";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useListings } from "../../hooks/useListings";
import { Avatar, Spinner } from "../../components/ui";
import { ListingCard } from "../../components/listings";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUserProfile(id!);
  const { data: listingsData } = useListings({ page: 1 });

  // Filter listings by this host client-side (backend doesn't expose host filter yet)
  const hostListings = listingsData?.listings.filter((l) => l.host.id === id) ?? [];

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!user) return <div className="text-center py-32 text-gray-400">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-10 border-b border-gray-200">
        <Avatar src={user.avatarUrl} name={user.name} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          {user.role.includes("host") && (
            <p className="text-sm text-rose-500 font-medium mt-0.5">Host</p>
          )}
          {user.bio && (
            <p className="text-gray-600 mt-3 max-w-lg leading-relaxed">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Host listings */}
      {hostListings.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {user.name.split(" ")[0]}'s listings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostListings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        </div>
      )}
    </div>
  );
}
