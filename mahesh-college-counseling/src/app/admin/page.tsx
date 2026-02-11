"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/Header";

type Applicant = {
  id: string;
  fullName: string;
  email: string;
  instagram: string | null;
  school: string | null;
  classYear: string;
  gpa: string | null;
  activities: string | null;
  whatMakesUnique: string | null;
  whyMentorship: string | null;
  status: string;
  score: number | null;
  adminNotes: string | null;
  createdAt: string;
};

const STATUSES = ["Applied", "Waitlist", "Accepted", "Rejected", "Paid", "Active"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [cohortFilled, setCohortFilled] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editScore, setEditScore] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<{ id: string; content: string; fromAdmin: boolean; createdAt: string }[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      const res = await fetch("/api/admin/applicants");
      if (res.ok) {
        const data = await res.json();
        setApplicants(data.applicants);
        setCohortFilled(data.cohortFilled || "0/20");
      }
      setLoading(false);
    };
    fetchApplicants();
  }, []);

  const selectApplicant = async (a: Applicant) => {
    setSelected(a.id);
    setEditNotes(a.adminNotes || "");
    setEditScore(a.score?.toString() ?? "");
    setEditStatus(a.status);
    const res = await fetch(`/api/admin/applicants/${a.id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    } else {
      setMessages([]);
    }
    setReplyContent("");
  };

  const sendReply = async () => {
    if (!selected || !replyContent.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/admin/applicants/${selected}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setReplyContent("");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const saveChanges = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applicants/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotes: editNotes,
          score: editScore ? parseInt(editScore, 10) : undefined,
          status: editStatus,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApplicants((prev) =>
          prev.map((a) => (a.id === selected ? updated : a))
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen px-6 pt-24 pb-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-neutral-500">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!session || (session.user as { role?: string }).role !== "admin") {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-6 pt-24">
          <div className="text-center">
            <p className="mb-4">You need admin access.</p>
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </main>
      </>
    );
  }

  const selectedApplicant = applicants.find((a) => a.id === selected);

  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold">Applicants</h1>
              <div className="text-sm font-medium">
                Cohort: <span className="font-semibold">{cohortFilled}</span> filled
              </div>
            </div>
            <div className="space-y-2">
              {applicants.length === 0 ? (
                <p className="text-neutral-500">No applicants yet.</p>
              ) : (
                applicants.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectApplicant(a)}
                    className={`w-full text-left px-4 py-3 border transition-colors ${
                      selected === a.id
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{a.fullName}</div>
                        <div className="text-sm text-neutral-500">
                          {a.email} · Class of {a.classYear}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 ${
                          a.status === "Accepted" || a.status === "Paid" || a.status === "Active"
                            ? "bg-black text-white"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedApplicant && (
            <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
              <div className="border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {selectedApplicant.fullName}
                </h2>
                <div className="space-y-2 text-sm text-neutral-600 mb-6">
                  <p>Email: {selectedApplicant.email}</p>
                  {selectedApplicant.instagram && (
                    <p>Instagram: {selectedApplicant.instagram}</p>
                  )}
                  {selectedApplicant.school && (
                    <p>School: {selectedApplicant.school}</p>
                  )}
                  <p>Class Year: {selectedApplicant.classYear}</p>
                  {selectedApplicant.gpa && <p>GPA: {selectedApplicant.gpa}</p>}
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Activities
                    </label>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplicant.activities || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      What makes you unique?
                    </label>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplicant.whatMakesUnique || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Why mentorship?
                    </label>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplicant.whyMentorship || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={4}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="w-full h-10 bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  {editStatus === "Accepted" && (
                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-xs font-medium text-neutral-500 mb-1">Pay link</p>
                      <p className="text-xs break-all mb-2">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/pay`
                          : "/pay"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Share with applicant. They enter their email to pay.
                      </p>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-medium mb-3">Messages</h3>
                    {messages.length === 0 ? (
                      <p className="text-sm text-neutral-500 mb-4">No messages.</p>
                    ) : (
                      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`text-sm p-2 ${m.fromAdmin ? "bg-neutral-100" : "bg-white"}`}
                          >
                            <span className="font-medium">
                              {m.fromAdmin ? "You" : "Student"}:
                            </span>{" "}
                            {m.content}
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Reply..."
                      rows={2}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm resize-none mb-2"
                    />
                    <button
                      onClick={sendReply}
                      disabled={sendingMessage || !replyContent.trim()}
                      className="w-full h-8 text-sm font-medium border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {sendingMessage ? "Sending..." : "Send reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
