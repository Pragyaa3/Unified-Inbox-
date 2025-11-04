"use client";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InboxPage() {
  const { data: threads, mutate } = useSWR("/api/threads", fetcher);
  const [message, setMessage] = useState("");

  if (!threads) return <div>Loading inbox...</div>;

  const sendMessage = async (threadId: string, contactId: string) => {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, contactId, content: message }),
    });
    setMessage("");
    mutate();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Unified Inbox</h1>
      <div className="space-y-4">
        {threads.map((t: any) => (
          <div key={t.id} className="border rounded-lg p-4">
            <p className="font-bold">{t.contact.name}</p>
            <p className="text-gray-600">{t.messages[0]?.content}</p>
            <div className="mt-2 flex gap-2">
              <input
                className="border p-2 flex-1 rounded"
                placeholder="Type a reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={() => sendMessage(t.id, t.contact.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
