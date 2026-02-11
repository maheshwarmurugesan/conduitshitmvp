"use client";

import Link from "next/link";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

const severityStyle: Record<Severity, { bg: string; icon: string; flash?: boolean }> = {
  critical: { bg: "var(--alarm-critical)", icon: "🔴", flash: true },
  high: { bg: "var(--alarm-high)", icon: "🟠" },
  medium: { bg: "var(--alarm-medium)", icon: "🟡" },
  low: { bg: "var(--alarm-low)", icon: "🔵" },
  info: { bg: "var(--text-muted)", icon: "ℹ️" },
};

interface AlarmBannerProps {
  count: number;
  topAlarm?: { id: number; asset_name: string; message?: string; severity: string };
}

export function alarmSeverity(s: string): Severity {
  const v = (s || "").toLowerCase();
  if (v === "critical") return "critical";
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  if (v === "low") return "low";
  return "info";
}

export default function AlarmBanner({ count, topAlarm }: AlarmBannerProps) {
  if (count === 0) return null;
  const sev = topAlarm ? alarmSeverity(topAlarm.severity) : "medium";
  const { bg, icon, flash } = severityStyle[sev];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg ${flash ? "alarm-critical-flash" : ""}`}
      style={{ background: bg, color: "#fff" }}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-semibold">
        {count} active alarm{count !== 1 ? "s" : ""}
      </span>
      {topAlarm && (
        <span className="truncate">
          — {topAlarm.asset_name}: {topAlarm.message || topAlarm.asset_name}
        </span>
      )}
      <Link
        href="/alerts"
        className="ml-auto px-3 py-1 rounded text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
      >
        View all
      </Link>
    </div>
  );
}
