"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

export default function HourlyForecast({ hourly }: { hourly: AggregatedHourlyForecast[] }) {
  if (hourly.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100/70">
      <h2 className="text-base font-medium text-slate-700 mb-4">Heure par heure</h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {hourly.map((h) => <HourCard key={h.time} hour={h} />)}
      </div>
    </div>
  );
}

function HourCard({ hour }: { hour: AggregatedHourlyForecast }) {
  const icon  = getWeatherIcon(hour.weatherCode);
  const time  = new Date(hour.time);
  const label = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow = Math.abs(time.getTime() - Date.now()) < 1800000;

  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-xl p-3 flex-shrink-0 w-[72px] transition-colors border ${
      isNow
        ? "bg-sky-50 border-sky-200"
        : "bg-slate-50 border-transparent hover:bg-slate-100"
    }`}>
      <span className={`text-xs font-medium ${isNow ? "text-sky-500" : "text-slate-400"}`}>
        {isNow ? "Maint." : label}
      </span>
      <span className="text-xl">{icon}</span>
      <span className="text-slate-700 font-medium text-sm">{Math.round(hour.temperature)}°</span>
      {hour.precipitationProbability > 10 && (
        <span className="text-sky-400 text-xs">{Math.round(hour.precipitationProbability)}%</span>
      )}
      {hour.windSpeed > 20 && (
        <span className="text-slate-400 text-xs">{Math.round(hour.windSpeed)}km/h</span>
      )}
    </div>
  );
}
