"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth";
import {
  getWSUTable,
  getPressureChartData,
  getConsumptionChartData,
} from "@/lib/mockScadaData";

const PRESSURE_MAX = 5;
const CONSUMPTION_CHART_MAX = 120;
const PAGE_SIZES = [4, 8, 15, 30];
const DEFAULT_PAGE_SIZE = 15;

type SystemStatus = { name: string; connected: boolean; error?: string };
type Reading = { tag: string; value: number; unit?: string; source: string };

export default function OverviewPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [ingesting, setIngesting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const table = useMemo(() => getWSUTable(), []);
  const pressureData = useMemo(() => getPressureChartData(18), []);
  const consumptionData = useMemo(() => getConsumptionChartData(15), []);

  const totalPages = Math.ceil(table.length / pageSize);
  const pageRows = table.slice(page * pageSize, page * pageSize + pageSize);
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, table.length);

  const load = () => {
    const h = getAuthHeaders();
    Promise.all([
      fetch("/api/dashboard/systems", { headers: h }).then((r) => r.json()),
      fetch("/api/dashboard/readings/latest", { headers: h }).then((r) => r.json()),
      fetch("/api/alerts?status=open", { headers: h }).then((r) => r.json()),
    ])
      .then(([sys, read, alertRes]) => {
        setSystems(Array.isArray(sys) ? sys : []);
        setReadings(Array.isArray(read) ? read : []);
        setAlertsCount(alertRes?.total ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const runIngest = async () => {
    setIngesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST", headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      load();
      setMessage(data?.readings_stored ? `Pulled ${data.readings_stored} readings.` : "No new readings.");
      if (data?.new_alerts > 0) setMessage((m) => `${m ?? ""} ${data.new_alerts} new alert(s).`.trim());
    } catch {
      setMessage("Pull failed. Is the backend running?");
    } finally {
      setIngesting(false);
    }
  };

  const approveAndSync = async () => {
    setApproving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/morning-review/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({}),
      });
      const d = await res.json().catch(() => ({}));
      setMessage(res.ok ? (d?.message ?? "Synced to WIMS + E-Log.") : (d?.detail ?? "Failed."));
      if (res.ok) load();
    } catch {
      setMessage("Request failed.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="w-full">
      <h1
        className="text-xl md:text-2xl font-bold text-center mb-2 title-glow"
        style={{ color: "var(--text-primary)" }}
      >
        Plant integration dashboard
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        One screen for SCADA, WIMS, CMMS, and E-Logs. Review once, approve, and data syncs everywhere.
      </p>

      <div
        className="rounded-xl border p-4 mb-6 panel-transition"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Systems & actions
        </h2>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {systems.map((s) => (
            <span key={s.name} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: s.connected ? "var(--status-ok)" : "var(--alarm-high)" }} />
              {s.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runIngest}
            disabled={ingesting}
            className="px-4 py-2 rounded-lg text-sm font-medium border panel-transition disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            {ingesting ? "Pulling…" : "Pull latest from SCADA"}
          </button>
          <button
            type="button"
            onClick={approveAndSync}
            disabled={approving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white panel-transition disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {approving ? "Syncing…" : "Approve & sync to WIMS + E-Log"}
          </button>
          {alertsCount > 0 && (
            <Link
              href="/alerts"
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: "var(--alarm-critical)", color: "var(--alarm-critical)" }}
            >
              {alertsCount} open alert{alertsCount !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
        {message && <p className="text-sm mt-3" style={{ color: "var(--status-ok)" }}>{message}</p>}
        {readings.length > 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Latest readings: {readings.slice(0, 5).map((r) => `${r.tag} ${r.value}${r.unit ?? ""}`).join(", ")}
          </p>
        )}
      </div>

      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
        Process overview
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PressureChart data={pressureData} />
        <ConsumptionChart data={consumptionData} />
      </div>

      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
        Process data by unit
      </h2>
      <div
        className="rounded-xl border overflow-hidden panel-transition"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor: "var(--border)" }} className="border-b">
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-muted)" }}>Unit</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-muted)" }}>Entry Pressure</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-muted)" }}>Exit Pressure</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-muted)" }}>Daily Consumption</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b panel-transition hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2.5 px-4 font-medium" style={{ color: "var(--text-primary)" }}>{row.name}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      {row.entryTrend === "up" && <span className="text-red-400 text-xs">↑</span>}
                      {row.entryTrend === "down" && <span className="text-emerald-400 text-xs">↓</span>}
                      <span style={{ color: row.entryOverLimit ? "var(--alarm-critical)" : "var(--text-primary)" }}>
                        {row.entryPressure >= 0 ? "+" : ""}{row.entryPressure.toFixed(1)}
                      </span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      {row.exitTrend === "up" && <span className="text-red-400 text-xs">↑</span>}
                      {row.exitTrend === "down" && <span className="text-emerald-400 text-xs">↓</span>}
                      <span style={{ color: row.exitOverLimit ? "var(--alarm-critical)" : "var(--text-primary)" }}>
                        {row.exitPressure >= 0 ? "+" : ""}{row.exitPressure.toFixed(1)}
                      </span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span style={{ color: row.consumptionOverLimit ? "var(--alarm-critical)" : "var(--text-primary)" }}>
                      +{row.dailyConsumption.toFixed(0)} m³
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{from}–{to} from {table.length}</span>
          <div className="flex items-center gap-4">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="text-sm rounded border px-2 py-1 bg-transparent"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} items / page</option>)}
            </select>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded hover:bg-white/10 disabled:opacity-40" style={{ color: "var(--text-primary)" }} aria-label="Previous">←</button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded hover:bg-white/10 disabled:opacity-40" style={{ color: "var(--text-primary)" }} aria-label="Next">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PressureChart({ data }: { data: { label: string; value: number; overLimit: boolean }[] }) {
  return (
    <div className="rounded-xl border p-5 panel-transition" style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Pressure</h3>
      <div className="flex items-end justify-between gap-1 h-48">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center min-w-0">
            {d.overLimit && <span className="text-red-500 text-xs mb-1" title="Exceeds limit">!</span>}
            <div className="w-full rounded-t bar-transition bar-in max-w-[28px] mx-auto" style={{ height: `${(d.value / PRESSURE_MAX) * 100}%`, minHeight: "4px", background: d.overLimit ? "var(--chart-alarm)" : "var(--chart-normal)" }} />
            <span className="text-xs mt-2 truncate w-full text-center" style={{ color: "var(--text-muted)" }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <span className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><span className="w-3 h-3 rounded-sm bg-violet-500" /> Normal</span>
        <span className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}><span className="w-3 h-3 rounded-sm bg-red-500" /> Over limit</span>
      </div>
    </div>
  );
}

function ConsumptionChart({ data }: { data: { label: string; value: number; overLimit: boolean }[] }) {
  return (
    <div className="rounded-xl border p-5 panel-transition" style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Water consumption</h3>
      <div className="flex items-end justify-between gap-1 h-48">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center min-w-0">
            {d.overLimit && <span className="text-red-500 text-xs mb-1" title="Above threshold">!</span>}
            <div className="w-full rounded-t bar-transition bar-in max-w-[28px] mx-auto" style={{ height: `${(d.value / CONSUMPTION_CHART_MAX) * 100}%`, minHeight: "4px", background: d.overLimit ? "var(--chart-alarm)" : "var(--chart-normal)" }} />
            <span className="text-xs mt-2 truncate w-full text-center" style={{ color: "var(--text-muted)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
