"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

function tempColor(t: number): string {
  if (t <= 0)  return "#3b82f6";
  if (t <= 10) return "#06b6d4";
  if (t <= 18) return "#10b981";
  if (t <= 25) return "#f59e0b";
  if (t <= 30) return "#f97316";
  return "#ef4444";
}

function windColor(kmh: number): string {
  if (kmh < 15) return "#10b981";
  if (kmh < 30) return "#f59e0b";
  if (kmh < 50) return "#f97316";
  return "#ef4444";
}

function probColor(p: number): string {
  if (p < 20) return "#94a3b8";
  if (p < 50) return "#60a5fa";
  if (p < 75) return "#3b82f6";
  return "#1d4ed8";
}

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

const COL_COLORS = ["#6d28d9", "#6d28d9", "#2563eb", "#0891b2", "#0891b2", "#2563eb", "#059669", "#d97706"];

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  const next24 = hourly.slice(0, 24);
  if (next24.length === 0) return null;

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#6d28d9,#2563eb,#0891b2,#059669) border-box",
      boxShadow: "0 4px 20px rgba(109,40,217,0.12)",
    }}>
      <div style={{
        background: "linear-gradient(90deg, #6d28d9 0%, #2563eb 35%, #0891b2 65%, #059669 100%)",
        padding: "13px 20px",
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.01em",
      }}>
        ⏱️ Heure par heure
      </div>

      <div style={{ overflowX: "auto", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520, fontSize: 12 }}>
          <thead>
            <tr style={{ background: "linear-gradient(90deg, #ede9fe 0%, #dbeafe 40%, #cffafe 65%, #d1fae5 100%)" }}>
              {["Heure", "", "Température", "Ressenti", "Humidité", "Pluie", "Prob. pluie", "Vent"].map((h, i) => (
                <th key={i} style={{
                  padding: "9px 12px",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: COL_COLORS[i],
                  textAlign: i < 2 ? "left" : "right",
                  borderBottom: "2px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {next24.map((h) => <HourRow key={h.time} hour={h} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HourRow({ hour }: { hour: AggregatedHourlyForecast }) {
  const time      = new Date(hour.time);
  const hrLabel   = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow     = Math.abs(time.getTime() - Date.now()) < 1800000;
  const localHour = time.getHours();
  const isNight   = localHour < 6 || localHour >= 21;

  const rowBg = isNow
    ? "linear-gradient(90deg, #ede9fe, #dbeafe)"
    : isNight ? "#f8fafc" : "#fff";

  const td = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "10px 12px",
    textAlign: "right",
    borderTop: "1px solid #f1f5f9",
    ...extra,
  });

  return (
    <tr style={{ background: rowBg, opacity: isNight && !isNow ? 0.65 : 1 }}>
      <td style={td({ textAlign: "left", fontWeight: 700, color: isNow ? "#6d28d9" : "#334155", whiteSpace: "nowrap" })}>
        {isNow ? "✨ Maintenant" : hrLabel}
      </td>
      <td style={td({ textAlign: "left", fontSize: 16 })}>
        {getWeatherIcon(hour.weatherCode, localHour)}
      </td>
      <td style={td({ fontWeight: 800, color: tempColor(hour.temperature) })}>
        {Math.round(hour.temperature)}°
      </td>
      <td style={td({ color: "#64748b" })}>
        {Math.round(hour.feelsLike)}°
      </td>
      <td style={td({ color: "#0891b2" })}>
        {hour.humidity > 0
          ? `${Math.round(hour.humidity)} %`
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td()}>
        {hour.precipitation >= 1
          ? <span style={{ color: "#2563eb", fontWeight: 700 }}>{hour.precipitation.toFixed(1)} mm</span>
          : hour.precipitation >= 0.1
          ? <span style={{ color: "#93c5fd" }}>{hour.precipitation.toFixed(1)} mm</span>
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td()}>
        {hour.precipitationProbability > 5
          ? <span style={{ color: probColor(hour.precipitationProbability), fontWeight: 600 }}>{Math.round(hour.precipitationProbability)} %</span>
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td({ whiteSpace: "nowrap", color: windColor(hour.windSpeed), fontWeight: 600 })}>
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && (
          <span style={{ color: "#94a3b8", marginLeft: 4, fontWeight: 500, fontSize: 11 }}>
            {windDir(hour.windDirection)}
          </span>
        )}
      </td>
    </tr>
  );
}
