"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";

import { getAuthHeaders } from "@/lib/auth";

type WO = {
  id: number;
  external_wo_id?: string;
  alert_id?: number;
  plant_id?: string;
  created_at: string;
  payload_sent?: { asset?: string; description?: string };
};

export default function WorkOrdersPage() {
  const [list, setList] = useState<WO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/work-orders", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        setList(d.work_orders || []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Work orders
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        Work orders created from alerts and pushed to your CMMS. Create new ones from Alerts when you acknowledge an alert.
      </p>

      <DashboardCard title="CMMS work orders">
        {loading ? (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>
            No work orders yet. Create one from <Link href="/alerts" className="underline">Alerts</Link> (open alert → Create Work Order).
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((wo) => (
              <div
                key={wo.id}
                className="p-4 rounded-lg border"
                style={{ background: "var(--bg-canvas)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-sm font-medium" style={{ color: "var(--accent)" }}>
                    #{wo.external_wo_id || wo.id}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {wo.created_at ? new Date(wo.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                  {wo.payload_sent?.asset || "—"}
                </p>
                <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                  {wo.payload_sent?.description || ""}
                </p>
                {wo.alert_id && (
                  <Link href={`/alerts/${wo.alert_id}`} className="text-xs mt-2 inline-block underline" style={{ color: "var(--accent)" }}>
                    View source alert
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Total: {total}</p>
      </DashboardCard>
    </div>
  );
}
