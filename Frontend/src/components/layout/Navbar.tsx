import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../ui";

function NotificationBell({ count }: { count: number }) {
  return (
    <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-rose-500 transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-2.405A2.032 2.032 0 0118 13V9a6 6 0 10-12 0v4c0 .386-.146.735-.405 1.005L4 17h5m6 0a3 3 0 11-6 0" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  const isHost = user?.role.includes("host");
  const isAdmin = user?.role.includes("admin");

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-rose-500 font-bold text-xl tracking-tight">
          Roomly
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <NavLink to="/listings" className={({ isActive }) => isActive ? "text-rose-500" : "hover:text-rose-500 transition-colors"}>
            Explore
          </NavLink>
          {isHost && (
            <NavLink to="/host/dashboard" className={({ isActive }) => isActive ? "text-rose-500" : "hover:text-rose-500 transition-colors"}>
              Host Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "text-rose-500" : "hover:text-rose-500 transition-colors"}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NotificationBell count={0} />
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Profile
                    </Link>
                    <Link to="/bookings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      My Bookings
                    </Link>
                    {!isHost && (
                      <Link to="/become-host" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Become a Host
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-rose-500 hover:bg-gray-50">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-rose-500 transition-colors px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-medium bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
