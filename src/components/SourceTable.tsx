"use client";

import { useState } from "react";
import { WeatherSourceResult } from "@/lib/types";

interface Props {
  sources: WeatherSourceResult[];
}

export default function SourceTable({ sources }: Props) {
  const [expanded, setExpanded] = useState(false);

  const activeSources = sources.filter((s) => s.error !== "Clé API non configurée");
  const displayed = expanded ? activeSources : activeSources.slice(0, 4);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📡 Sources consultées
        <span className="text-sm font-normal text-sky-300">
          ({activeSources.filter((s) => !s.error).length}/{activeSources.length})
        </span>
      </h2>

      {/* Vue mobile : cartes empilées */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayed.map((source) => (
          <SourceCard key={source.source} source={source} />
        ))}
      </div>

      {/* Vue desktop : tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-sky-300 border-b border-white/10">
              <th className="text-left pb-3 font-medium">Source</th>
              <th className="text-center pb-3 font-medium">Réputation</th>
              <th className="text-center pb-3 font-medium">Temp.</th>
              <th className="text-center pb-3 font-medium">Vent</th>
              <th className="text-center pb-3 font-medium">Humidité</th>
              <th className="text-center pb-3 font-medium">Pluie</th>
              <th className="text-left pb-3 font-medium">État</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((source) => (
              <SourceRow key={source.source} source={source} />
            ))}
          </tbody>
        </table>
      </div>

      {activeSources.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sky-400 hover:text-sky-200 text-sm transition-colors min-h-[44px] flex items-center"
        >
          {expanded ? "▲ Afficher moins" : `▼ Voir toutes les sources (${activeSources.length})`}
        </button>
      )}

      <p className="text-sky-400 text-xs mt-4">
        Sources citées conformément aux conditions d'utilisation de chaque fournisseur.
      </p>
    </div>
  );
}

function SourceCard({ source }: { source: WeatherSourceResult }) {
  const score = source.reputation;
  const scoreColor = score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const barColor = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const isError = !!source.error;

  return (
    <div className={`bg-white/5 rounded-2xl p-4 ${isError ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-300 font-semibold text-sm hover:text-white transition-colors"
        >
          {source.displayName}
        </a>
        <div className="flex items-center gap-2">
          <div className="w-16 bg-white/10 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
          </div>
          <span className={`font-bold text-sm ${scoreColor}`}>{score}%</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <MiniStat label="Temp." value={source.temperature !== null ? `${source.temperature.toFixed(1)}°` : "—"} />
        <MiniStat label="Vent" value={source.windSpeed !== null ? `${Math.round(source.windSpeed)}km/h` : "—"} />
        <MiniStat label="Hum." value={source.humidity !== null ? `${Math.round(source.humidity)}%` : "—"} />
        <MiniStat label="Pluie" value={source.precipitation !== null ? `${source.precipitation.toFixed(1)}mm` : "—"} />
      </div>
      {isError && <p className="text-red-400 text-xs mt-2 text-center">Source indisponible</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sky-400 text-xs">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  );
}

function SourceRow({ source }: { source: WeatherSourceResult }) {
  const score = source.reputation;
  const scoreColor = score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const barColor = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const isError = !!source.error;

  return (
    <tr className={`border-b border-white/5 hover:bg-white/5 ${isError ? "opacity-50" : ""}`}>
      <td className="py-3 pr-4">
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-white font-medium transition-colors">
          {source.displayName}
        </a>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`font-bold ${scoreColor}`}>{score}%</span>
          <div className="w-16 bg-white/10 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-center text-white">{source.temperature !== null ? `${source.temperature.toFixed(1)}°C` : "—"}</td>
      <td className="py-3 px-2 text-center text-white">{source.windSpeed !== null ? `${Math.round(source.windSpeed)} km/h` : "—"}</td>
      <td className="py-3 px-2 text-center text-white">{source.humidity !== null ? `${Math.round(source.humidity)}%` : "—"}</td>
      <td className="py-3 px-2 text-center text-white">{source.precipitation !== null ? `${source.precipitation.toFixed(1)} mm` : "—"}</td>
      <td className="py-3 pl-2">{isError ? <span className="text-red-400 text-xs">Indisponible</span> : <span className="text-green-400 text-xs">✓ OK</span>}</td>
    </tr>
  );
}
