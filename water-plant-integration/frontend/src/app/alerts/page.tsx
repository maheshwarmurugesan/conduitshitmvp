"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import { alarmSeverity } from "@/components/AlarmBanner";

import { getAuthHeaders } from "@/lib/auth";

const SEV_STYLE: Record<string, { bg: string; icon: string; flash?: boolean }> = {
  critical: { bg: "var(--alarm-critical)", icon: "●", flash: true },
  high: { bg: "var(--alarm-high)", icon: "◆" },
  medium: { bg: "var(--alarm-medium)", icon: "▲" },
  low: { bg: "var(--alarm-low)", icon: "○" },
  info: { bg: "var(--text-muted)", icon: "–" },
};

type Alert = {
  id: number;
  asset_name: string;
  issue_type: string;
  severity: string;
  message?: string;
  status: string;
  created_at: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = () => {
    const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    fetch(`/api/alerts${q}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setAlerts(d.alerts || []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [statusFilter]);

  const openCount = alerts.filter((a) => a.status === "open").length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Alerts
      </h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Alerts from your plant&apos;s SCADA thresholds (e.g. pump vibration, chlorine). Create a work order, log only, or dismiss.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {["", "open", "dismissed", "logged_only", "wo_created"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
              style={{
                borderColor: statusFilter === s ? "var(--accent)" : "var(--border)",
                background: statusFilter === s ? "var(--accent)" : "transparent",
                color: statusFilter === s ? "#fff" : "var(--text-secondary)",
              }}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {openCount > 0 && (
        <p className="text-sm" style={{ color: "var(--alarm-critical)" }}>
          {openCount} unacknowledged. Open an alert to acknowledge, log only, or create work order.
        </p>
      )}

      <DashboardCard title="Alarm summary">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>
            No alerts. Run ingestion on Overview to generate from thresholds.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Severity</th>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Time</th>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Equipment</th>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Description</th>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                  <th className="py-2 pr-2 font-medium" style={{ color: "var(--text-muted)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => {
                  const sev = alarmSeverity(a.severity);
                  const style = SEV_STYLE[sev] || SEV_STYLE.info;
                  const time = a.created_at ? new Date(a.created_at).toLocaleTimeString() : "—";
                  return (
                    <tr
                      key={a.id}
                      className={`border-b ${a.status === "open" && sev === "critical" ? "alarm-critical-flash" : ""}`}
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="py-2 pr-2">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold"
                          style={{ background: style.bg }}
                          title={a.severity}
                        >
                          {style.icon}
                        </span>
                      </td>
                      <td className="py-2 pr-2" style={{ color: "var(--text-secondary)" }}>{time}</td>
                      <td className="py-2 pr-2 font-medium" style={{ color: "var(--text-primary)" }}>{a.asset_name}</td>
                      <td className="py-2 pr-2" style={{ color: "var(--text-secondary)" }}>{a.message || a.issue_type}</td>
                      <td className="py-2 pr-2" style={{ color: "var(--text-muted)" }}>{a.status}</td>
                      <td className="py-2 pr-2">
                        {a.status === "open" ? (
                          <Link
                            href={`/alerts/${a.id}`}
                            className="px-2 py-1 rounded text-xs font-medium border transition-colors"
                            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                          >
                            Acknowledge
                          </Link>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Total: {total}
        </p>
      </DashboardCard>
    </div>
  );
}
