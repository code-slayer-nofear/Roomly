import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Avatar, Button } from "../../components/ui";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const addressText = [user?.address?.city, user?.address?.country].filter(Boolean).join(", ");

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={user.avatarUrl} name={user.name} size="xl" />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Link to="/profile/edit">
                <Button variant="outline" size="sm">Edit profile</Button>
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">Role</p>
                <p className="mt-1 font-semibold text-gray-900">{user.role.join(", ") || "guest"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
                <p className="mt-1 font-semibold text-gray-900">{user.isSuspended ? "Suspended" : "Active"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-400">Address</p>
                <p className="mt-1 font-semibold text-gray-900">{addressText || "No address set"}</p>
              </div>
            </div>

            {user.bio && (
              <div className="mt-5 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
                {user.bio}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
