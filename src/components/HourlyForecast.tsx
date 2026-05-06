"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

const S = {
  wrap: {
    borderRadius: 16,
    border: "1.5px solid #6ee7b7",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(16,185,129,0.10)",
  } as React.CSSProperties,
  titleBar: {
    background: "#d1fae5",
    padding: "12px 20px",
    borderBottom: "1.5px solid #6ee7b7",
    fontSize: 15,
    fontWeight: 700,
    color: "#065f46",
  } as React.CSSProperties,
  scrollWrap: { overflowX: "auto" as const, background: "#fff" },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 520,
    fontSize: 12,
  } as React.CSSProperties,
  th: {
    padding: "9px 12px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#065f46",
    background: "#d1fae5",
    textAlign: "right" as const,
    borderBottom: "1.5px solid #6ee7b7",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  thLeft: { textAlign: "left" as const } as React.CSSProperties,
  tdBase: {
    padding: "10px 12px",
    textAlign: "right" as const,
    color: "#1e293b",
    borderTop: "1px solid #f1f5f9",
  } as React.CSSProperties,
  tdLeft: { textAlign: "left" as const, fontWeight: 700, color: "#334155" } as React.CSSProperties,
  tdTemp: { fontWeight: 800, color: "#0f172a" } as React.CSSProperties,
  tdRain: { color: "#059669", fontWeight: 700 } as React.CSSProperties,
  tdDash: { color: "#cbd5e1" } as React.CSSProperties,
  tdDir:  { color: "#94a3b8", marginLeft: 4, fontWeight: 600 } as React.CSSProperties,
} as const;

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  const next24 = hourly.slice(0, 24);
  if (next24.length === 0) return null;

  return (
    <div style={S.wrap}>
      <div style={S.titleBar}>Heure par heure</div>
      <div style={S.scrollWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, ...S.thLeft }}>Heure</th>
              <th style={{ ...S.th, ...S.thLeft, width: 32 }}></th>
              <th style={S.th}>Température</th>
              <th style={S.th}>Ressenti</th>
              <th style={S.th}>Humidité</th>
              <th style={S.th}>Pluie</th>
              <th style={S.th}>Probabilité</th>
              <th style={S.th}>Vent</th>
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
  const time     = new Date(hour.time);
  const hrLabel  = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow    = Math.abs(time.getTime() - Date.now()) < 1800000;
  const localHour = time.getHours();
  const isNight  = localHour < 6 || localHour >= 21;

  const rowBg = isNow ? "#ecfdf5" : isNight ? "#f8fafc" : "#fff";
  const rowOp = isNight ? 0.6 : 1;

  return (
    <tr style={{ background: rowBg, opacity: rowOp }}>
      <td style={{ ...S.tdBase, ...S.tdLeft, color: isNow ? "#059669" : "#334155" }}>
        {isNow ? "Maintenant" : hrLabel}
      </td>
      <td style={{ ...S.tdBase, ...S.thLeft, fontSize: 16 }}>
        {getWeatherIcon(hour.weatherCode, localHour)}
      </td>
      <td style={{ ...S.tdBase, ...S.tdTemp }}>{Math.round(hour.temperature)}°</td>
      <td style={S.tdBase}>{Math.round(hour.feelsLike)}°</td>
      <td style={S.tdBase}>
        {hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span style={S.tdDash}>—</span>}
      </td>
      <td style={S.tdBase}>
        {hour.precipitation > 0.05
          ? <span style={S.tdRain}>{hour.precipitation.toFixed(1)} mm</span>
          : <span style={S.tdDash}>—</span>}
      </td>
      <td style={S.tdBase}>
        {hour.precipitationProbability > 5
          ? `${Math.round(hour.precipitationProbability)} %`
          : <span style={S.tdDash}>—</span>}
      </td>
      <td style={{ ...S.tdBase, whiteSpace: "nowrap" }}>
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && <span style={S.tdDir}>{windDir(hour.windDirection)}</span>}
      </td>
    </tr>
  );
}
