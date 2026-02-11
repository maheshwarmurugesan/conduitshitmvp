interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ title, children, className = "" }: DashboardCardProps) {
  return (
    <section
      className={`rounded-lg border p-4 ${className}`}
      style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
