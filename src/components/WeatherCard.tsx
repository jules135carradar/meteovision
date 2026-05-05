"use client";

import { AggregatedWeather } from "@/lib/types";
import { getWeatherIcon, getWindDirection } from "@/lib/weather-codes";
import { formatTemp, formatWind, formatHumidity, formatPressure, formatPrecipitation } from "@/lib/utils";

interface Props {
  weather: AggregatedWeather;
}

export default function WeatherCard({ weather }: Props) {
  const icon = getWeatherIcon(weather.weatherCode);
  const windDir = getWindDirection(weather.windDirection);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8">
      {/* En-tête ville */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {weather.location.name}
          </h1>
          {weather.location.admin1 && (
            <p className="text-sky-300 mt-1">{weather.location.admin1}</p>
          )}
          <p className="text-sky-200 text-sm mt-1">
            Agrégation de {weather.validSources} source{weather.validSources > 1 ? "s" : ""} sur{" "}
            {weather.sources.length}
          </p>
        </div>
        <div className="text-6xl md:text-7xl">{icon}</div>
      </div>

      {/* Température principale */}
      <div className="flex items-end gap-4 mb-6">
        <span className="text-6xl md:text-7xl font-thin text-white">
          {Math.round(weather.temperature)}°C
        </span>
        <div className="mb-2 text-sky-300">
          <p className="text-sm">Ressenti</p>
          <p className="text-2xl font-medium">{Math.round(weather.feelsLike)}°C</p>
        </div>
      </div>

      <p className="text-sky-100 text-lg mb-6 capitalize">{weather.description}</p>

      {/* Indicateurs secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Indicator icon="💧" label="Humidité" value={formatHumidity(weather.humidity)} />
        <Indicator
          icon="💨"
          label={`Vent ${windDir}`}
          value={formatWind(weather.windSpeed)}
        />
        <Indicator icon="🌧️" label="Précipitations" value={formatPrecipitation(weather.precipitation)} />
        <Indicator icon="📊" label="Pression" value={formatPressure(weather.pressure)} />
        {weather.uvIndex > 0 && (
          <Indicator icon="☀️" label="Indice UV" value={weather.uvIndex.toFixed(1)} />
        )}
      </div>

      {/* Horodatage */}
      <p className="text-sky-400 text-xs mt-6 text-right">
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

function Indicator({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-sky-300 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-white text-lg font-semibold">{value}</span>
    </div>
  );
}
