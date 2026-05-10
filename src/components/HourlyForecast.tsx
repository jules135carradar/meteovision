"use client";

import { useState } from "react";
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

// ─── Graphique SVG ────────────────────────────────────────────────────────────

function TempChart({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  const W = 800;
  const H = 320;
  const PAD = { top: 40, bottom: 50, left: 42, right: 20 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const temps = hourly.map((h) => h.temperature);
  const probs = hourly.map((h) => h.precipitationProbability);
  const minT = Math.floor(Math.min(...temps)) - 2;
  const maxT = Math.ceil(Math.max(...temps))  + 2;

  const xOf = (i: number) => PAD.left + (i / (hourly.length - 1)) * innerW;
  const yOf = (t: number) => PAD.top + (1 - (t - minT) / (maxT - minT)) * innerH;

  // Polyline points
  const pts = hourly.map((h, i) => `${xOf(i).toFixed(1)},${yOf(h.temperature).toFixed(1)}`).join(" ");
  // Area path
  const area = `M${xOf(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} ` +
    hourly.map((h, i) => `L${xOf(i).toFixed(1)},${yOf(h.temperature).toFixed(1)}`).join(" ") +
    ` L${xOf(hourly.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  // Precipitation bars (background)
  const barW = innerW / hourly.length * 0.7;
  const nowIdx = hourly.findIndex((h) => Math.abs(new Date(h.time).getTime() - Date.now()) < 1800000);

  // Y grid lines
  const yStep = (maxT - minT) <= 8 ? 2 : 5;
  const gridTemps: number[] = [];
  for (let t = Math.ceil(minT / yStep) * yStep; t <= maxT; t += yStep) gridTemps.push(t);

  return (
    <div style={{ overflowX: "auto", background: "#fff", padding: "8px 0 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 360, height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Nuit en fond */}
        {hourly.map((h, i) => {
          const hr = new Date(h.time).getHours();
          const isNight = hr < 6 || hr >= 22;
          if (!isNight) return null;
          const x0 = xOf(i) - innerW / hourly.length / 2;
          return (
            <rect key={i} x={x0} y={PAD.top} width={innerW / hourly.length}
              height={innerH} fill="#f1f5f9" opacity={0.6} />
          );
        })}

        {/* Lignes de grille horizontales */}
        {gridTemps.map((t) => (
          <g key={t}>
            <line x1={PAD.left} y1={yOf(t)} x2={PAD.left + innerW} y2={yOf(t)}
              stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.left - 4} y={yOf(t) + 4} textAnchor="end"
              fontSize={10} fill="#94a3b8">{t}°</text>
          </g>
        ))}

        {/* Barres de probabilité pluie */}
        {hourly.map((h, i) => {
          const prob = probs[i];
          if (prob < 10) return null;
          const bH = (prob / 100) * innerH * 0.35;
          return (
            <rect key={i}
              x={xOf(i) - barW / 2} y={PAD.top + innerH - bH}
              width={barW} height={bH}
              fill="#3b82f6" opacity={0.18} rx={2} />
          );
        })}

        {/* Aire sous la courbe */}
        <path d={area} fill="url(#areaGrad)" />

        {/* Courbe température */}
        <polyline points={pts} fill="none" stroke="#6d28d9" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Maintenant — ligne verticale */}
        {nowIdx >= 0 && (
          <line x1={xOf(nowIdx)} y1={PAD.top} x2={xOf(nowIdx)} y2={PAD.top + innerH}
            stroke="#6d28d9" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
        )}

        {/* Points + température */}
        {hourly.map((h, i) => {
          const showLabel = i % 3 === 0 || i === hourly.length - 1 || i === nowIdx;
          return (
            <g key={i}>
              <circle cx={xOf(i)} cy={yOf(h.temperature)} r={i === nowIdx ? 5 : 3.5}
                fill={i === nowIdx ? "#6d28d9" : tempColor(h.temperature)}
                stroke="#fff" strokeWidth={1.5} />
              {showLabel && (
                <text x={xOf(i)} y={yOf(h.temperature) - 8} textAnchor="middle"
                  fontSize={10} fontWeight={i === nowIdx ? "800" : "600"}
                  fill={i === nowIdx ? "#6d28d9" : tempColor(h.temperature)}>
                  {Math.round(h.temperature)}°
                </text>
              )}
            </g>
          );
        })}

        {/* Axe X — heures */}
        {hourly.map((h, i) => {
          if (i % 4 !== 0 && i !== hourly.length - 1) return null;
          const hr = new Date(h.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          return (
            <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle"
              fontSize={10} fill={i === nowIdx ? "#6d28d9" : "#94a3b8"}
              fontWeight={i === nowIdx ? "700" : "400"}>
              {i === nowIdx ? "Now" : hr}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  const next24 = hourly.slice(0, 24);
  const [view, setView] = useState<"graph" | "table">("table");

  if (next24.length === 0) return null;

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#6d28d9,#2563eb,#0891b2,#059669) border-box",
      boxShadow: "0 4px 20px rgba(109,40,217,0.12)",
    }}>
      {/* Header + toggle */}
      <div style={{
        background: "linear-gradient(90deg, #6d28d9 0%, #2563eb 35%, #0891b2 65%, #059669 100%)",
        padding: "13px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>⏱️ Heure par heure</span>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: 2, gap: 2 }}>
          {(["graph", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: view === v ? "#fff" : "transparent",
                color: view === v ? "#6d28d9" : "rgba(255,255,255,0.8)",
                transition: "all 0.15s",
              }}
            >
              {v === "graph" ? "📈 Graphique" : "📋 Tableau"}
            </button>
          ))}
        </div>
      </div>

      {view === "graph" ? (
        <TempChart hourly={next24} />
      ) : (
        <div style={{ overflowX: "auto", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520, fontSize: 12 }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #ede9fe 0%, #dbeafe 40%, #cffafe 65%, #d1fae5 100%)" }}>
                {["Heure", "", "Température", "Ressenti", "Humidité", "Pluie", "Prob. pluie", "Vent"].map((h, i) => (
                  <th key={i} style={{
                    padding: "9px 12px", fontSize: 10, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    color: COL_COLORS[i], textAlign: i < 2 ? "left" : "right",
                    borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {next24.map((h) => <HourRow key={h.time} hour={h} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HourRow({ hour }: { hour: AggregatedHourlyForecast }) {
  const time      = new Date(hour.time);
  const hrLabel   = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow     = Math.abs(time.getTime() - Date.now()) < 1800000;
  const localHour = time.getHours();
  const isNight   = localHour < 6 || localHour >= 21;

  const rowBg = isNow ? "linear-gradient(90deg, #ede9fe, #dbeafe)" : isNight ? "#f8fafc" : "#fff";

  const td = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "10px 12px", textAlign: "right", borderTop: "1px solid #f1f5f9", ...extra,
  });

  return (
    <tr style={{ background: rowBg, opacity: isNight && !isNow ? 0.65 : 1 }}>
      <td style={td({ textAlign: "left", fontWeight: 700, color: isNow ? "#6d28d9" : "#334155", whiteSpace: "nowrap" })}>
        {isNow ? "✨ Maintenant" : hrLabel}
      </td>
      <td style={td({ textAlign: "left", fontSize: 16 })}>{getWeatherIcon(hour.weatherCode, localHour)}</td>
      <td style={td({ fontWeight: 800, color: tempColor(hour.temperature) })}>{Math.round(hour.temperature)}°</td>
      <td style={td({ color: "#64748b" })}>{Math.round(hour.feelsLike)}°</td>
      <td style={td({ color: "#0891b2" })}>
        {hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span style={{ color: "#cbd5e1" }}>—</span>}
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
