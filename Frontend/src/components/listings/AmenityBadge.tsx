const ICONS: Record<string, string> = {
  WiFi: "📶",
  Kitchen: "🍳",
  Parking: "🅿️",
  Pool: "🏊",
  "Air conditioning": "❄️",
  Washer: "🫧",
  TV: "📺",
  Gym: "🏋️",
  Heating: "🔥",
  Workspace: "💻",
  Balcony: "🌇",
  "Pet friendly": "🐾",
};

export default function AmenityBadge({ amenity }: { amenity: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className="text-base">{ICONS[amenity] ?? "✓"}</span>
      <span>{amenity}</span>
    </div>
  );
}
