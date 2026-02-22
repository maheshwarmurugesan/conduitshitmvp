"use client";

import Link from "next/link";
import { Header } from "@/components/Header";

export default function PortalBookingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link href="/portal" className="text-sm text-neutral-600 hover:text-black mb-6 inline-block">
            ← Portal
          </Link>
          <h1 className="text-2xl font-semibold mb-2">Book a call</h1>
          <p className="text-neutral-600 mb-8">
            Schedule 1:1 sessions with Mahesh. You can text your personal number or use the link below to book.
          </p>
          <div className="border border-neutral-200 p-6">
            <p className="text-sm text-neutral-600">
              Add your Calendly link in the <code className="bg-neutral-100 px-1">.env</code> as <code className="bg-neutral-100 px-1">CALENDLY_LINK</code> to enable booking. Or share your personal number for direct scheduling.
            </p>
            {(typeof process.env.NEXT_PUBLIC_CALENDLY_LINK === "string" && process.env.NEXT_PUBLIC_CALENDLY_LINK) ? (
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 h-10 px-6 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors leading-10"
              >
                Book now
              </a>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">
                Calendly link not configured.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
