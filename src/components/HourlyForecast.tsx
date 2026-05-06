"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  const next24 = hourly.slice(0, 24);
  if (next24.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
      <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
        <h2 className="text-base font-semibold text-emerald-800">Heure par heure</h2>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="bg-emerald-50/70 text-emerald-700 uppercase tracking-wide text-[10px] border-b border-emerald-100">
              <th className="text-left py-2.5 px-5 font-semibold">Heure</th>
              <th className="text-left py-2.5 pr-3 font-semibold w-8"></th>
              <th className="text-right py-2.5 pr-3 font-semibold">Température</th>
              <th className="text-right py-2.5 pr-3 font-semibold">Ressenti</th>
              <th className="text-right py-2.5 pr-3 font-semibold">Humidité</th>
              <th className="text-right py-2.5 pr-3 font-semibold">Pluie</th>
              <th className="text-right py-2.5 pr-3 font-semibold">Probabilité</th>
              <th className="text-right py-2.5 px-5 font-semibold">Vent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {next24.map((h) => (
              <HourRow key={h.time} hour={h} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HourRow({ hour }: { hour: AggregatedHourlyForecast }) {
  const time = new Date(hour.time);
  const hrLabel = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow = Math.abs(time.getTime() - Date.now()) < 1800000;
  const localHour = time.getHours();
  const isNight = localHour < 6 || localHour >= 21;

  return (
    <tr
      className={`transition-colors ${
        isNow
          ? "bg-emerald-50/60"
          : isNight
          ? "bg-slate-50/50 opacity-70"
          : "hover:bg-slate-50"
      }`}
    >
      <td className="py-2.5 px-5 tabular-nums">
        <span className={`font-bold ${isNow ? "text-emerald-600" : "text-slate-700"}`}>
          {isNow ? "Maintenant" : hrLabel}
        </span>
      </td>

      <td className="py-2.5 pr-3 text-base">{getWeatherIcon(hour.weatherCode, localHour)}</td>

      <td className="py-2.5 pr-3 text-right text-slate-900 font-bold tabular-nums">
        {Math.round(hour.temperature)}°
      </td>

      <td className="py-2.5 pr-3 text-right text-slate-600 tabular-nums">
        {Math.round(hour.feelsLike)}°
      </td>

      <td className="py-2.5 pr-3 text-right text-slate-600 tabular-nums">
        {hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span className="text-slate-300">—</span>}
      </td>

      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.precipitation > 0.05 ? (
          <span className="text-emerald-600 font-semibold">{hour.precipitation.toFixed(1)} mm</span>
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
          <span className="text-slate-400 ml-1 font-medium">{windDir(hour.windDirection)}</span>
        )}
      </td>
    </tr>
  );
}
