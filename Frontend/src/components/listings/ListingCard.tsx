import { Link } from "react-router-dom";
import type { Listing } from "../../types";
import { formatCurrency } from "../../utils";

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const photo = listing.photos[0] ?? "https://placehold.co/400x300?text=No+Photo";

  return (
    <Link to={`/listings/${listing._id}`} className="group block">
      {/* Photo */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
        <img
          src={photo}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {listing.status !== "active" && (
          <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-0.5 rounded-full capitalize">
            {listing.status}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
            {listing.title}
          </p>
          {listing.avgRating != null && (
            <span className="flex items-center gap-1 text-sm text-gray-700 shrink-0">
              <svg className="w-3.5 h-3.5 fill-gray-800" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {listing.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {listing.location.city}, {listing.location.country}
        </p>
        <p className="text-sm text-gray-900 mt-1">
          <span className="font-semibold">{formatCurrency(listing.pricePerNight, listing.currency)}</span>
          <span className="text-gray-500"> / night</span>
        </p>
      </div>
    </Link>
  );
}
