"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white hover:text-silver transition-colors">
          Mahesh College Counseling
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/#what"
            className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:inline"
          >
            What This Is
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:inline"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:inline"
          >
            FAQ
          </Link>
          {status === "authenticated" ? (
            (session?.user as { role?: string })?.role === "admin" ? (
              <Link
                href="/admin"
                className="text-sm font-medium text-silver hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/portal"
                className="text-sm font-medium text-silver hover:text-white transition-colors"
              >
                Portal
              </Link>
            )
          ) : (
            <Link
              href="/apply"
              className="apply-btn inline-flex items-center justify-center h-10 px-6 rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] text-black text-sm font-medium hover:brightness-95 transition-colors"
            >
              Apply Now
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
