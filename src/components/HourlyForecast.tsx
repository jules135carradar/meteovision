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
    <div className="forecast-table-wrap">
      <div className="forecast-table-title">Heure par heure</div>
      <div style={{ overflowX: "auto" }}>
        <table className="forecast-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr>
              <th>Heure</th>
              <th></th>
              <th>Température</th>
              <th>Ressenti</th>
              <th>Humidité</th>
              <th>Pluie</th>
              <th>Probabilité</th>
              <th>Vent</th>
            </tr>
          </thead>
          <tbody>
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

  const rowClass = isNow ? "is-now" : isNight ? "is-night" : "";

  return (
    <tr className={rowClass}>
      <td style={{ color: isNow ? "#059669" : undefined }}>{isNow ? "Maintenant" : hrLabel}</td>
      <td style={{ fontSize: 16 }}>{getWeatherIcon(hour.weatherCode, localHour)}</td>
      <td className="temp">{Math.round(hour.temperature)}°</td>
      <td>{Math.round(hour.feelsLike)}°</td>
      <td>{hour.humidity > 0 ? `${Math.round(hour.humidity)} %` : <span className="dash">—</span>}</td>
      <td>
        {hour.precipitation > 0.05
          ? <span className="rain">{hour.precipitation.toFixed(1)} mm</span>
          : <span className="dash">—</span>}
      </td>
      <td>
        {hour.precipitationProbability > 5
          ? `${Math.round(hour.precipitationProbability)} %`
          : <span className="dash">—</span>}
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        {Math.round(hour.windSpeed)} km/h
        {hour.windDirection > 0 && (
          <span style={{ color: "#94a3b8", marginLeft: 4, fontWeight: 500 }}>
            {windDir(hour.windDirection)}
          </span>
        )}
      </td>
    </tr>
  );
}
