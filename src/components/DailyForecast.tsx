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

interface Props {
  daily: AggregatedDailyForecast[];
  hourly: AggregatedHourlyForecast[];
}

export default function DailyForecast({ daily, hourly }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (daily.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/70 overflow-hidden">
      <h2 className="text-base font-medium text-slate-700 px-5 pt-5 pb-2">7 jours</h2>
      <div className="divide-y divide-slate-50">
        {daily.map((day, i) => {
          const dayHourly = hourly.filter((h) => h.time.slice(0, 10) === day.date);
          return (
            <DayRow
              key={day.date}
              day={day}
              isToday={i === 0}
              hourly={dayHourly}
              isExpanded={expandedDay === day.date}
              onToggle={() =>
                setExpandedDay(expandedDay === day.date ? null : day.date)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function DayRow({
  day,
  isToday,
  hourly,
  isExpanded,
  onToggle,
}: {
  day: AggregatedDailyForecast;
  isToday: boolean;
  hourly: AggregatedHourlyForecast[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const morningH = hourly.filter((h) => {
    const hr = parseInt(h.time.slice(11, 13));
    return hr >= 6 && hr < 12;
  });
  const afternoonH = hourly.filter((h) => {
    const hr = parseInt(h.time.slice(11, 13));
    return hr >= 12 && hr < 18;
  });

  const morningTemp = avg(morningH.map((h) => h.temperature));
  const afternoonTemp = avg(afternoonH.map((h) => h.temperature));
  const morningPrecip = morningH.reduce((s, h) => s + h.precipitation, 0);
  const afternoonPrecip = afternoonH.reduce((s, h) => s + h.precipitation, 0);
  const maxPrecipProb = avg(
    hourly
      .filter((h) => {
        const hr = parseInt(h.time.slice(11, 13));
        return hr >= 6 && hr <= 20;
      })
      .map((h) => h.precipitationProbability)
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full text-left px-5 py-4 transition-colors ${
          isToday ? "bg-emerald-50/50" : "hover:bg-slate-50"
        }`}
      >
        {/* Main row */}
        <div className="flex items-center gap-3">
          {/* Day name */}
          <span
            className={`text-sm font-medium w-28 flex-shrink-0 ${
              isToday ? "text-emerald-600" : "text-slate-700"
            }`}
          >
            {isToday ? "Aujourd'hui" : formatDayLabel(day.date)}
          </span>

          {/* Icon */}
          <span className="text-xl flex-shrink-0 w-8 text-center">
            {getWeatherIcon(day.weatherCode)}
          </span>

          {/* Min / Max */}
          <div className="flex items-baseline gap-1.5 flex-shrink-0">
            <span className="text-slate-800 font-semibold text-sm">
              {Math.round(day.tempMax)}°
            </span>
            <span className="text-slate-400 text-xs">/ {Math.round(day.tempMin)}°</span>
          </div>

          {/* Morning / Afternoon temps — hidden on small screens */}
          {(morningTemp !== null || afternoonTemp !== null) && (
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              {morningTemp !== null && (
                <span title="Température matin (6h–12h)">
                  🌅 <span className="text-slate-600">{Math.round(morningTemp)}°</span>
                </span>
              )}
              {afternoonTemp !== null && (
                <span title="Température après-midi (12h–18h)">
                  ☀️ <span className="text-slate-600">{Math.round(afternoonTemp)}°</span>
                </span>
              )}
            </div>
          )}

          {/* Precip + wind — right aligned */}
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            {day.precipitation > 0.1 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-500 font-medium">
                  {day.precipitation.toFixed(1)} mm
                </span>
                {maxPrecipProb !== null && maxPrecipProb > 10 && (
                  <span className="text-slate-400">
                    {Math.round(maxPrecipProb)}%
                  </span>
                )}
              </div>
            )}
            <span className="text-slate-400 text-xs hidden sm:block">
              💨 {Math.round(day.windSpeed)} km/h
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`text-slate-300 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Morning / Afternoon detail — visible on mobile */}
        {(morningTemp !== null || afternoonTemp !== null) && (
          <div className="flex md:hidden items-center gap-4 mt-2 pl-11 text-xs text-slate-400">
            {morningTemp !== null && (
              <span>🌅 {Math.round(morningTemp)}°
                {morningPrecip > 0.1 && (
                  <span className="text-emerald-400 ml-1">{morningPrecip.toFixed(1)} mm</span>
                )}
              </span>
            )}
            {afternoonTemp !== null && (
              <span>☀️ {Math.round(afternoonTemp)}°
                {afternoonPrecip > 0.1 && (
                  <span className="text-emerald-400 ml-1">{afternoonPrecip.toFixed(1)} mm</span>
                )}
              </span>
            )}
            <span>💨 {Math.round(day.windSpeed)} km/h</span>
          </div>
        )}
      </button>

      {/* Expanded hourly detail */}
      {isExpanded && hourly.length > 0 && (
        <div style={{ overflowX: "auto", borderTop: "1.5px solid #6ee7b7" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420, fontSize: 12 }}>
            <thead>
              <tr>
                {["Heure", "", "Température", "Ressenti", "Humidité", "Pluie", "Prob. pluie", "Vent"].map((h, i) => (
                  <th key={i} style={{
                    padding: "9px 12px",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#065f46",
                    background: "#d1fae5",
                    textAlign: i < 2 ? "left" : "right",
                    borderBottom: "1.5px solid #6ee7b7",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hourly.map((h) => (
                <HourRow key={h.time} hour={h} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function windArrow(deg: number): string {
  const dirs = ["N","NE","E","SE","S","SO","O","NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function HourRow({ hour }: { hour: AggregatedHourlyForecast }) {
  const time = new Date(hour.time);
  const hrLabel = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const localHour = time.getHours();
  const isNight = localHour < 6 || localHour >= 22;

  const td = {
    padding: "10px 12px",
    textAlign: "right" as const,
    color: "#1e293b",
    borderTop: "1px solid #f1f5f9",
    background: isNight ? "#f8fafc" : "#fff",
    opacity: isNight ? 0.6 : 1,
  };
  return (
    <tr>
      <td style={{ ...td, textAlign: "left", fontWeight: 700, color: "#334155" }}>{hrLabel}</td>
      <td style={{ ...td, textAlign: "left", fontSize: 16 }}>{getWeatherIcon(hour.weatherCode, localHour)}</td>
      <td style={{ ...td, fontWeight: 800, color: "#0f172a" }}>{Math.round(hour.temperature)}°</td>
      <td style={td}>{Math.round(hour.feelsLike)}°</td>
      <td style={td}>{hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span style={{ color: "#cbd5e1" }}>—</span>}</td>
      <td style={td}>
        {hour.precipitation > 0.05
          ? <span style={{ color: "#059669", fontWeight: 700 }}>{hour.precipitation.toFixed(1)} mm</span>
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={td}>
        {hour.precipitationProbability > 5
          ? `${Math.round(hour.precipitationProbability)} %`
          : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td style={{ ...td, whiteSpace: "nowrap" }}>
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && (
          <span style={{ color: "#94a3b8", marginLeft: 4, fontWeight: 600 }}>
            {windArrow(hour.windDirection)}
          </span>
        )}
      </td>
    </tr>
  );
}
