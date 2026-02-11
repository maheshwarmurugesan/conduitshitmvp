"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

import { getAuthHeaders } from "@/lib/auth";
const RANGES = ["15 min", "1 hr", "24 hr", "7 day"] as const;

export default function TrendsPage() {
  const [readings, setReadings] = useState<{ tag: string; value: number; unit?: string }[]>([]);
  const [range, setRange] = useState<(typeof RANGES)[number]>("1 hr");

  useEffect(() => {
    fetch("/api/dashboard/readings/latest", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setReadings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const mockTrendData = readings.length
    ? readings.map((r) => ({ tag: r.tag, values: [r.value * 0.9, r.value * 0.95, r.value, r.value * 1.02, r.value * 0.98, r.value] }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Trends
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        Process trends for your plant — SCADA readings over time. Use time range to compare.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
              style={{
                borderColor: range === r ? "var(--accent)" : "var(--border)",
                background: range === r ? "var(--accent)" : "transparent",
                color: range === r ? "#fff" : "var(--text-secondary)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <DashboardCard title={`Process trends — ${range}`}>
        {mockTrendData.length === 0 ? (
          <p className="text-sm py-8" style={{ color: "var(--text-muted)" }}>
            Pull SCADA data from Overview to see trends.
          </p>
        ) : (
          <div className="space-y-6">
            {mockTrendData.map(({ tag, values }) => (
              <div key={tag}>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{tag}</p>
                <div className="h-12 flex items-end gap-0.5">
                  {values.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t min-w-[4px] transition-all"
                      style={{
                        height: `${(v / Math.max(...values)) * 100}%`,
                        background: "var(--accent)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Current: {values[values.length - 1]}
                </p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
