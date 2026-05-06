"use client";

import { AggregatedWeather } from "@/lib/types";
import { getWeatherIcon, getWindDirection } from "@/lib/weather-codes";
import { formatWind, formatHumidity, formatPressure, formatPrecipitation } from "@/lib/utils";

export default function WeatherCard({ weather }: { weather: AggregatedWeather }) {
  const icon    = getWeatherIcon(weather.weatherCode, new Date().getHours());
  const windDir = getWindDirection(weather.windDirection);

  return (
    <div className="py-4 px-1">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-slate-800 leading-tight">
            {weather.location.name}
          </h1>
          {weather.location.admin1 && (
            <p className="text-slate-400 text-sm mt-0.5">{weather.location.admin1}</p>
          )}
        </div>
        <span className="text-6xl sm:text-7xl flex-shrink-0 ml-3 leading-none">{icon}</span>
      </div>

      {/* Température */}
      <div className="flex items-end gap-5 mb-2">
        <span className="text-7xl sm:text-8xl font-extralight text-slate-800 leading-none">
          {Math.round(weather.temperature)}°
        </span>
        <div className="mb-2">
          <p className="text-slate-400 text-xs">Ressenti</p>
          <p className="text-2xl font-light text-slate-500">{Math.round(weather.feelsLike)}°</p>
        </div>
      </div>

      <p className="text-slate-500 text-base mb-6 capitalize font-light">{weather.description}</p>

      {/* Stats — grille ouverte sans boîtes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 pt-5 border-t border-slate-100">
        <Stat label={`Vent ${windDir}`} value={formatWind(weather.windSpeed)} />
        <Stat label="Humidité"          value={formatHumidity(weather.humidity)} />
        <Stat label="Précipitations"    value={formatPrecipitation(weather.precipitation)} />
        <Stat label="Pression"          value={formatPressure(weather.pressure)} />
        {weather.uvIndex > 0 && (
          <Stat label="Indice UV" value={weather.uvIndex.toFixed(1)} />
        )}
      </div>

      <p className="text-slate-300 text-xs mt-5">
        {weather.validSources} source{weather.validSources > 1 ? "s" : ""} agrégée{weather.validSources > 1 ? "s" : ""} ·{" "}
        {new Date(weather.fetchedAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
