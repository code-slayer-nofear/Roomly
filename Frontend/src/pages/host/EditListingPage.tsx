import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";

export default function EditListingPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Edit listing</h1>
        <p className="text-gray-500 mt-2">A listing edit form will allow hosts to update their property details.</p>

        <div className="mt-10 flex gap-3">
          <Button onClick={() => navigate("/host/dashboard")}>Back to dashboard</Button>
          <Button variant="outline">Start editing listing</Button>
        </div>
      </div>
    </div>
  );
}
