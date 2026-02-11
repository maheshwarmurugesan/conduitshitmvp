"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Overview", icon: "⌂" },
  { href: "/trends", label: "Trends", icon: "📈" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/elog", label: "Shift Log", icon: "📋" },
  { href: "/work-orders", label: "Work Orders", icon: "🔧" },
  { href: "/shift", label: "Shift Handover", icon: "🔄" },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b px-4 py-3 shrink-0"
         style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          Plant Dashboard
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                }}
              >
                <span className="mr-1.5 opacity-80">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3 py-1.5 rounded-md text-sm border transition-colors"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      >
        {theme === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>
    </nav>
  );
}
