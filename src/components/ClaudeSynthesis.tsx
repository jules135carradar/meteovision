"use client";

import { useState, useEffect } from "react";
import { AggregatedWeather } from "@/lib/types";

export default function ClaudeSynthesis({ weather, metier }: { weather: AggregatedWeather; metier: string }) {
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch("/api/synthesis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, metier }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setSynthesis(d.synthesis); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [weather.location.name, metier]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-teal-100/70">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-lg">🤖</div>
        <div>
          <p className="text-slate-700 font-medium text-sm">Analyse IA</p>
          <p className="text-slate-400 text-xs">Claude · {weather.validSources} sources analysées</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-light">Analyse en cours...</span>
        </div>
      )}
      {!loading && error && (
        <p className="text-slate-400 text-sm font-light italic">Synthèse temporairement indisponible.</p>
      )}
      {!loading && synthesis && (
        <p className="text-slate-600 leading-relaxed font-light">{synthesis}</p>
      )}

      <p className="text-teal-300 text-xs mt-4">Propulsé par Claude · Anthropic</p>
    </div>
  );
}
