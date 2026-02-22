"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen px-6 py-12 md:py-20 bg-grid">
      <main className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <a
            href="https://maheshwarmurugesan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-dull transition-colors duration-200"
          >
            maheshwarmurugesan.com
          </a>
        </div>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-glow-muted hover:text-[var(--accent)] hover-glow transition-colors mb-8 inline-block"
        >
          ← Back to form
        </Link>
        <h1 className="font-heading text-xl font-bold uppercase tracking-widest text-[var(--foreground)] mb-2">
          Admin
        </h1>
        <p className="font-mono text-sm text-glow-muted tracking-wide mb-6">
          Manage your event and contacts in Partiful.
        </p>
        {process.env.NEXT_PUBLIC_PARTIFUL_EVENT_ID ? (
          <a
            href={`https://partiful.com/e/${process.env.NEXT_PUBLIC_PARTIFUL_EVENT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-sm font-semibold uppercase tracking-widest text-[var(--accent)] border-2 border-[var(--accent)] cyber-chamfer-sm px-6 py-3 transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--background)] hover:shadow-[var(--box-shadow-neon)]"
          >
            Open your Partiful event →
          </a>
        ) : (
          <p className="font-mono text-xs text-glow-muted">
            Set NEXT_PUBLIC_PARTIFUL_EVENT_ID in env to show the event link.
          </p>
        )}
      </main>
    </div>
  );
}
