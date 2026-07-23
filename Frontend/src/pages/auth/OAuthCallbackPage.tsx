import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Spinner } from "../../components/ui";
import api from "../../lib/api";
import type { User } from "../../types";

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) { navigate("/login", { replace: true }); return; }

    api.get<User>("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setAuth(token, data);
        navigate("/", { replace: true });
      })
      .catch(() => {
        logout();
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Spinner size="lg" />
    </div>
  );
}
