import { useState } from "react";

interface Props {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const shown = photos.slice(0, 5);
  const placeholder = "https://placehold.co/800x600?text=No+Photo";

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        {/* Main photo */}
        <div
          className="col-span-2 row-span-2 cursor-pointer relative group"
          onClick={() => setLightbox(0)}
        >
          <img src={shown[0] ?? placeholder} alt={title} className="w-full h-full object-cover group-hover:brightness-90 transition" />
        </div>

        {/* Side photos */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => shown[i] ? setLightbox(i) : undefined}
          >
            {shown[i] ? (
              <>
                <img src={shown[i]} alt={`${title} ${i + 1}`} className="w-full h-full object-cover group-hover:brightness-90 transition" />
                {i === 4 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{photos.length - 5} more</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <button
            className="absolute left-4 text-white text-4xl leading-none hover:text-gray-300 disabled:opacity-30"
            disabled={lightbox === 0}
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.max(0, (l ?? 0) - 1)); }}
          >
            ‹
          </button>
          <img
            src={photos[lightbox]}
            alt={`${title} ${lightbox + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white text-4xl leading-none hover:text-gray-300 disabled:opacity-30"
            disabled={lightbox === photos.length - 1}
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.min(photos.length - 1, (l ?? 0) + 1)); }}
          >
            ›
          </button>
          <span className="absolute bottom-4 text-white text-sm">{lightbox + 1} / {photos.length}</span>
        </div>
      )}
    </>
  );
}
