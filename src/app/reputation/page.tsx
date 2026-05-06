"use client";

import { useEffect, useState } from "react";
import { ReputationRecord } from "@/lib/types";

const SOURCE_NAMES: Record<string, string> = {
  "open-meteo-ecmwf": "Open-Meteo (ECMWF)",
  "open-meteo-gfs": "Open-Meteo GFS (NOAA)",
  "open-meteo-icon": "Open-Meteo ICON (DWD)",
  "yr-no": "Yr.no",
  "wttr-in": "wttr.in",
  "openweathermap": "OpenWeatherMap",
  "weatherapi": "WeatherAPI.com",
  "tomorrow-io": "Tomorrow.io",
  "visual-crossing": "Visual Crossing",
  "accuweather": "AccuWeather",
  "pirate-weather": "Pirate Weather",
  "meteofrance": "Météo France",
};

const SOURCE_URLS: Record<string, string> = {
  "open-meteo-ecmwf": "https://open-meteo.com",
  "open-meteo-gfs": "https://open-meteo.com",
  "open-meteo-icon": "https://open-meteo.com",
  "yr-no": "https://yr.no",
  "wttr-in": "https://wttr.in",
  "openweathermap": "https://openweathermap.org",
  "weatherapi": "https://weatherapi.com",
  "tomorrow-io": "https://tomorrow.io",
  "visual-crossing": "https://visualcrossing.com",
  "accuweather": "https://accuweather.com",
  "pirate-weather": "https://pirateweather.net",
  "meteofrance": "https://meteofrance.fr",
};

export default function ReputationPage() {
  const [records, setRecords] = useState<ReputationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reputation")
      .then((r) => r.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">📊</span>
        <h1 className="text-4xl font-light text-slate-800 mt-4 mb-3">
          Réputation des sources météo
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto font-light">
          Les scores sont mis à jour après chaque vote communautaire. Une source fiable voit son
          poids augmenter dans l'agrégation.
        </p>
      </div>

      {/* Explication du système */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 mb-8 grid sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-500">+5 pts</p>
          <p className="text-slate-400 text-sm mt-1">Vote "Oui, exacte"</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-500">+1 pt</p>
          <p className="text-slate-400 text-sm mt-1">Vote "Partiellement"</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-500">-5 pts</p>
          <p className="text-slate-400 text-sm mt-1">Vote "Non, incorrecte"</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <ReputationRow key={record.source} record={record} rank={i + 1} />
          ))}
          {records.length === 0 && (
            <div className="text-center text-slate-400 py-16">
              <p className="text-4xl mb-4">🗳️</p>
              <p>Aucun vote enregistré pour l'instant.</p>
              <p className="text-sm mt-2">
                Les scores initiaux sont de 50/100. Votez depuis la page d'une ville pour améliorer
                le système.
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-slate-300 text-xs text-center mt-8">
        Score initial de chaque source : 50/100 · Les professionnels terrain ont un poids 1,5× dans
        les votes · Limité à 1 vote par IP par ville par jour
      </p>
    </div>
  );
}

function ReputationRow({
  record,
  rank,
}: {
  record: ReputationRecord;
  rank: number;
}) {
  const score = record.score;
  const name = SOURCE_NAMES[record.source] ?? record.source;
  const url = SOURCE_URLS[record.source] ?? "#";
  const barColor =
    score >= 70 ? "bg-green-400" : score >= 50 ? "bg-emerald-400" : "bg-red-400";
  const scoreColor =
    score >= 70 ? "text-green-500" : score >= 50 ? "text-emerald-500" : "text-red-500";

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-slate-500 w-8 flex-shrink-0">{rankEmoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 font-medium hover:text-emerald-500 transition-colors truncate"
            >
              {name}
            </a>
            <span className={`font-bold text-xl ml-4 flex-shrink-0 ${scoreColor}`}>
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {record.nb_votes > 0 && (
        <div className="flex gap-4 mt-3 ml-12 text-xs text-slate-400">
          <span>{record.nb_votes} vote{record.nb_votes > 1 ? "s" : ""}</span>
          <span className="text-green-500">✓ {record.nb_correct} corrects</span>
          <span className="text-amber-500">~ {record.nb_partial} partiels</span>
          <span className="text-red-500">✗ {record.nb_incorrect} incorrects</span>
        </div>
      )}
    </div>
  );
}
