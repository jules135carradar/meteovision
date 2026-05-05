"use client";

import { AggregatedWeather } from "@/lib/types";
import { getWeatherIcon, getWindDirection } from "@/lib/weather-codes";
import { formatWind, formatHumidity, formatPressure, formatPrecipitation } from "@/lib/utils";

export default function WeatherCard({ weather }: { weather: AggregatedWeather }) {
  const icon    = getWeatherIcon(weather.weatherCode);
  const windDir = getWindDirection(weather.windDirection);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-slate-800 leading-tight">
            {weather.location.name}
          </h1>
          {weather.location.admin1 && (
            <p className="text-slate-400 text-sm mt-0.5">{weather.location.admin1}</p>
          )}
          <p className="text-slate-300 text-xs mt-1">
            {weather.validSources} source{weather.validSources > 1 ? "s" : ""} agrégée{weather.validSources > 1 ? "s" : ""}
          </p>
        </div>
        <span className="text-5xl sm:text-6xl flex-shrink-0 ml-3">{icon}</span>
      </div>

      {/* Température */}
      <div className="flex items-end gap-4 mb-3">
        <span className="text-6xl font-extralight text-slate-800">
          {Math.round(weather.temperature)}°
        </span>
        <div className="mb-1.5">
          <p className="text-slate-400 text-xs">Ressenti</p>
          <p className="text-2xl font-light text-slate-600">{Math.round(weather.feelsLike)}°</p>
        </div>
      </div>

      <p className="text-slate-500 text-base mb-6 capitalize font-light">{weather.description}</p>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon="💧" label="Humidité"       value={formatHumidity(weather.humidity)} />
        <Stat icon="💨" label={`Vent ${windDir}`} value={formatWind(weather.windSpeed)} />
        <Stat icon="🌧️" label="Précipitations"  value={formatPrecipitation(weather.precipitation)} />
        <Stat icon="📊" label="Pression"        value={formatPressure(weather.pressure)} />
        {weather.uvIndex > 0 && (
          <Stat icon="☀️" label="Indice UV" value={weather.uvIndex.toFixed(1)} />
        )}
      </div>

      <p className="text-slate-300 text-xs mt-5 text-right">
        {new Date(weather.fetchedAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 flex flex-col gap-1 border border-slate-100">
      <span className="text-xl">{icon}</span>
      <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-slate-700 text-base font-medium">{value}</span>
    </div>
  );
}
