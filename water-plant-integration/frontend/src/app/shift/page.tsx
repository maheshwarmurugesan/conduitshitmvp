"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

import { getAuthHeaders } from "@/lib/auth";

type Summary = {
  operator_id: string;
  operator_name?: string;
  syncs_count: number;
  alerts_handled: number;
  work_orders_created: number;
  time_saved_minutes?: number;
};

export default function ShiftPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOff, setSigningOff] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [notes, setNotes] = useState("Shift complete.");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shift/summary", { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const signOff = () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setSigningOff(true);
    fetch("/api/shift/sign-off", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ final_notes: notes || "Shift complete." }),
    })
      .then((r) => r.json())
      .then((d) => {
        setMessage(d.message || "Signed off.");
        setConfirm(false);
      })
      .finally(() => setSigningOff(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]" style={{ color: "var(--text-muted)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        Shift handover
      </h1>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        Summary of this shift (syncs, alerts handled, work orders). Sign off to close the shift and record handover notes for the next operator.
      </p>

      {summary && (
        <DashboardCard title="Last shift summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="kpi-value" style={{ color: "var(--text-primary)" }}>{summary.syncs_count}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Syncs</p>
            </div>
            <div>
              <p className="kpi-value" style={{ color: "var(--text-primary)" }}>{summary.alerts_handled}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Alerts handled</p>
            </div>
            <div>
              <p className="kpi-value" style={{ color: "var(--text-primary)" }}>{summary.work_orders_created}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Work orders</p>
            </div>
            <div>
              <p className="kpi-value" style={{ color: "var(--status-ok)" }}>~{summary.time_saved_minutes ?? 0} min</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Time saved</p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Operator: {summary.operator_name || summary.operator_id}
          </p>
        </DashboardCard>
      )}

      <DashboardCard title="Sign off">
        {message && <p className="text-sm mb-3" style={{ color: "var(--status-ok)" }}>{message}</p>}
        {!message && (
          <>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Final notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border p-2 text-sm mb-4"
              style={{ borderColor: "var(--border)", background: "var(--bg-canvas)", color: "var(--text-primary)" }}
              placeholder="Handover notes for next shift"
            />
            {confirm ? (
              <div className="p-3 rounded-lg border mb-4" style={{ borderColor: "var(--status-warn)", background: "var(--bg-canvas)" }}>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Confirm sign off?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={signOff}
                    disabled={signingOff}
                    className="px-4 py-2 rounded-md text-sm font-medium text-white"
                    style={{ background: "var(--status-ok)" }}
                  >
                    {signingOff ? "Signing off…" : "Yes, sign off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(false)}
                    className="px-4 py-2 rounded-md text-sm font-medium border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={signOff}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: "var(--status-ok)" }}
              >
                Sign off shift
              </button>
            )}
          </>
        )}
      </DashboardCard>
    </div>
  );
}
