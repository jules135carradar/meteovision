"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

function windDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  // Next 24h only — the 7-day hourly is used by DailyForecast for expanded day detail
  const next24 = hourly.slice(0, 24);
  if (next24.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/70 overflow-hidden">
      <h2 className="text-base font-medium text-slate-700 px-5 pt-5 pb-2">Heure par heure</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[460px]">
          <thead>
            <tr className="text-slate-400 uppercase tracking-wide text-[10px] border-b border-slate-50">
              <th className="text-left py-2 px-5 font-medium">Heure</th>
              <th className="text-left py-2 pr-3 font-medium w-8"></th>
              <th className="text-right py-2 pr-3 font-medium">Temp.</th>
              <th className="text-right py-2 pr-3 font-medium">Ressenti</th>
              <th className="text-right py-2 pr-3 font-medium">Humidité</th>
              <th className="text-right py-2 pr-3 font-medium">Pluie</th>
              <th className="text-right py-2 pr-3 font-medium">Prob.</th>
              <th className="text-right py-2 px-5 font-medium">Vent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
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
  const hrLabel = hour.time.slice(11, 16);
  const isNow = Math.abs(time.getTime() - Date.now()) < 1800000;
  const hrNum = parseInt(hour.time.slice(11, 13));
  const isNight = hrNum < 6 || hrNum >= 22;

  return (
    <tr
      className={`transition-colors ${
        isNow ? "bg-emerald-50/50" : isNight ? "bg-slate-50/30 opacity-60" : "hover:bg-slate-50"
      }`}
    >
      <td className="py-2.5 px-5 tabular-nums">
        <span className={`font-semibold ${isNow ? "text-emerald-600" : "text-slate-600"}`}>
          {isNow ? "Maint." : hrLabel}
        </span>
      </td>

      <td className="py-2.5 pr-3 text-base">{getWeatherIcon(hour.weatherCode)}</td>

      <td className="py-2.5 pr-3 text-right text-slate-800 font-semibold tabular-nums">
        {Math.round(hour.temperature)}°
      </td>

      <td className="py-2.5 pr-3 text-right text-slate-400 tabular-nums">
        {Math.round(hour.feelsLike)}°
      </td>

      <td className="py-2.5 pr-3 text-right text-slate-500 tabular-nums">
        {hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span className="text-slate-300">—</span>}
      </td>

      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.precipitation > 0.05 ? (
          <span className="text-emerald-500 font-medium">{hour.precipitation.toFixed(1)} mm</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      <td className="py-2.5 pr-3 text-right tabular-nums">
        {hour.precipitationProbability > 5 ? (
          <span className="text-slate-400">{Math.round(hour.precipitationProbability)} %</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      <td className="py-2.5 px-5 text-right text-slate-400 tabular-nums whitespace-nowrap">
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && (
          <span className="text-slate-300 ml-1">{windDir(hour.windDirection)}</span>
        )}
      </td>
    </tr>
  );
}
