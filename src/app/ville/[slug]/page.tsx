"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AggregatedWeather } from "@/lib/types";
import WeatherCard from "@/components/WeatherCard";
import SourceTable from "@/components/SourceTable";
import DivergenceAlert from "@/components/DivergenceAlert";
import ClaudeSynthesis from "@/components/ClaudeSynthesis";
import DailyForecast from "@/components/DailyForecast";
import ProModeIndicators from "@/components/ProModeIndicators";
import VoteButton from "@/components/VoteButton";
import MetierSelector from "@/components/MetierSelector";
import SearchBar from "@/components/SearchBar";

export default function VillePage() {
  const params = useSearchParams();
  const lat = params.get("lat");
  const lon = params.get("lon");
  const city = params.get("city") ?? "Ville";
  const admin1 = params.get("admin1") ?? "";

  const [weather, setWeather] = useState<AggregatedWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metier, setMetier] = useState<string>("grand_public");

  useEffect(() => {
    // Restaurer le métier depuis localStorage
    const saved = localStorage.getItem("meteo_metier");
    if (saved) setMetier(saved);
  }, []);

  function handleMetierChange(m: string) {
    setMetier(m);
    localStorage.setItem("meteo_metier", m);
  }

  useEffect(() => {
    if (!lat || !lon) {
      setError("Coordonnées manquantes. Veuillez rechercher à nouveau votre ville.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadWeather() {
      setLoading(true);
      setError(null);
      try {
        const url =
          `/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&admin1=${encodeURIComponent(admin1)}`;
        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Erreur HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setWeather(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeather();
    return () => { cancelled = true; };
  }, [lat, lon, city, admin1]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Barre de recherche compacte */}
      <div className="max-w-md">
        <SearchBar />
      </div>

      {loading && <LoadingSkeleton city={city} />}

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-300 font-semibold mt-3">{error}</p>
        </div>
      )}

      {weather && !loading && (
        <>
          {/* Sélecteur de métier */}
          <MetierSelector value={metier} onChange={handleMetierChange} />

          {/* Carte météo principale */}
          <WeatherCard weather={weather} />

          {/* Alertes divergences */}
          {weather.divergences.length > 0 && (
            <DivergenceAlert divergences={weather.divergences} />
          )}

          {/* Indicateurs pro */}
          <ProModeIndicators weather={weather} metier={metier} />

          {/* Synthèse Claude */}
          <ClaudeSynthesis weather={weather} metier={metier} />

          {/* Prévisions 7 jours */}
          <DailyForecast daily={weather.daily} />

          {/* Tableau des sources */}
          <SourceTable sources={weather.sources} />

          {/* Vote */}
          <VoteButton ville={city} metier={metier} />
        </>
      )}
    </div>
  );
}

function LoadingSkeleton({ city }: { city: string }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white/10 rounded-3xl p-8">
        <div className="flex justify-between mb-6">
          <div>
            <div className="h-9 bg-white/20 rounded-xl w-48 mb-2" />
            <div className="h-4 bg-white/10 rounded w-32" />
          </div>
          <div className="h-16 w-16 bg-white/20 rounded-full" />
        </div>
        <div className="h-16 bg-white/20 rounded-xl w-40 mb-4" />
        <p className="text-sky-300 mb-6">Chargement des données pour {city}...</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 h-24" />
          ))}
        </div>
      </div>
      <div className="bg-white/10 rounded-3xl p-6 h-32" />
      <div className="bg-white/10 rounded-3xl p-6 h-48" />
    </div>
  );
}
