import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { Button, Spinner } from "../../components/ui";
import { formatDate } from "../../utils";
import type { Notification } from "../../types";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return Array.isArray(data) ? data : data?.notifications ?? [];
    },
  });

  const { mutate: markAllRead, isPending } = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: markOneRead } = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Latest updates from the platform.</p>
        </div>
        <Button variant="outline" size="sm" loading={isPending} onClick={() => markAllRead()}>
          Mark all as read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markOneRead(notification._id)}
                    className="text-xs font-medium text-rose-500 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
