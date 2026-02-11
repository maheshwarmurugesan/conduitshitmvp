/**
 * Realistic mock data for wastewater/water SCADA dashboard.
 * Deterministic seeded so charts and tables look like a live plant with trends and alarms.
 */

const PRESSURE_MAX = 5;
const CONSUMPTION_MAX = 120; // m³
const PRESSURE_LIMIT = 4.5;
const CONSUMPTION_LIMIT = 95;

function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export type WSURow = {
  id: string;
  name: string;
  entryPressure: number;
  exitPressure: number;
  dailyConsumption: number; // m³
  entryTrend: "up" | "down" | "flat";
  exitTrend: "up" | "down" | "flat";
  entryOverLimit: boolean;
  exitOverLimit: boolean;
  consumptionOverLimit: boolean;
};

export type NotificationItem = {
  id: string;
  message: string;
  time: string;
  date: string;
  critical: boolean;
};

/** Generate 185 WSU rows with realistic pressures and consumption; some over limit */
export function getWSUTable(seed = 42): WSURow[] {
  const r = seeded(seed);
  const rows: WSURow[] = [];
  const names = ["Reef", "M247", "M348", "M502", "North", "South", "East", "West", "Pump 1", "Pump 2", "Pump 3", "Influent A", "Effluent B", "Tank T1", "Tank T2"];
  for (let i = 0; i < 185; i++) {
    const name = i < 15 ? `WSU M${i + 1} ${names[i % names.length]}` : `WSU M${i + 1}`;
    const entryPressure = Math.round((2 + r() * 2.8) * 100) / 100;
    const exitPressure = Math.round((-0.5 + r() * 1.2) * 100) / 100;
    const dailyConsumption = Math.round((30 + r() * 85) * 10) / 10;
    const entryOverLimit = entryPressure >= PRESSURE_LIMIT;
    const exitOverLimit = Math.abs(exitPressure) >= 0.4 && r() > 0.7;
    const consumptionOverLimit = dailyConsumption >= CONSUMPTION_LIMIT;
    rows.push({
      id: `wsu-${i}`,
      name,
      entryPressure,
      exitPressure,
      dailyConsumption,
      entryTrend: r() > 0.6 ? "up" : r() > 0.3 ? "down" : "flat",
      exitTrend: r() > 0.6 ? "up" : r() > 0.3 ? "down" : "flat",
      entryOverLimit,
      exitOverLimit,
      consumptionOverLimit,
    });
  }
  return rows;
}

/** Pressure chart: one bar per WSU (e.g. 18 units), value 0–5, some red (WSU24,29,30,31,38) */
export function getPressureChartData(count = 18, seed = 12): { label: string; value: number; overLimit: boolean }[] {
  const r = seeded(seed);
  const redIndices = new Set([3, 8, 9, 10, 17]); // WSU24, WSU29, WSU30, WSU31, WSU38
  const out: { label: string; value: number; overLimit: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const value = Math.round((1.5 + r() * 3.2) * 100) / 100;
    const overLimit = redIndices.has(i) || value >= PRESSURE_LIMIT;
    out.push({ label: `WSU${21 + i}`, value, overLimit });
  }
  return out;
}

/** Water consumption chart: bars, WSU10 red */
export function getConsumptionChartData(count = 15, seed = 8): { label: string; value: number; overLimit: boolean }[] {
  const r = seeded(seed);
  const out: { label: string; value: number; overLimit: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const value = Math.round((40 + r() * 70) * 10) / 10;
    const overLimit = i === 9 || value >= CONSUMPTION_LIMIT; // WSU10 prominent red
    out.push({ label: `WSU${i + 1}`, value, overLimit });
  }
  return out;
}

/** Notifications with realistic messages and timestamps */
export function getNotifications(seed = 99): NotificationItem[] {
  const r = seeded(seed);
  const messages = [
    "WSU M1 entry pressure exceeds the limit.",
    "WSU M24 exit pressure out of range.",
    "WSU M10 daily consumption above threshold.",
    "WSU M29 entry pressure exceeds the limit.",
    "Pump 3 vibration high.",
    "Chlorine residual low at Effluent B.",
    "WSU M31 entry pressure exceeds the limit.",
    "WSU M38 exit pressure out of range.",
  ];
  const notifs: NotificationItem[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now);
    d.setHours(d.getHours() - i * 2);
    d.setMinutes(d.getMinutes() - (i * 17) % 60);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".");
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const today = d.toDateString() === now.toDateString();
    notifs.push({
      id: `n-${i}`,
      message: messages[i % messages.length],
      time: today ? `Today ${time}` : `${date} ${time}`,
      date,
      critical: r() > 0.5,
    });
  }
  return notifs;
}

/** KPI: total flow / units (e.g. 585), alarm count (e.g. 19) */
export function getKPIs(table: WSURow[], notifications: NotificationItem[]) {
  const alarmCount = table.filter((r) => r.entryOverLimit || r.exitOverLimit || r.consumptionOverLimit).length;
  const totalFlow = table.reduce((s, r) => s + r.dailyConsumption, 0);
  return {
    totalUnits: 585,
    alarmCount: Math.min(99, alarmCount + notifications.length),
  };
}
