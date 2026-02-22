"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function PayPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicantId, setApplicantId] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      if (data.applicantId) {
        setApplicantId(data.applicantId);
      } else {
        setError("No pending payment found for this email.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!applicantId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Stripe not configured. Add your Stripe keys to .env");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-white/20 bg-white/5 text-white placeholder-zinc-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30";

  return (
    <>
      <Header />
      <main className="min-h-screen premium-bg flex flex-col items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-semibold mb-2 text-white">Pay</h1>
          <p className="text-zinc-400 mb-8">
            $1,000 flat. Enter the email you applied with.
          </p>

          {!applicantId ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Payment verified for {email}. Click below to pay $1,000.
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full h-12 bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? "Redirecting..." : "Pay $1,000"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplicantId(null);
                  setError("");
                }}
                className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Use different email
              </button>
            </div>
          )}

          <p className="mt-8 text-sm text-zinc-400 text-center">
            <Link href="/" className="text-silver hover:text-white transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
