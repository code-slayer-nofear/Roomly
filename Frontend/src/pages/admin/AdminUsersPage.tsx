import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Spinner, Button } from "../../components/ui";
import type { User } from "../../types";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return Array.isArray(data) ? data : [];
    },
  });

  const { mutate: suspendUser } = useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const { mutate: unsuspendUser } = useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/unsuspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin users</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="flex gap-2">
              {user.isSuspended ? (
                <Button variant="outline" onClick={() => unsuspendUser(user.id)}>Unsuspend</Button>
              ) : (
                <Button variant="danger" onClick={() => suspendUser(user.id)}>Suspend</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
