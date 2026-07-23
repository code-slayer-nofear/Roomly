import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-rose-500 uppercase tracking-wide">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Page not found</h1>
        <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
