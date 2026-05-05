"use client";

import { AggregatedDailyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";
import { formatDate } from "@/lib/utils";

interface Props {
  daily: AggregatedDailyForecast[];
}

export default function DailyForecast({ daily }: Props) {
  if (daily.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Prévisions 7 jours</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.map((day, i) => (
          <DayCard key={day.date} day={day} isToday={i === 0} />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  day,
  isToday,
}: {
  day: AggregatedDailyForecast;
  isToday: boolean;
}) {
  const icon = getWeatherIcon(day.weatherCode);

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors ${
        isToday
          ? "bg-sky-600/40 border border-sky-400/30"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <span className="text-xs text-sky-300 font-medium capitalize">
        {isToday ? "Aujourd'hui" : formatDate(day.date)}
      </span>
      <span className="text-2xl">{icon}</span>
      <div className="text-center">
        <p className="text-white font-bold">{Math.round(day.tempMax)}°</p>
        <p className="text-sky-400 text-sm">{Math.round(day.tempMin)}°</p>
      </div>
      {day.precipitation > 0.5 && (
        <p className="text-blue-300 text-xs">{day.precipitation.toFixed(1)} mm</p>
      )}
      {day.windSpeed > 20 && (
        <p className="text-gray-300 text-xs">{Math.round(day.windSpeed)} km/h</p>
      )}
    </div>
  );
}
