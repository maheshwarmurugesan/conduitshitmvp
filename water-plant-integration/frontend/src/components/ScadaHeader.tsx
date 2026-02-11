"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import {
  getNotifications,
  getWSUTable,
  getKPIs,
} from "@/lib/mockScadaData";
import { getCurrentUser, getDisplayName, getInitials } from "@/lib/auth";

const table = getWSUTable();
const notifications = getNotifications();
const kpis = getKPIs(table, notifications);

export default function ScadaHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node) && notifOpen) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && menuOpen) setMenuOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [notifOpen, menuOpen]);

  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-4 px-4 py-3 border-b panel-transition"
      style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="p-2 rounded-md hover:bg-white/5 transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Link href="/" className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
        Plant integration
      </Link>

      <div className="flex items-center gap-6 ml-4 sm:ml-6">
        <span className="text-xs hidden sm:inline" style={{ color: "var(--text-muted)" }}>
          {getCurrentUser().plant_id}
        </span>
        <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((o) => !o)}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors relative"
        >
          <span className="text-xl">🔔</span>
          <span className="kpi-value text-red-400">{kpis.alarmCount}</span>
          {notifOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
      </div>

      <div className="flex-1 max-w-xs mx-4 hidden md:block">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border panel-transition"
            style={{
              background: "var(--bg-canvas)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-canvas)" }}
        >
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-violet-600 text-white">
            {getInitials()}
          </span>
          <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-primary)" }}>
            {getDisplayName()}
          </span>
          <span className="text-xs hidden md:inline capitalize" style={{ color: "var(--text-muted)" }}>
            · {getCurrentUser().role}
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-md hover:bg-white/5 transition-colors"
          aria-label="More options"
        >
          <svg className="w-5 h-5" style={{ color: "var(--text-muted)" }} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>

      {notifOpen && (
        <NotificationsPanel onClose={() => setNotifOpen(false)} notifications={notifications} />
      )}
        </div>

      <div ref={menuRef} className="relative">
      {menuOpen && (
        <div
          className="absolute left-4 top-full mt-1 py-2 rounded-lg border shadow-xl panel-transition z-50 min-w-[200px]"
          style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
        >
          <Link href="/" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Overview</Link>
          <Link href="/trends" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Trends</Link>
          <Link href="/alerts" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Alerts</Link>
          <Link href="/elog" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Shift Log</Link>
          <Link href="/work-orders" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Work Orders</Link>
          <Link href="/shift" className="block px-4 py-2 text-sm hover:bg-white/5" style={{ color: "var(--text-primary)" }}>Shift Handover</Link>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
            style={{ color: "var(--text-primary)" }}
          >
            {theme === "dark" ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      )}
      </div>
    </header>
  );
}

function NotificationsPanel({
  onClose,
  notifications,
}: {
  onClose: () => void;
  notifications: { id: string; message: string; time: string; critical: boolean }[];
}) {
  return (
    <div
      className="absolute right-4 top-full mt-1 w-96 max-w-[calc(100vw-2rem)] rounded-lg border shadow-xl panel-transition z-50 max-h-[80vh] flex flex-col"
      style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Notification</span>
        <button
          type="button"
          onClick={onClose}
          className="text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Clear All
        </button>
      </div>
      <div className="overflow-y-auto p-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="px-3 py-2 rounded-md hover:bg-white/5 transition-colors border-b border-transparent"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: n.critical ? "var(--alarm-critical)" : "var(--text-primary)" }}>
              {n.message}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{n.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
