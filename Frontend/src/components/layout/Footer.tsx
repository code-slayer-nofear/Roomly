import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-semibold text-rose-500">Roomly</span>
          <div className="flex items-center gap-6">
            <Link to="/listings" className="hover:text-rose-500 transition-colors">Explore</Link>
            <Link to="/become-host" className="hover:text-rose-500 transition-colors">Become a Host</Link>
            <a href="mailto:support@roomly.com" className="hover:text-rose-500 transition-colors">Support</a>
          </div>
          <span>© {new Date().getFullYear()} Roomly. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
