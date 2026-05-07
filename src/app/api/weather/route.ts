import { NextRequest, NextResponse } from "next/server";
import {
  fetchOpenMeteoECMWF,
  fetchOpenMeteoGFS,
  fetchOpenMeteoICON,
  fetchOpenMeteoMF,
  fetchOpenMeteoUKMO,
  fetchOpenMeteoGEM,
  fetchYrNo,
  fetchWttrIn,
  fetchOpenWeatherMap,
  fetchWeatherAPI,
} from "@/lib/weather-sources";
import { aggregate } from "@/lib/aggregator";
import { getReputations } from "@/lib/supabase";
import { Location } from "@/lib/types";

async function fetchHistoricalPrecip(lat: number, lon: number): Promise<{ date: string; precipitation: number }[]> {
  try {
    const today = new Date();
    const end = new Date(today); end.setDate(today.getDate() - 1);
    const start = new Date(today); start.setDate(today.getDate() - 7);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=precipitation_sum&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const dates: string[] = data.daily?.time ?? [];
    const precips: (number | null)[] = data.daily?.precipitation_sum ?? [];
    return dates.map((date, i) => ({ date, precipitation: precips[i] ?? 0 }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lon = parseFloat(params.get("lon") ?? "");
  const city = params.get("city") ?? "Ville inconnue";
  const admin1 = params.get("admin1") ?? "";

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  const location: Location = {
    name: city,
    latitude: lat,
    longitude: lon,
    country: "France",
    admin1,
  };

  // Charger les scores de réputation depuis la base de données
  const reputations = await getReputations();

  // Interroger toutes les sources en parallèle
  const [ecmwf, gfs, icon, mf, ukmo, gem, yrno, wttr, owm, wapi, histResult] = await Promise.allSettled([
    fetchOpenMeteoECMWF(lat, lon, reputations["open-meteo-ecmwf"] ?? 50),
    fetchOpenMeteoGFS(lat, lon, reputations["open-meteo-gfs"] ?? 50),
    fetchOpenMeteoICON(lat, lon, reputations["open-meteo-icon"] ?? 50),
    fetchOpenMeteoMF(lat, lon, reputations["open-meteo-mf"] ?? 50),
    fetchOpenMeteoUKMO(lat, lon, reputations["open-meteo-ukmo"] ?? 50),
    fetchOpenMeteoGEM(lat, lon, reputations["open-meteo-gem"] ?? 50),
    fetchYrNo(lat, lon, reputations["yr-no"] ?? 50),
    fetchWttrIn(lat, lon, reputations["wttr-in"] ?? 50),
    fetchOpenWeatherMap(lat, lon, reputations["openweathermap"] ?? 50),
    fetchWeatherAPI(lat, lon, reputations["weatherapi"] ?? 50),
    fetchHistoricalPrecip(lat, lon),
  ]);

  const historicalPrecip = histResult.status === "fulfilled" ? histResult.value : [];

  const sources = [ecmwf, gfs, icon, mf, ukmo, gem, yrno, wttr, owm, wapi]
    .map((result) => {
      if (result.status === "fulfilled") return result.value;
      // Si la promesse elle-même a rejeté (ne devrait pas arriver)
      return null;
    })
    .filter(Boolean);

  // Filtrer les sources sans erreur de configuration
  const activeSources = sources.filter(
    (s) => s && s.error !== "Clé API non configurée"
  );

  if (activeSources.length === 0) {
    return NextResponse.json(
      { error: "Aucune source météo disponible" },
      { status: 503 }
    );
  }

  const aggregated = aggregate(location, activeSources as NonNullable<typeof activeSources[0]>[]);

  return NextResponse.json({ ...aggregated, historicalPrecip }, {
    headers: {
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    },
  });
}
