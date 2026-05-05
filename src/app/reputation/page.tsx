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
        <h1 className="text-4xl font-extrabold text-white mt-4 mb-3">
          Réputation des sources météo
        </h1>
        <p className="text-sky-300 max-w-xl mx-auto">
          Les scores sont mis à jour après chaque vote communautaire. Une source fiable voit son
          poids augmenter dans l'agrégation.
        </p>
      </div>

      {/* Explication du système */}
      <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-8 grid sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-400">+5 pts</p>
          <p className="text-sky-300 text-sm mt-1">Vote "Oui, exacte"</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-400">+1 pt</p>
          <p className="text-sky-300 text-sm mt-1">Vote "Partiellement"</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">-5 pts</p>
          <p className="text-sky-300 text-sm mt-1">Vote "Non, incorrecte"</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/10 rounded-2xl h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <ReputationRow key={record.source} record={record} rank={i + 1} />
          ))}
          {records.length === 0 && (
            <div className="text-center text-sky-400 py-16">
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

      <p className="text-sky-500 text-xs text-center mt-8">
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
    score >= 70 ? "bg-green-500" : score >= 50 ? "bg-sky-500" : "bg-red-500";
  const scoreColor =
    score >= 70 ? "text-green-400" : score >= 50 ? "text-sky-400" : "text-red-400";

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-sky-400 w-8 flex-shrink-0">{rankEmoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:text-sky-300 transition-colors truncate"
            >
              {name}
            </a>
            <span className={`font-bold text-xl ml-4 flex-shrink-0 ${scoreColor}`}>
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {record.nb_votes > 0 && (
        <div className="flex gap-4 mt-3 ml-12 text-xs text-sky-400">
          <span>{record.nb_votes} vote{record.nb_votes > 1 ? "s" : ""}</span>
          <span className="text-green-400">✓ {record.nb_correct} corrects</span>
          <span className="text-yellow-400">~ {record.nb_partial} partiels</span>
          <span className="text-red-400">✗ {record.nb_incorrect} incorrects</span>
        </div>
      )}
    </div>
  );
}
