"use client";

import { useState, useEffect } from "react";
import { AggregatedWeather } from "@/lib/types";

interface Props {
  weather: AggregatedWeather;
  metier: string;
}

export default function ClaudeSynthesis({ weather, metier }: Props) {
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/synthesis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weather, metier }),
        });
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        if (!cancelled) setSynthesis(data.synthesis);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [weather.location.name, metier]);

  return (
    <div className="bg-gradient-to-br from-violet-900/40 to-sky-900/40 backdrop-blur-md border border-violet-500/30 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <div>
          <h2 className="text-lg font-bold text-white">Analyse IA — Claude</h2>
          <p className="text-violet-300 text-xs">Synthèse intelligente des {weather.validSources} sources</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-sky-300">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Claude analyse les données...</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-sky-200 text-sm italic">
          Synthèse temporairement indisponible. Consultez les données ci-dessous.
        </p>
      )}

      {!loading && synthesis && (
        <p className="text-sky-100 leading-relaxed">{synthesis}</p>
      )}

      <p className="text-violet-400 text-xs mt-4">
        Propulsé par Claude (Anthropic) · Les prévisions restent indicatives
      </p>
    </div>
  );
}
