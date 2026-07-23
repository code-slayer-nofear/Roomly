import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import { useUiStore } from "../../store/uiStore";
import { ListingCard } from "../../components/listings";
import { Button, Input, Spinner } from "../../components/ui";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Cabin", "Studio", "Loft"];
const AMENITIES = ["WiFi", "Kitchen", "Parking", "Pool", "Air conditioning", "Washer", "TV", "Gym"];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchFilters, setSearchFilters, resetFilters } = useUiStore();
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync URL params → store on mount
  useEffect(() => {
    const city = searchParams.get("city") ?? "";
    if (city) setSearchFilters({ city });
  }, []);

  const { data, isLoading, isFetching } = useListings({ ...searchFilters, page });

  function handleCitySearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    const city = searchFilters.city;
    setSearchParams(city ? { city } : {});
  }

  function toggleAmenity(a: string) {
    const current = searchFilters.amenities;
    setSearchFilters({
      amenities: current.includes(a) ? current.filter((x) => x !== a) : [...current, a],
    });
    setPage(1);
  }

  function handleReset() {
    resetFilters();
    setSearchParams({});
    setPage(1);
  }

  const totalPages = data?.pages ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h1 className="text-xl font-bold text-gray-900">
          {data ? `${data.total} stays` : "Searching..."}
        </h1>
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen((o) => !o)}>
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={handleReset} className="text-xs text-rose-500 hover:underline">Reset all</button>
            </div>

            {/* City search */}
            <form onSubmit={handleCitySearch} className="flex gap-2">
              <Input
                placeholder="City"
                value={searchFilters.city}
                onChange={(e) => setSearchFilters({ city: e.target.value })}
                className="flex-1"
              />
              <Button type="submit" size="sm">Go</Button>
            </form>

            {/* Price range */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Price per night</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  min={0}
                  value={searchFilters.minPrice}
                  onChange={(e) => { setSearchFilters({ minPrice: e.target.value }); setPage(1); }}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  min={0}
                  value={searchFilters.maxPrice}
                  onChange={(e) => { setSearchFilters({ maxPrice: e.target.value }); setPage(1); }}
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Guests</p>
              <Input
                type="number"
                min={1}
                value={searchFilters.guests}
                onChange={(e) => { setSearchFilters({ guests: Number(e.target.value) }); setPage(1); }}
              />
            </div>

            {/* Property type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Property type</p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSearchFilters({ propertyType: searchFilters.propertyType === type ? "" : type }); setPage(1); }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      searchFilters.propertyType === type
                        ? "bg-rose-500 text-white border-rose-500"
                        : "border-gray-300 text-gray-600 hover:border-rose-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
              <div className="space-y-2">
                {AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchFilters.amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="accent-rose-500"
                    />
                    <span className="text-sm text-gray-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {isLoading ? "Searching..." : `${data?.total ?? 0} stays found`}
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : data?.listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No listings match your filters.</p>
              <button onClick={handleReset} className="mt-4 text-rose-500 hover:underline text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {data?.listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
