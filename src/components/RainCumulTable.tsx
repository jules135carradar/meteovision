"use client";

import { AggregatedDailyForecast } from "@/lib/types";

function formatDayLabel(dateStr: string): string {
  const [yr, mo, da] = dateStr.split("-").map(Number);
  const d = new Date(yr, mo - 1, da);
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "short" });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1) + " " + da;
}

function precipColor(mm: number): string {
  if (mm < 0.5)  return "#bae6fd";
  if (mm < 2)    return "#60a5fa";
  if (mm < 5)    return "#3b82f6";
  if (mm < 10)   return "#2563eb";
  if (mm < 20)   return "#1d4ed8";
  return "#1e40af";
}

export default function RainCumulTable({ daily }: { daily: AggregatedDailyForecast[] }) {
  if (daily.length === 0) return null;

  const total    = daily.reduce((s, d) => s + d.precipitation, 0);
  const maxPrecip = Math.max(...daily.map((d) => d.precipitation), 0.1);
  const rainyDays = daily.filter((d) => d.precipitation > 0.5).length;

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#0891b2,#2563eb,#1d4ed8) border-box",
      boxShadow: "0 4px 20px rgba(37,99,235,0.12)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0e7490 0%, #1d4ed8 100%)",
        padding: "13px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🌧️ Précipitations — 7 jours</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          Total : {total.toFixed(1)} mm
        </span>
      </div>

      {/* Bars */}
      <div style={{ padding: "20px 24px", background: "#fff" }}>
        {daily.map((day, i) => {
          const pct   = (day.precipitation / maxPrecip) * 100;
          const color = precipColor(day.precipitation);
          const label = i === 0 ? "Aujourd'hui" : formatDayLabel(day.date);
          const hasRain = day.precipitation >= 0.05;

          return (
            <div key={day.date} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: i < daily.length - 1 ? 10 : 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", width: 88, flexShrink: 0 }}>
                {label}
              </span>

              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 8, height: 20, overflow: "hidden", position: "relative" }}>
                {hasRain && (
                  <div style={{
                    width: `${Math.max(pct, 2)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${color}, ${color}bb)`,
                    borderRadius: 8,
                  }} />
                )}
              </div>

              <span style={{
                fontSize: 12,
                fontWeight: 700,
                width: 56,
                textAlign: "right",
                flexShrink: 0,
                color: hasRain ? color : "#cbd5e1",
              }}>
                {hasRain ? `${day.precipitation.toFixed(1)} mm` : "—"}
              </span>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1.5px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {rainyDays > 0
              ? `${rainyDays} jour${rainyDays > 1 ? "s" : ""} de pluie significative`
              : "Aucune pluie significative prévue"}
          </span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Cumul 7 jours</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: total > 0.5 ? "#1d4ed8" : "#94a3b8" }}>
              {total.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
