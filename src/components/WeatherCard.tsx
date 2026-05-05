"use client";

import { AggregatedWeather } from "@/lib/types";
import { getWeatherIcon, getWindDirection } from "@/lib/weather-codes";
import { formatWind, formatHumidity, formatPressure, formatPrecipitation } from "@/lib/utils";

interface Props {
  weather: AggregatedWeather;
}

export default function WeatherCard({ weather }: Props) {
  const icon = getWeatherIcon(weather.weatherCode);
  const windDir = getWindDirection(weather.windDirection);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-8">
      {/* En-tête ville */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            {weather.location.name}
          </h1>
          {weather.location.admin1 && (
            <p className="text-sky-300 mt-1 text-sm">{weather.location.admin1}</p>
          )}
          <p className="text-sky-200 text-xs mt-1">
            {weather.validSources} source{weather.validSources > 1 ? "s" : ""} agrégée{weather.validSources > 1 ? "s" : ""} sur {weather.sources.length}
          </p>
        </div>
        <div className="text-5xl sm:text-6xl md:text-7xl flex-shrink-0 ml-3">{icon}</div>
      </div>

      {/* Température principale */}
      <div className="flex items-end gap-4 mb-4">
        <span className="text-5xl sm:text-6xl md:text-7xl font-thin text-white">
          {Math.round(weather.temperature)}°C
        </span>
        <div className="mb-1 text-sky-300">
          <p className="text-xs">Ressenti</p>
          <p className="text-xl sm:text-2xl font-medium">{Math.round(weather.feelsLike)}°C</p>
        </div>
      </div>

      <p className="text-sky-100 text-base sm:text-lg mb-5 capitalize">{weather.description}</p>

      {/* Indicateurs secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Indicator icon="💧" label="Humidité" value={formatHumidity(weather.humidity)} />
        <Indicator icon="💨" label={`Vent ${windDir}`} value={formatWind(weather.windSpeed)} />
        <Indicator icon="🌧️" label="Précipitations" value={formatPrecipitation(weather.precipitation)} />
        <Indicator icon="📊" label="Pression" value={formatPressure(weather.pressure)} />
        {weather.uvIndex > 0 && (
          <Indicator icon="☀️" label="Indice UV" value={weather.uvIndex.toFixed(1)} />
        )}
      </div>

      <p className="text-sky-400 text-xs mt-5 text-right">
        Données agrégées le{" "}
        {new Date(weather.fetchedAt).toLocaleString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

function Indicator({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-3 sm:p-4 flex flex-col gap-1">
      <span className="text-xl sm:text-2xl">{icon}</span>
      <span className="text-sky-300 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-white text-base sm:text-lg font-semibold">{value}</span>
    </div>
  );
}
