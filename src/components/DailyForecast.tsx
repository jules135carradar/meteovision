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
        <div className="border-t border-emerald-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[420px]">
            <thead>
              <tr className="bg-emerald-50/80 text-emerald-700 uppercase tracking-wide text-[10px] border-b border-emerald-100">
                <th className="text-left py-2 px-5 font-semibold">Heure</th>
                <th className="text-left py-2 pr-3 font-semibold w-8"></th>
                <th className="text-right py-2 pr-3 font-semibold">Température</th>
                <th className="text-right py-2 pr-3 font-semibold">Ressenti</th>
                <th className="text-right py-2 pr-3 font-semibold">Humidité</th>
                <th className="text-right py-2 pr-3 font-semibold">Pluie</th>
                <th className="text-right py-2 pr-3 font-semibold">Probabilité</th>
                <th className="text-right py-2 px-5 font-semibold">Vent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
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

  return (
    <tr className={`transition-colors hover:bg-slate-50 ${isNight ? "bg-slate-50/40 opacity-60" : ""}`}>
      <td className="py-2.5 px-5 text-slate-700 font-bold tabular-nums">{hrLabel}</td>
      <td className="py-2.5 pr-3 text-base">{getWeatherIcon(hour.weatherCode, localHour)}</td>
      <td className="py-2.5 pr-3 text-right text-slate-900 font-bold tabular-nums">
        {Math.round(hour.temperature)}°
      </td>
      <td className="py-2.5 pr-3 text-right text-slate-600 tabular-nums">
        {Math.round(hour.feelsLike)}°
      </td>
      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.humidity > 0 ? (
          <span className="text-slate-600">{Math.round(hour.humidity)} %</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.precipitation > 0.05 ? (
          <span className="text-emerald-600 font-semibold">
            {hour.precipitation.toFixed(1)} mm
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.precipitationProbability > 5 ? (
          <span className="text-slate-600">{Math.round(hour.precipitationProbability)} %</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 px-5 text-right text-slate-600 tabular-nums whitespace-nowrap">
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && (
          <span className="text-slate-400 ml-1 font-medium">{windArrow(hour.windDirection)}</span>
        )}
      </td>
    </tr>
  );
}
