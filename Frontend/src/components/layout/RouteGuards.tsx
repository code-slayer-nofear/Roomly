import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Spinner } from "../ui";
import { useMe } from "../../hooks/useMe";

export function ProtectedRoute() {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RoleRoute({ role }: { role: string }) {
  const { token, user } = useAuthStore();
  const { isLoading } = useMe();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  if (!user?.role.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
