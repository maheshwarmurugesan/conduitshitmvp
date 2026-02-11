"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

const CLASS_YEARS = ["2027", "2028", "2029", "2030+"];

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.debug ? `${json.error}: ${json.debug}` : json.error || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-white/20 bg-white/5 text-white placeholder-zinc-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30";
  const labelClass = "block text-sm font-medium mb-2 text-zinc-300";

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen premium-bg flex flex-col items-center justify-center px-6 pt-24">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold mb-4 text-white">Application Received</h1>
            <p className="text-zinc-400 leading-relaxed">
              Applications reviewed manually. Selected students will be contacted.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 text-sm font-medium text-silver hover:text-white transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen premium-bg px-6 pt-24 pb-20">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2 text-white">Apply</h1>
          <p className="text-zinc-400 mb-12">
            Complete the form below. Applications are reviewed manually.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full Name *
              </label>
              <input id="fullName" name="fullName" type="text" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email *
              </label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="instagram" className={labelClass}>
                Instagram
              </label>
              <input id="instagram" name="instagram" type="text" placeholder="@username" className={inputClass} />
            </div>
            <div>
              <label htmlFor="school" className={labelClass}>
                School
              </label>
              <input id="school" name="school" type="text" className={inputClass} />
            </div>
            <div>
              <label htmlFor="classYear" className={labelClass}>
                Class Year *
              </label>
              <select
                id="classYear"
                name="classYear"
                required
                className={`${inputClass} bg-[#0a0a0a]`}
              >
                <option value="">Select...</option>
                {CLASS_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gpa" className={labelClass}>
                GPA
              </label>
              <input id="gpa" name="gpa" type="text" placeholder="e.g. 3.9" className={inputClass} />
            </div>
            <div>
              <label htmlFor="activities" className={labelClass}>
                Activities / Extracurriculars *
              </label>
              <textarea id="activities" name="activities" required rows={4} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label htmlFor="whatMakesUnique" className={labelClass}>
                What makes you unique? *
              </label>
              <textarea id="whatMakesUnique" name="whatMakesUnique" required rows={4} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label htmlFor="whyMentorship" className={labelClass}>
                Why do you want mentorship? *
              </label>
              <textarea id="whyMentorship" name="whyMentorship" required rows={4} className={`${inputClass} resize-none`} />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
