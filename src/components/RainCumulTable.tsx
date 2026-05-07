"use client";

import { AggregatedDailyForecast } from "@/lib/types";

function formatDayLabel(dateStr: string, isToday = false): string {
  if (isToday) return "Aujourd'hui";
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

interface PrecipDay {
  date: string;
  precipitation: number;
}

function PrecipBar({ day, maxPrecip, isToday = false, isHistorical = false }: {
  day: PrecipDay;
  maxPrecip: number;
  isToday?: boolean;
  isHistorical?: boolean;
}) {
  const pct     = maxPrecip > 0 ? (day.precipitation / maxPrecip) * 100 : 0;
  const hasRain = day.precipitation >= 1;
  const color   = precipColor(day.precipitation);
  const label   = formatDayLabel(day.date, isToday);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: isToday ? "#1d4ed8" : isHistorical ? "#64748b" : "#475569",
        width: 88,
        flexShrink: 0,
      }}>
        {label}
      </span>

      <div style={{
        flex: 1,
        background: isHistorical ? "#f1f5f9" : "#e0f2fe",
        borderRadius: 8,
        height: 20,
        overflow: "hidden",
      }}>
        {hasRain && (
          <div style={{
            width: `${Math.max(pct, 2)}%`,
            height: "100%",
            background: isHistorical
              ? `linear-gradient(90deg, ${color}99, ${color}66)`
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 8,
          }} />
        )}
      </div>

      <span style={{
        fontSize: 12,
        fontWeight: 700,
        width: 58,
        textAlign: "right",
        flexShrink: 0,
        color: hasRain ? (isHistorical ? color + "bb" : color) : "#cbd5e1",
      }}>
        {hasRain ? `${day.precipitation.toFixed(1)} mm` : "—"}
      </span>
    </div>
  );
}

interface Props {
  daily: AggregatedDailyForecast[];
  historicalPrecip?: { date: string; precipitation: number }[];
}

export default function RainCumulTable({ daily, historicalPrecip = [] }: Props) {
  if (daily.length === 0) return null;

  const allDays      = [...historicalPrecip, ...daily.map((d) => ({ date: d.date, precipitation: d.precipitation }))];
  const globalMax    = Math.max(...allDays.map((d) => d.precipitation), 0.1);

  const histTotal    = historicalPrecip.reduce((s, d) => s + d.precipitation, 0);
  const forecastTotal = daily.reduce((s, d) => s + d.precipitation, 0);
  const grandTotal   = histTotal + forecastTotal;

  const rainyForecast = daily.filter((d) => d.precipitation >= 1).length;
  const rainyHist     = historicalPrecip.filter((d) => d.precipitation >= 1).length;

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
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🌧️ Précipitations — 14 jours</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
          Total : {grandTotal.toFixed(1)} mm
        </span>
      </div>

      <div style={{ padding: "20px 24px", background: "#fff" }}>

        {/* Section historique */}
        {historicalPrecip.length > 0 && (
          <>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#94a3b8",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>7 derniers jours</span>
              <span style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>{histTotal.toFixed(1)} mm</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {historicalPrecip.map((day) => (
                <PrecipBar key={day.date} day={day} maxPrecip={globalMax} isHistorical />
              ))}
            </div>
          </>
        )}

        {/* Séparateur "Aujourd'hui" */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "14px 0",
        }}>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#e0f2fe,#2563eb)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>
            ▶ Aujourd'hui
          </span>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#2563eb,#e0f2fe)" }} />
        </div>

        {/* Section prévisions */}
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "#94a3b8",
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>7 prochains jours</span>
          <span style={{ color: "#1d4ed8", fontWeight: 600, fontSize: 12 }}>{forecastTotal.toFixed(1)} mm</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {daily.map((day, i) => (
            <PrecipBar
              key={day.date}
              day={{ date: day.date, precipitation: day.precipitation }}
              maxPrecip={globalMax}
              isToday={i === 0}
            />
          ))}
        </div>

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
            {rainyHist + rainyForecast} jour{rainyHist + rainyForecast > 1 ? "s" : ""} de pluie
            {historicalPrecip.length > 0 && ` (${rainyHist} passé${rainyHist > 1 ? "s" : ""} · ${rainyForecast} à venir)`}
          </span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", display: "block" }}>Cumul 14 jours</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: grandTotal > 0.5 ? "#1d4ed8" : "#94a3b8" }}>
              {grandTotal.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
