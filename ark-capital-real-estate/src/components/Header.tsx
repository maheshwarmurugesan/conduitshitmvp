"use client";

import { useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#strategy", label: "Strategy" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/team", label: "Team" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b-2 border-[var(--foreground)] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <Logo variant="light" width={340} height={80} className="h-[4.25rem] md:h-[5rem]" />
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-200 text-[15px]"
            >
              {label}
            </a>
          ))}
          <a
            href="/#contact"
            className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-sm font-medium text-[15px] hover:bg-[var(--accent-hover)] transition-colors duration-200"
          >
            Call Now
          </a>
        </nav>
        <button
          type="button"
          className="md:hidden p-2.5 -mr-1 text-[var(--foreground)] rounded-md hover:bg-[var(--foreground)]/5 transition-colors duration-200"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg
            className="w-6 h-6 transition-transform duration-300 ease-out"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Premier navy dropdown — navy bg, white text */}
      <div
        className="md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
        style={{
          maxHeight: open ? "480px" : "0",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        <nav
          className="shadow-2xl border-t border-white/10 pb-6"
          style={{ backgroundColor: "#0e1f35" }}
          aria-label="Mobile menu"
        >
          <div className="px-6 pt-5 flex flex-col gap-0.5">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="font-serif text-[15px] tracking-[0.02em] py-3.5 px-1 rounded-md transition-colors duration-200 text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10">
<a
            href="/#contact"
            className="font-serif text-[15px] tracking-[0.02em] block w-full text-center py-3.5 rounded-sm font-medium transition-all duration-200 bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50"
            onClick={() => setOpen(false)}
          >
            Call Now
          </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
