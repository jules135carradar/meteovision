"use client";

import { AggregatedHourlyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

interface Props {
  hourly: AggregatedHourlyForecast[];
}

export default function HourlyForecast({ hourly }: Props) {
  if (hourly.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-6">
      <h2 className="text-xl font-bold text-white mb-4">Prévisions heure par heure</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {hourly.map((h) => (
          <HourCard key={h.time} hour={h} />
        ))}
      </div>
    </div>
  );
}

function HourCard({ hour }: { hour: AggregatedHourlyForecast }) {
  const icon = getWeatherIcon(hour.weatherCode);
  const time = new Date(hour.time);
  const label = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isNow = Math.abs(time.getTime() - Date.now()) < 1800000;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl p-3 flex-shrink-0 w-[76px] transition-colors ${
        isNow
          ? "bg-sky-600/40 border border-sky-400/30"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      {/* Heure */}
      <span className="text-xs text-sky-300 font-semibold">
        {isNow ? "Maint." : label}
      </span>

      {/* Icône */}
      <span className="text-2xl">{icon}</span>

      {/* Température */}
      <span className="text-white font-bold text-sm">{Math.round(hour.temperature)}°</span>

      {/* Probabilité pluie */}
      {hour.precipitationProbability > 10 && (
        <span className="text-blue-300 text-xs font-medium">
          💧{Math.round(hour.precipitationProbability)}%
        </span>
      )}

      {/* Vent si significatif */}
      {hour.windSpeed > 20 && (
        <span className="text-gray-300 text-xs">{Math.round(hour.windSpeed)}km/h</span>
      )}
    </div>
  );
}
