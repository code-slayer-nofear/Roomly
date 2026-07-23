import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import { useUiStore } from "../../store/uiStore";
import { ListingCard } from "../../components/listings";
import { Button, Input, Spinner } from "../../components/ui";

export default function HomePage() {
  const navigate = useNavigate();
  const { setSearchFilters } = useUiStore();
  const [city, setCity] = useState("");

  const { data, isLoading } = useListings({ page: 1 });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchFilters({ city });
    navigate(`/search${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find your next stay
          </h1>
          <p className="text-rose-100 text-lg mb-10">
            Discover unique homes, apartments, and rooms around the world.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-3 shadow-xl max-w-xl mx-auto"
          >
            <Input
              placeholder="Where are you going?"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 border-0 focus:ring-0 text-gray-800 placeholder-gray-400"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <Button type="submit" size="md" className="sm:w-auto w-full rounded-xl">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured stays</h2>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
            {data?.listings.length === 0 && (
              <p className="text-center text-gray-400 py-20">No listings available yet.</p>
            )}
            {(data?.listings.length ?? 0) > 0 && (
              <div className="text-center mt-10">
                <Button variant="outline" onClick={() => navigate("/search")}>
                  View all listings
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
