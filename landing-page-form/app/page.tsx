"use client";

import { useState, useEffect, useRef } from "react";

const inputWrapperClass = "relative";
const inputClass =
  "w-full bg-[var(--input)] border border-[var(--border)] text-[var(--accent)] font-mono text-sm tracking-wide py-3 pl-10 pr-4 transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--box-shadow-neon)] cyber-chamfer-sm placeholder-glow";
const textareaClass =
  "w-full bg-[var(--input)] border border-[var(--border)] text-[var(--accent)] font-mono text-sm tracking-wide py-3 pl-10 pr-4 transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--box-shadow-neon)] cyber-chamfer-sm placeholder-glow resize-none";
const labelClass =
  "block text-xs font-mono uppercase tracking-[0.2em] text-glow-muted mb-2";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showWhatBuilding, setShowWhatBuilding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollRefs = useRef<HTMLElement[]>([]);
  const [visible, setVisible] = useState<Record<number, boolean>>({ 0: true, 1: true });

  useEffect(() => {
    if (!mounted) return;
    const refs = scrollRefs.current;
    const observers: IntersectionObserver[] = [];
    refs.forEach((el, i) => {
      if (!el) return;
      const ob = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible((v) => ({ ...v, [i]: true }));
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
      );
      ob.observe(el);
      observers.push(ob);
    });
    return () => observers.forEach((ob) => ob.disconnect());
  }, [mounted]);

  const supportedByNames = [
    "Z Fellows",
    "Y Combinator",
    "Susa Ventures",
    "Andreessen Horowitz",
    "Verci",
    "LvlUp Ventures",
    "Detroit Venture Partners",
  ];

  const supportedByGlowStyles: { color: string; glow: string }[] = [
    { color: "#7dd3fc", glow: "0 0 20px #7dd3fc, 0 0 40px #38bdf8, 0 0 60px #0ea5e9" },
    { color: "#fb923c", glow: "0 0 20px #fb923c, 0 0 40px #f97316, 0 0 60px #ea580c" },
    { color: "#4ade80", glow: "0 0 20px #4ade80, 0 0 40px #22c55e, 0 0 60px #16a34a" },
    { color: "#c2414a", glow: "0 0 20px #c2414a, 0 0 40px #b91c1c, 0 0 60px #991b1b" },
    { color: "#2dd4bf", glow: "0 0 20px #2dd4bf, 0 0 40px #14b8a6, 0 0 60px #0d9488" },
    { color: "#e879f9", glow: "0 0 20px #e879f9, 0 0 40px #d946ef, 0 0 60px #c026d3" },
    { color: "#f87171", glow: "0 0 20px #f87171, 0 0 40px #ef4444, 0 0 60px #dc2626" },
  ];

  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const name = supportedByNames[typewriterIndex];
    const typeSpeed = isDeleting ? 45 : 90;
    const pauseAtEnd = 2200;
    const pauseAfterDelete = 600;

    if (!isDeleting && typewriterText === name) {
      const t = setTimeout(() => setIsDeleting(true), pauseAtEnd);
      return () => clearTimeout(t);
    }
    if (isDeleting && typewriterText === "") {
      const t = setTimeout(() => {
        setIsDeleting(false);
        setTypewriterIndex((i) => (i + 1) % supportedByNames.length);
      }, pauseAfterDelete);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setTypewriterText((prev) =>
        isDeleting ? name.slice(0, prev.length - 1) : name.slice(0, prev.length + 1)
      );
    }, typeSpeed);
    return () => clearTimeout(t);
  }, [mounted, typewriterIndex, typewriterText, isDeleting]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const partifulEventId = process.env.NEXT_PUBLIC_PARTIFUL_EVENT_ID;
  const partifulUrl = partifulEventId
    ? `https://partiful.com/e/${partifulEventId}`
    : null;

  const stagger = (i: number) => ({ animationDelay: `${i * 80}ms` });

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-lg text-center space-y-6">
          <h1
            className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-widest text-[var(--accent)] animate-fade-up cyber-glitch glitch-on-hover chromatic-text-strong"
            style={stagger(0)}
          >
            Thanks. We&apos;ll be in touch.
          </h1>
          <p
            className="text-glow-muted leading-relaxed font-mono text-sm tracking-wide animate-fade-up hover-glow transition-all duration-200"
            style={stagger(1)}
          >
            Now that we can make intros and invite you to future events, it&apos;s
            easier to stay in touch if everyone is in one Partiful. Whenever
            there&apos;s a future event, we&apos;ll send you a text blast.
          </p>
          <p
            className="text-glow-muted text-sm font-mono animate-fade-up hover-glow transition-all duration-200"
            style={stagger(2)}
          >
            Tap the link below to join the Partiful — then you&apos;ll get
            those updates. Make sure you press &quot;Going&quot; when you get there.
          </p>
          {partifulUrl ? (
            <div
              className="animate-fade-up pt-2 flex flex-col items-center gap-3"
              style={stagger(3)}
            >
              <p className="font-mono text-sm tracking-wide text-glow-muted">
                Take me to{" "}
                <a
                  href={partifulUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-semibold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)] px-4 py-2 cyber-chamfer-sm transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--background)] hover:shadow-[var(--box-shadow-neon)] text-glow"
                >
                  Partiful
                </a>
              </p>
              <a
                href="/"
                className="font-mono text-xs uppercase tracking-widest text-glow-muted hover:text-[var(--accent)] hover-glow transition-colors"
              >
                ← Back to main page
              </a>
            </div>
          ) : (
            <p className="text-glow-muted text-sm font-mono">
              (Partiful link not configured. Check with the host.)
            </p>
          )}
        </div>
      </div>
    );
  }

  const setScrollRef = (i: number) => (el: HTMLElement | null) => {
    if (el) scrollRefs.current[i] = el;
  };

  return (
    <div className="min-h-screen px-6 py-12 md:py-20">
      <main className="max-w-xl mx-auto">
        {/* Personal branding */}
        <div className="text-center mb-12">
          <a
            href="https://maheshwarmurugesan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-dull transition-all duration-200"
          >
            maheshwarmurugesan.com
          </a>
        </div>

        <h1
          className={`font-heading text-4xl md:text-5xl font-bold uppercase tracking-widest text-[var(--foreground)] mb-3 transition-opacity duration-500 text-glow text-center ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={mounted ? { animation: "fadeUp 0.6s ease-out" } : undefined}
        >
          <span className="block">Be in</span>
          <span className="block">curated groups</span>
        </h1>
        <p
          className={`font-mono text-sm text-glow-muted tracking-wide mb-10 transition-opacity duration-500 delay-100 hover-glow text-center ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={mounted ? { animation: "fadeUp 0.5s ease-out 0.1s both" } : undefined}
        >
          Enter your details below. You&apos;ll be connected to startups, angels,
          and VCs. This automates future event outreach and we&apos;ll give
          preference to those who sign up here.
        </p>

        {/* Header reverted; only the company typewriter line is in the spacer */}
        <section
          ref={setScrollRef(0)}
          className={`animate-on-scroll text-center ${visible[0] ? "visible" : ""}`}
        >
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-glow-muted mb-6 hover-glow transition-all duration-200">
            Previous events supported by
          </h2>
        </section>
        <div className="min-h-[6rem] flex flex-col justify-center">
          <p className="font-mono text-sm md:text-base tracking-wide min-h-[1.5em] flex items-center justify-center gap-0.5">
            <span
              className="inline-block font-semibold transition-colors duration-300"
              style={{
                color: supportedByGlowStyles[typewriterIndex].color,
                textShadow: supportedByGlowStyles[typewriterIndex].glow,
              }}
            >
              {typewriterText}
            </span>
            <span
              className="inline-block w-0.5 h-4 cursor-blink transition-colors duration-300"
              style={{
                backgroundColor: supportedByGlowStyles[typewriterIndex].color,
                boxShadow: supportedByGlowStyles[typewriterIndex].glow,
              }}
              aria-hidden
            />
          </p>
        </div>

        <div
          ref={setScrollRef(1)}
          className={`animate-on-scroll rounded-sm py-6 px-4 ${visible[1] ? "visible" : ""}`}
        >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First Name *
              </label>
              <div className={inputWrapperClass}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-mono text-sm z-10">
                  &gt;
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last Name *
              </label>
              <div className={inputWrapperClass}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-mono text-sm z-10">
                  &gt;
                </span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="linkedin" className={labelClass}>
              LinkedIn URL *
            </label>
            <div className={inputWrapperClass}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-mono text-sm z-10">
                &gt;
              </span>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                required
                placeholder="https://linkedin.com/in/username"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email *
            </label>
            <div className={inputWrapperClass}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-mono text-sm z-10">
                &gt;
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number *
            </label>
            <div className={inputWrapperClass}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] font-mono text-sm z-10">
                &gt;
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+1 234 567 8900"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="intro" className={labelClass}>
              Short intro (1–2 sentences) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-4 text-[var(--accent)] font-mono text-sm z-10">
                &gt;
              </span>
              <textarea
                id="intro"
                name="intro"
                required
                rows={3}
                placeholder="A bit about you and what you're interested in..."
                className={textareaClass}
              />
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className={labelClass}>Are you building something? *</span>
            <div className="flex gap-6 sm:gap-8 mt-2 justify-center flex-wrap">
              <label className="flex items-center gap-2 text-glow-muted font-mono text-sm cursor-pointer hover:text-[var(--accent)] hover-glow transition-all duration-200">
                <input
                  type="radio"
                  name="isBuilding"
                  value="yes"
                  required
                  checked={showWhatBuilding}
                  onChange={() => setShowWhatBuilding(true)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-glow-muted font-mono text-sm cursor-pointer hover:text-[var(--accent)] hover-glow transition-all duration-200">
                <input
                  type="radio"
                  name="isBuilding"
                  value="no"
                  onChange={() => setShowWhatBuilding(false)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                No
              </label>
            </div>
          </div>

          {showWhatBuilding && (
            <div>
              <label htmlFor="whatBuilding" className={labelClass}>
                What are you building?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-4 text-[var(--accent)] font-mono text-sm z-10">
                  &gt;
                </span>
                <textarea
                  id="whatBuilding"
                  name="whatBuilding"
                  rows={2}
                  placeholder="Brief description..."
                  className={textareaClass}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm font-mono text-[var(--destructive)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 font-mono text-sm font-semibold uppercase tracking-widest bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] cyber-chamfer-sm flex items-center justify-center transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--background)] hover:shadow-[var(--box-shadow-neon)] glitch-on-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--accent)] disabled:hover:shadow-none"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>

          <div className="pt-6 sm:pt-8 mt-4 sm:mt-6 px-1 sm:px-0">
            {partifulUrl ? (
              <a
                href={partifulUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full min-h-12 py-3 px-4 font-mono text-sm font-semibold uppercase tracking-widest bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] cyber-chamfer-sm flex items-center justify-center transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--background)] hover:shadow-[var(--box-shadow-neon)] hover-float-slow text-glow text-center"
              >
                Join Partiful for text blast reminders →
              </a>
            ) : (
              <span className="font-mono text-xs uppercase tracking-widest text-glow-muted block text-center">
                Join Partiful for text blast reminders — set NEXT_PUBLIC_PARTIFUL_EVENT_ID in .env to enable
              </span>
            )}
          </div>
        </form>
        </div>
      </main>
    </div>
  );
}
