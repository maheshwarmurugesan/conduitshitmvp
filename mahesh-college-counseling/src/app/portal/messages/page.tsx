"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

type Message = {
  id: string;
  content: string;
  fromAdmin: boolean;
  createdAt: string;
};

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    const res = await fetch("/api/portal/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link href="/portal" className="text-sm text-neutral-600 hover:text-black mb-6 inline-block">
            ← Portal
          </Link>
          <h1 className="text-2xl font-semibold mb-2">Messages</h1>
          <p className="text-neutral-600 mb-8">
            Contact Mahesh. Responses typically within 24 hours.
          </p>

          <div className="border border-neutral-200 mb-8">
            {loading ? (
              <p className="p-8 text-neutral-500">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="p-8 text-neutral-500">No messages yet.</p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 ${m.fromAdmin ? "bg-neutral-50" : ""}`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {m.fromAdmin ? "Mahesh" : "You"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full border border-neutral-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending}
              className="h-10 px-6 bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
