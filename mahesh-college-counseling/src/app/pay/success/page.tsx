"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function PaySuccessPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen premium-bg flex flex-col items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-4 text-white">Payment received</h1>
          <p className="text-zinc-400 mb-8">
            Thank you. You now have portal access. Check your email for login credentials.
          </p>
          <Link
            href="/login"
            className="inline-block h-12 px-8 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors leading-[48px]"
          >
            Sign in to portal
          </Link>
        </div>
      </main>
    </>
  );
}
