import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Avatar, Button, Spinner } from "../../components/ui";
import { formatDate } from "../../utils";
import type { Message } from "../../types";

export default function ConversationPage() {
  const { otherUserId, listingId } = useParams<{ otherUserId: string; listingId: string }>();
  const [text, setText] = useState("");

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["conversation", otherUserId, listingId],
    queryFn: async () => {
      const { data } = await api.get(`/messages/${otherUserId}/${listingId}`);
      return Array.isArray(data) ? data : data?.messages ?? [];
    },
    enabled: !!otherUserId && !!listingId,
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: () => api.post("/messages", { recipient: otherUserId, listingId, content: text }),
    onSuccess: () => {
      setText("");
      window.location.reload();
    },
  });

  useEffect(() => {
    if (!otherUserId || !listingId) return;
  }, [otherUserId, listingId]);

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-slate-50">
          <h1 className="text-lg font-semibold text-gray-900">Conversation</h1>
        </div>

        <div className="p-4 space-y-3 min-h-[320px] max-h-[480px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">No messages yet.</p>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="flex gap-3">
                <Avatar src={message.sender?.avatarUrl} name={message.sender?.name ?? "User"} size="sm" />
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-800 max-w-lg">
                  <p>{message.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(message.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Write a message"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <Button loading={isPending} onClick={() => sendMessage()}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
