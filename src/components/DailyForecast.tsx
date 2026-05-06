"use client";

import { AggregatedDailyForecast } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";
import { formatDate } from "@/lib/utils";

export default function DailyForecast({ daily }: { daily: AggregatedDailyForecast[] }) {
  if (daily.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100/70">
      <h2 className="text-base font-medium text-slate-700 mb-4">7 jours</h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-7 md:overflow-visible">
        {daily.map((day, i) => <DayCard key={day.date} day={day} isToday={i === 0} />)}
      </div>
    </div>
  );
}

function DayCard({ day, isToday }: { day: AggregatedDailyForecast; isToday: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 flex-shrink-0 w-[80px] md:w-auto border transition-colors ${
      isToday ? "bg-sky-50 border-sky-100" : "bg-slate-50/60 border-transparent hover:bg-slate-100"
    }`}>
      <span className={`text-xs font-medium capitalize ${isToday ? "text-sky-500" : "text-slate-400"}`}>
        {isToday ? "Auj." : formatDate(day.date)}
      </span>
      <span className="text-2xl">{getWeatherIcon(day.weatherCode)}</span>
      <div className="text-center">
        <p className="text-slate-700 font-medium text-sm">{Math.round(day.tempMax)}°</p>
        <p className="text-slate-400 text-xs">{Math.round(day.tempMin)}°</p>
      </div>
      {day.precipitation > 0.5 && (
        <p className="text-sky-400 text-xs">{day.precipitation.toFixed(1)}mm</p>
      )}
    </div>
  );
}
