import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";

export default function CreateListingPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create a listing</h1>
        <p className="text-gray-500 mt-2">This multi-step listing form will allow hosts to publish new properties.</p>

        <div className="mt-8 space-y-4 text-gray-700">
          <p>Step 1: Property basics</p>
          <p>Step 2: Location details</p>
          <p>Step 3: Amenities and photos</p>
          <p>Step 4: Pricing and rules</p>
        </div>

        <div className="mt-10 flex gap-3">
          <Button onClick={() => navigate("/host/dashboard")}>Back to dashboard</Button>
          <Button variant="outline">Start creating listing</Button>
        </div>
      </div>
    </div>
  );
}
