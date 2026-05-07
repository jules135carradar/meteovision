"use client";

import { useState } from "react";
import { AggregatedDailyForecast, AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

function formatDayLabel(dateStr: string): string {
  const [yr, mo, da] = dateStr.split("-").map(Number);
  const d = new Date(yr, mo - 1, da);
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1) + " " + da;
}

function avg(vals: number[]): number | null {
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

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

function weatherAccent(code: number): string {
  if (code === 0 || code === 1) return "#f59e0b";
  if (code === 2 || code === 3) return "#94a3b8";
  if (code >= 45 && code <= 48) return "#9ca3af";
  if (code >= 51 && code <= 67) return "#60a5fa";
  if (code >= 71 && code <= 77) return "#93c5fd";
  if (code >= 80 && code <= 82) return "#3b82f6";
  if (code >= 85 && code <= 86) return "#7dd3fc";
  if (code >= 95) return "#7c3aed";
  return "#cbd5e1";
}

const COL_COLORS = ["#6d28d9", "#6d28d9", "#2563eb", "#0891b2", "#0891b2", "#2563eb", "#059669", "#d97706"];

interface Props {
  daily: AggregatedDailyForecast[];
  hourly: AggregatedHourlyForecast[];
}

export default function DailyForecast({ daily, hourly }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  if (daily.length === 0) return null;

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#f59e0b,#ef4444,#7c3aed,#2563eb,#10b981) border-box",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        background: "linear-gradient(90deg, #b45309 0%, #b91c1c 30%, #6d28d9 60%, #1d4ed8 80%, #047857 100%)",
        padding: "13px 20px",
        fontSize: 15,
        fontWeight: 700,
        color: "#fff",
      }}>
        📅 7 jours
      </div>
      <div>
        {daily.map((day, i) => {
          const dayHourly = hourly.filter((h) => h.time.slice(0, 10) === day.date);
          return (
            <DayRow
              key={day.date}
              day={day}
              isToday={i === 0}
              hourly={dayHourly}
              isExpanded={expandedDay === day.date}
              onToggle={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayRow({
  day, isToday, hourly, isExpanded, onToggle,
}: {
  day: AggregatedDailyForecast;
  isToday: boolean;
  hourly: AggregatedHourlyForecast[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const morningH   = hourly.filter((h) => { const hr = parseInt(h.time.slice(11, 13)); return hr >= 6 && hr < 12; });
  const afternoonH = hourly.filter((h) => { const hr = parseInt(h.time.slice(11, 13)); return hr >= 12 && hr < 18; });

  const morningTemp    = avg(morningH.map((h) => h.temperature));
  const afternoonTemp  = avg(afternoonH.map((h) => h.temperature));
  const morningPrecip  = morningH.reduce((s, h) => s + h.precipitation, 0);
  const afternoonPrecip = afternoonH.reduce((s, h) => s + h.precipitation, 0);
  const maxPrecipProb  = avg(
    hourly.filter((h) => { const hr = parseInt(h.time.slice(11, 13)); return hr >= 6 && hr <= 20; })
          .map((h) => h.precipitationProbability)
  );

  const accent = weatherAccent(day.weatherCode);
  const rowBg  = isToday ? "#fefce8" : "#fff";

  return (
    <div style={{ borderTop: "1px solid #f1f5f9" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 16px",
          background: rowBg,
          border: "none",
          borderLeft: `5px solid ${accent}`,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isToday ? "#fef9c3" : "#f8fafc"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
      >
        {/* Main row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 100, color: isToday ? "#92400e" : "#334155" }}>
            {isToday ? "Aujourd'hui" : formatDayLabel(day.date)}
          </span>

          <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>
            {getWeatherIcon(day.weatherCode)}
          </span>

          <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: tempColor(day.tempMax) }}>
              {Math.round(day.tempMax)}°
            </span>
            <span style={{ fontSize: 12, color: tempColor(day.tempMin), opacity: 0.7 }}>
              / {Math.round(day.tempMin)}°
            </span>
          </div>

          {(morningTemp !== null || afternoonTemp !== null) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#94a3b8" }}>
              {morningTemp !== null && (
                <span>🌅 <span style={{ color: tempColor(morningTemp), fontWeight: 600 }}>{Math.round(morningTemp)}°</span>
                  {morningPrecip >= 1 && <span style={{ color: "#60a5fa", marginLeft: 3 }}>{morningPrecip.toFixed(1)} mm</span>}
                </span>
              )}
              {afternoonTemp !== null && (
                <span>☀️ <span style={{ color: tempColor(afternoonTemp), fontWeight: 600 }}>{Math.round(afternoonTemp)}°</span>
                  {afternoonPrecip >= 1 && <span style={{ color: "#60a5fa", marginLeft: 3 }}>{afternoonPrecip.toFixed(1)} mm</span>}
                </span>
              )}
            </div>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {day.precipitation >= 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <span style={{ color: "#2563eb", fontWeight: 700 }}>{day.precipitation.toFixed(1)} mm</span>
                {maxPrecipProb !== null && maxPrecipProb > 10 && (
                  <span style={{ color: probColor(maxPrecipProb), fontWeight: 600 }}>{Math.round(maxPrecipProb)}%</span>
                )}
              </div>
            )}
            <span style={{ fontSize: 12, color: windColor(day.windSpeed), fontWeight: 600 }}>
              💨 {Math.round(day.windSpeed)} km/h
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ color: "#94a3b8", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && hourly.length > 0 && (
        <div style={{ overflowX: "auto", borderTop: `2px solid ${accent}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420, fontSize: 12 }}>
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
                    borderBottom: "1px solid #e5e7eb",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hourly.map((h) => <HourRow key={h.time} hour={h} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function windArrow(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function HourRow({ hour }: { hour: AggregatedHourlyForecast }) {
  const time      = new Date(hour.time);
  const hrLabel   = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const localHour = time.getHours();
  const isNight   = localHour < 6 || localHour >= 22;

  const td = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "10px 12px",
    textAlign: "right",
    color: "#1e293b",
    borderTop: "1px solid #f1f5f9",
    background: isNight ? "#f8fafc" : "#fff",
    opacity: isNight ? 0.65 : 1,
    ...extra,
  });

  return (
    <tr>
      <td style={td({ textAlign: "left", fontWeight: 700, color: "#334155" })}>{hrLabel}</td>
      <td style={td({ textAlign: "left", fontSize: 16 })}>{getWeatherIcon(hour.weatherCode, localHour)}</td>
      <td style={td({ fontWeight: 800, color: tempColor(hour.temperature) })}>{Math.round(hour.temperature)}°</td>
      <td style={td({ color: "#64748b" })}>{Math.round(hour.feelsLike)}°</td>
      <td style={td({ color: "#0891b2" })}>
        {hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td()}>
        {hour.precipitation >= 1
          ? <span style={{ color: "#2563eb", fontWeight: 700 }}>{hour.precipitation.toFixed(1)} mm</span>
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td()}>
        {hour.precipitationProbability > 5
          ? <span style={{ color: probColor(hour.precipitationProbability), fontWeight: 600 }}>{Math.round(hour.precipitationProbability)} %</span>
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td({ whiteSpace: "nowrap" })}>
        <span style={{ color: windColor(hour.windSpeed), fontWeight: 600 }}>{Math.round(hour.windSpeed)} km/h</span>
        {hour.windDirection > 0 && (
          <span style={{ color: "#94a3b8", marginLeft: 4, fontWeight: 500 }}>{windArrow(hour.windDirection)}</span>
        )}
      </td>
    </tr>
  );
}
