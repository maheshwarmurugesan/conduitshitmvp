"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function PortalPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<{
    uploadedEssay: boolean;
    uploadedResume: boolean;
    bookedCall: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchOnboarding = async () => {
      const res = await fetch("/api/portal/onboarding");
      if (res.ok) {
        const data = await res.json();
        setOnboarding(data);
      }
      setLoading(false);
    };
    if (session) fetchOnboarding();
  }, [session]);

  if (status === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen px-6 pt-24 pb-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-neutral-500">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-6 pt-24">
          <div className="text-center">
            <p className="mb-4">Sign in to access the portal.</p>
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </main>
      </>
    );
  }

  const checklist = onboarding
    ? [
        { label: "Upload essay draft", done: onboarding.uploadedEssay },
        { label: "Upload resume", done: onboarding.uploadedResume },
        { label: "Book first call", done: onboarding.bookedCall },
      ]
    : [];

  const completed = checklist.filter((c) => c.done).length;
  const total = checklist.length;

  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Portal</h1>
          <p className="text-neutral-600 mb-12">
            Welcome back, {(session.user as { name?: string }).name || session.user?.email}.
          </p>

          {loading ? (
            <p className="text-neutral-500">Loading checklist...</p>
          ) : (
            <>
              <div className="mb-12">
                <h2 className="text-lg font-medium mb-4">Onboarding</h2>
                <div className="space-y-3">
                  {checklist.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 ${
                        item.done ? "text-neutral-500" : ""
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-sm ${
                          item.done ? "bg-black text-white" : "border border-neutral-300"
                        }`}
                      >
                        {item.done ? "✓" : ""}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  {completed}/{total} complete
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Link
                  href="/portal/files"
                  className="block p-6 border border-neutral-200 hover:border-black transition-colors"
                >
                  <h3 className="font-medium mb-1">File uploads</h3>
                  <p className="text-sm text-neutral-600">
                    Essays, resume, supplements
                  </p>
                </Link>
                <Link
                  href="/portal/booking"
                  className="block p-6 border border-neutral-200 hover:border-black transition-colors"
                >
                  <h3 className="font-medium mb-1">Book a call</h3>
                  <p className="text-sm text-neutral-600">
                    Schedule 1:1 sessions
                  </p>
                </Link>
                <Link
                  href="/portal/messages"
                  className="block p-6 border border-neutral-200 hover:border-black transition-colors"
                >
                  <h3 className="font-medium mb-1">Messages</h3>
                  <p className="text-sm text-neutral-600">
                    Contact Mahesh
                  </p>
                </Link>
                <Link
                  href="/portal/resources"
                  className="block p-6 border border-neutral-200 hover:border-black transition-colors"
                >
                  <h3 className="font-medium mb-1">Resources</h3>
                  <p className="text-sm text-neutral-600">
                    Guides and templates
                  </p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
