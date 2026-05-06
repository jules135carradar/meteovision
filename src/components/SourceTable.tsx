"use client";

import { useState } from "react";
import { WeatherSourceResult } from "@/lib/types";

export default function SourceTable({ sources }: { sources: WeatherSourceResult[] }) {
  const [expanded, setExpanded] = useState(false);
  const active    = sources.filter((s) => s.error !== "Clé API non configurée");
  const displayed = expanded ? active : active.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm">
      <h2 className="text-base font-medium text-slate-700 mb-1 flex items-center gap-2">
        Sources consultées
        <span className="text-xs font-normal text-slate-400">
          ({active.filter((s) => !s.error).length}/{active.length} actives)
        </span>
      </h2>
      <p className="text-slate-300 text-xs mb-4">Sources citées conformément à leurs conditions d'utilisation.</p>

      {/* Mobile — cartes */}
      <div className="flex flex-col gap-2 md:hidden">
        {displayed.map((s) => <SourceCard key={s.source} source={s} />)}
      </div>

      {/* Desktop — tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100 text-xs uppercase tracking-wide">
              <th className="text-left pb-3 font-medium">Source</th>
              <th className="text-center pb-3 font-medium">Score</th>
              <th className="text-center pb-3 font-medium">Temp.</th>
              <th className="text-center pb-3 font-medium">Vent</th>
              <th className="text-center pb-3 font-medium">Hum.</th>
              <th className="text-center pb-3 font-medium">Pluie</th>
              <th className="text-left pb-3 font-medium">État</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((s) => <SourceRow key={s.source} source={s} />)}
          </tbody>
        </table>
      </div>

      {active.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-emerald-500 hover:text-emerald-600 text-sm transition-colors min-h-[44px] flex items-center"
        >
          {expanded ? "▲ Moins" : `▼ Toutes les sources (${active.length})`}
        </button>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-400" : score >= 50 ? "bg-emerald-400" : "bg-red-400";
  const text  = score >= 70 ? "text-green-500" : score >= 50 ? "text-emerald-500" : "text-red-500";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-medium text-xs ${text}`}>{score}%</span>
      <div className="w-14 bg-slate-100 rounded-full h-1">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SourceCard({ source: s }: { source: WeatherSourceResult }) {
  return (
    <div className={`bg-slate-50 rounded-2xl p-4 border border-slate-100 ${s.error ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 font-medium text-sm hover:text-emerald-500 transition-colors">{s.displayName}</a>
        <ScoreBar score={s.reputation} />
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: "Temp.", v: s.temperature !== null ? `${s.temperature.toFixed(1)}°` : "—" },
          { l: "Vent",  v: s.windSpeed !== null ? `${Math.round(s.windSpeed)}km/h` : "—" },
          { l: "Hum.",  v: s.humidity !== null ? `${Math.round(s.humidity)}%` : "—" },
          { l: "Pluie", v: s.precipitation !== null ? `${s.precipitation.toFixed(1)}mm` : "—" },
        ].map(({ l, v }) => (
          <div key={l}>
            <p className="text-slate-400 text-xs">{l}</p>
            <p className="text-slate-700 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceRow({ source: s }: { source: WeatherSourceResult }) {
  return (
    <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${s.error ? "opacity-50" : ""}`}>
      <td className="py-3 pr-4">
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-emerald-500 font-medium transition-colors text-sm">{s.displayName}</a>
      </td>
      <td className="py-3 px-2 text-center"><ScoreBar score={s.reputation} /></td>
      <td className="py-3 px-2 text-center text-slate-600 text-sm">{s.temperature !== null ? `${s.temperature.toFixed(1)}°C` : "—"}</td>
      <td className="py-3 px-2 text-center text-slate-600 text-sm">{s.windSpeed !== null ? `${Math.round(s.windSpeed)} km/h` : "—"}</td>
      <td className="py-3 px-2 text-center text-slate-600 text-sm">{s.humidity !== null ? `${Math.round(s.humidity)}%` : "—"}</td>
      <td className="py-3 px-2 text-center text-slate-600 text-sm">{s.precipitation !== null ? `${s.precipitation.toFixed(1)} mm` : "—"}</td>
      <td className="py-3 pl-2 text-xs">{s.error ? <span className="text-red-400">Indisponible</span> : <span className="text-green-500">✓ OK</span>}</td>
    </tr>
  );
}
