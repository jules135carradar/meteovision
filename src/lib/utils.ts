import { createHash } from "crypto";

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip + process.env.NEXT_PUBLIC_SUPABASE_URL).digest("hex");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTemp(temp: number | null, unit = "°C"): string {
  if (temp === null) return "—";
  return `${Math.round(temp)}${unit}`;
}

export function formatWind(kmh: number | null): string {
  if (kmh === null) return "—";
  return `${Math.round(kmh)} km/h`;
}

export function formatHumidity(pct: number | null): string {
  if (pct === null) return "—";
  return `${Math.round(pct)}%`;
}

export function formatPrecipitation(mm: number | null): string {
  if (mm === null) return "—";
  return `${mm.toFixed(1)} mm`;
}

export function formatPressure(hpa: number | null): string {
  if (hpa === null) return "—";
  return `${Math.round(hpa)} hPa`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function weightedMean(
  items: { value: number; weight: number }[]
): number | null {
  const valid = items.filter((i) => !isNaN(i.value) && isFinite(i.value));
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((s, i) => s + i.weight, 0);
  if (totalWeight === 0) return null;
  return valid.reduce((s, i) => s + i.value * i.weight, 0) / totalWeight;
}

export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
