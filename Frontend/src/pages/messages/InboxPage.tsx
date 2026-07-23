import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Avatar, Spinner } from "../../components/ui";
import { formatDate } from "../../utils";
import type { Conversation } from "../../types";

export default function InboxPage() {
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["inbox"],
    queryFn: async () => {
      const { data } = await api.get("/messages/inbox");
      return Array.isArray(data) ? data : data?.conversations ?? [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbox</h1>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No conversations yet.
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Link
              key={`${conversation.otherUser.id}-${conversation.listing._id}`}
              to={`/inbox/${conversation.otherUser.id}/${conversation.listing._id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-rose-200"
            >
              <div className="flex items-start gap-3">
                <Avatar src={conversation.otherUser.avatarUrl} name={conversation.otherUser.name} size="md" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{conversation.otherUser.name}</p>
                    <span className="text-xs text-gray-400">{formatDate(conversation.lastMessage?.createdAt ?? new Date())}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{conversation.listing.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{conversation.lastMessage?.content}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{conversation.unreadCount}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
