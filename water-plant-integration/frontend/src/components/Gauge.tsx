"use client";

interface GaugeProps {
  value: number;
  max: number;
  unit: string;
  label: string;
  low?: number;
  high?: number;
  className?: string;
}

export default function Gauge({ value, max, unit, label, low = 0, high = max, className = "" }: GaugeProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const isWarn = value >= high || value <= low;
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: isWarn ? "var(--status-warn)" : "var(--status-ok)",
          }}
        />
      </div>
      <p className="kpi-value mt-1" style={{ color: "var(--text-primary)" }}>
        {value} <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>{unit}</span>
      </p>
    </div>
  );
}
