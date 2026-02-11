"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";

import { getAuthHeaders } from "@/lib/auth";

type AlertDetail = {
  id: number;
  asset_name: string;
  issue_type: string;
  severity: string;
  message?: string;
  status: string;
  scada_snapshot?: Record<string, unknown>;
  created_at: string;
};

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"idle" | "wo" | "log" | "dismiss">("idle");
  const [confirm, setConfirm] = useState<"wo" | "log" | "dismiss" | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/alerts/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then(setAlert)
      .finally(() => setLoading(false));
  }, [id]);

  const createWO = () => {
    if (confirm !== "wo") { setConfirm("wo"); return; }
    setAction("wo");
    setConfirm(null);
    fetch("/api/work-orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ alert_id: Number(id) }),
    })
      .then((r) => r.json())
      .then((d) => {
        window.alert(d.message || (d.success ? `Work order ${d.work_order_id} created` : "Failed"));
        if (d.success) router.push("/alerts");
      })
      .finally(() => setAction("idle"));
  };

  const logOnly = () => {
    if (confirm !== "log") { setConfirm("log"); return; }
    setAction("log");
    setConfirm(null);
    fetch(`/api/alerts/${id}/log-only`, { method: "POST", headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        window.alert(d.message || "Logged");
        if (d.success) router.push("/alerts");
      })
      .finally(() => setAction("idle"));
  };

  const dismiss = () => {
    if (confirm !== "dismiss") { setConfirm("dismiss"); return; }
    setAction("dismiss");
    setConfirm(null);
    fetch(`/api/alerts/${id}/dismiss`, { method: "POST", headers: getAuthHeaders() })
      .then(() => router.push("/alerts"))
      .finally(() => setAction("idle"));
  };

  if (loading || !alert) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]" style={{ color: "var(--text-muted)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/alerts" className="underline">Alerts</Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{alert.asset_name}</span>
      </div>

      <DashboardCard title={`${alert.asset_name} — ${alert.issue_type}`}>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{alert.message || "No description."}</p>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Severity: {alert.severity} · Status: {alert.status} · {alert.created_at ? new Date(alert.created_at).toLocaleString() : ""}
        </p>
        {alert.scada_snapshot && (
          <pre className="p-3 rounded text-xs overflow-x-auto mb-4" style={{ background: "var(--bg-canvas)", color: "var(--text-secondary)" }}>
            {JSON.stringify(alert.scada_snapshot, null, 2)}
          </pre>
        )}

        {alert.status === "open" && (
          <div className="flex flex-wrap gap-2">
            {confirm === "wo" ? (
              <div className="flex gap-2 items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Create work order?</span>
                <button type="button" onClick={createWO} disabled={action !== "idle"} className="px-3 py-1.5 rounded text-sm font-medium text-white" style={{ background: "var(--alarm-high)" }}>Yes</button>
                <button type="button" onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: "var(--border)" }}>Cancel</button>
              </div>
            ) : confirm === "log" ? (
              <div className="flex gap-2 items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Log only (no WO)?</span>
                <button type="button" onClick={logOnly} disabled={action !== "idle"} className="px-3 py-1.5 rounded text-sm font-medium border" style={{ borderColor: "var(--border)" }}>Yes</button>
                <button type="button" onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: "var(--border)" }}>Cancel</button>
              </div>
            ) : confirm === "dismiss" ? (
              <div className="flex gap-2 items-center">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Dismiss alert?</span>
                <button type="button" onClick={dismiss} disabled={action !== "idle"} className="px-3 py-1.5 rounded text-sm font-medium text-white" style={{ background: "var(--text-muted)" }}>Yes</button>
                <button type="button" onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded text-sm border" style={{ borderColor: "var(--border)" }}>Cancel</button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => setConfirm("wo")} disabled={action !== "idle"} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ background: "var(--alarm-high)" }}>Create Work Order</button>
                <button type="button" onClick={() => setConfirm("log")} disabled={action !== "idle"} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: "var(--border)" }}>Log only</button>
                <button type="button" onClick={() => setConfirm("dismiss")} disabled={action !== "idle"} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: "var(--border)" }}>Dismiss</button>
              </>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
