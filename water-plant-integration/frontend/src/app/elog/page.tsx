"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

import { getAuthHeaders } from "@/lib/auth";

const ENTRY_TYPES = ["All", "readings_approved", "wo_created", "alert_log_only", "shift_handoff"];

type Entry = {
  id: number;
  entry_type: string;
  body: string;
  created_at: string;
  operator_name?: string;
  operator_id?: string;
};

export default function ELogPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (typeFilter && typeFilter !== "All") params.set("entry_type", typeFilter);
    fetch(`/api/elog/entries?${params}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.body.toLowerCase().includes(search.toLowerCase()) ||
          (e.entry_type || "").toLowerCase().includes(search.toLowerCase()) ||
          (e.operator_name || "").toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Shift log
      </h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Your plant&apos;s electronic logbook: approvals, work orders created, alert log-only, shift handover. Audit trail for compliance.
      </p>

      <DashboardCard title="Log entries">
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="search"
            placeholder="Search log…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm w-48"
            style={{ borderColor: "var(--border)", background: "var(--bg-canvas)", color: "var(--text-primary)" }}
          />
          {ENTRY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t === "All" ? "" : t)}
              className="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
              style={{
                borderColor: typeFilter === (t === "All" ? "" : t) ? "var(--accent)" : "var(--border)",
                background: typeFilter === (t === "All" ? "" : t) ? "var(--accent)" : "transparent",
                color: typeFilter === (t === "All" ? "" : t) ? "#fff" : "var(--text-secondary)",
              }}
            >
              {t === "All" ? "All" : t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>
            No entries. Approve data or create work orders to see entries here.
          </p>
        ) : (
          <ul className="space-y-0 border-l-2 pl-4" style={{ borderColor: "var(--border)" }}>
            {filtered.map((e) => (
              <li key={e.id} className="py-2 text-sm">
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{e.entry_type}</span>
                {" — "}
                <span style={{ color: "var(--text-primary)" }}>{e.body}</span>
                {" "}
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {e.operator_name || e.operator_id || "System"} · {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Showing {filtered.length} of {total}
        </p>
      </DashboardCard>
    </div>
  );
}
