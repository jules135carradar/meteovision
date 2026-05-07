"use client";

import { AggregatedWeather } from "@/lib/types";
import { getWeatherIcon, getWindDirection } from "@/lib/weather-codes";
import { formatWind, formatHumidity, formatPressure, formatPrecipitation } from "@/lib/utils";

function tempGradient(t: number): string {
  if (t <= 0)  return "linear-gradient(135deg, #bfdbfe 0%, #e0f2fe 60%, #ddd6fe 100%)";
  if (t <= 10) return "linear-gradient(135deg, #cffafe 0%, #a5f3fc 40%, #d1fae5 100%)";
  if (t <= 18) return "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #ecfdf5 100%)";
  if (t <= 25) return "linear-gradient(135deg, #fef9c3 0%, #fde68a 40%, #fef3c7 100%)";
  if (t <= 30) return "linear-gradient(135deg, #ffedd5 0%, #fed7aa 40%, #fde68a 100%)";
  return "linear-gradient(135deg, #fee2e2 0%, #fca5a5 40%, #fed7aa 100%)";
}

function tempColor(t: number): string {
  if (t <= 0)  return "#1d4ed8";
  if (t <= 10) return "#0e7490";
  if (t <= 18) return "#047857";
  if (t <= 25) return "#b45309";
  if (t <= 30) return "#c2410c";
  return "#991b1b";
}

const STAT_COLORS: Record<string, string> = {
  wind:   "#059669",
  humid:  "#0891b2",
  precip: "#2563eb",
  press:  "#7c3aed",
  uv:     "#d97706",
};

export default function WeatherCard({ weather }: { weather: AggregatedWeather }) {
  const icon    = getWeatherIcon(weather.weatherCode, new Date().getHours());
  const windDir = getWindDirection(weather.windDirection);
  const t       = weather.temperature;
  const tColor  = tempColor(t);

  return (
    <div style={{
      background: tempGradient(t),
      borderRadius: 24,
      padding: "28px 32px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      border: "1.5px solid rgba(255,255,255,0.7)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 300, color: "#1e293b", lineHeight: 1.2, margin: 0 }}>
            {weather.location.name}
          </h1>
          {weather.location.admin1 && (
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4, margin: "4px 0 0" }}>{weather.location.admin1}</p>
          )}
        </div>
        <span style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1, marginLeft: 12, flexShrink: 0 }}>{icon}</span>
      </div>

      {/* Temperature */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 8 }}>
        <span style={{ fontSize: "clamp(4rem, 12vw, 6rem)", fontWeight: 200, color: tColor, lineHeight: 1 }}>
          {Math.round(t)}°
        </span>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Ressenti</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 300, color: tColor, opacity: 0.75, margin: 0 }}>
            {Math.round(weather.feelsLike)}°
          </p>
        </div>
      </div>

      <p style={{ color: "#475569", fontSize: 16, marginBottom: 24, textTransform: "capitalize", fontWeight: 300 }}>
        {weather.description}
      </p>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "16px 24px",
        paddingTop: 20,
        borderTop: "1.5px solid rgba(255,255,255,0.5)",
      }}>
        <StatItem icon="💨" label={`Vent ${windDir}`} value={formatWind(weather.windSpeed)}         color={STAT_COLORS.wind} />
        <StatItem icon="💧" label="Humidité"           value={formatHumidity(weather.humidity)}      color={STAT_COLORS.humid} />
        <StatItem icon="🌧️" label="Précipitations"    value={formatPrecipitation(weather.precipitation)} color={STAT_COLORS.precip} />
        <StatItem icon="📊" label="Pression"           value={formatPressure(weather.pressure)}      color={STAT_COLORS.press} />
        {weather.uvIndex > 0 && (
          <StatItem icon="☀️" label="Indice UV"        value={weather.uvIndex.toFixed(1)}            color={STAT_COLORS.uv} />
        )}
      </div>

      <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 16 }}>
        {weather.validSources} source{weather.validSources > 1 ? "s" : ""} agrégée{weather.validSources > 1 ? "s" : ""} ·{" "}
        {new Date(weather.fetchedAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

function StatItem({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
