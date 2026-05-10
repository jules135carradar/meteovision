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

import { YesterdaySlot } from "@/lib/types";

async function fetchYesterdaySlots(lat: number, lon: number): Promise<YesterdaySlot[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,precipitation,weather_code&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const times: string[]           = data.hourly?.time           ?? [];
    const temps: (number | null)[]  = data.hourly?.temperature_2m ?? [];
    const precips: (number | null)[] = data.hourly?.precipitation  ?? [];
    const codes: (number | null)[]  = data.hourly?.weather_code   ?? [];

    const slotDefs = [
      { label: "Nuit",       hours: "0h – 6h",   from: 0,  to: 6,  repH: 2  },
      { label: "Matin",      hours: "6h – 12h",  from: 6,  to: 12, repH: 9  },
      { label: "Après-midi", hours: "12h – 18h", from: 12, to: 18, repH: 15 },
      { label: "Soirée",     hours: "18h – 23h", from: 18, to: 23, repH: 20 },
    ];

    const result: YesterdaySlot[] = [];
    for (const { label, hours: hoursLabel, from, to, repH } of slotDefs) {
      const entries = times.map((t, i) => ({ h: parseInt(t.slice(11, 13)), temp: temps[i], precip: precips[i], code: codes[i] }))
                          .filter(e => e.h >= from && e.h < to);
      if (entries.length === 0) continue;
      const validTemps = entries.map(e => e.temp).filter((t): t is number => t !== null);
      if (validTemps.length === 0) continue;
      const codeCounts: Record<number, number> = {};
      for (const e of entries) { if (e.code !== null) codeCounts[e.code] = (codeCounts[e.code] ?? 0) + 1; }
      const dominant = Object.entries(codeCounts).sort((a, b) => b[1] - a[1])[0];
      result.push({
        label,
        hours: hoursLabel,
        weatherCode: dominant ? parseInt(dominant[0]) : 0,
        representativeHour: repH,
        tempMin: Math.round(Math.min(...validTemps)),
        tempMax: Math.round(Math.max(...validTemps)),
        precipitation: entries.reduce((s, e) => s + (e.precip ?? 0), 0),
      });
    }
    return result;
  } catch { return []; }
}

async function fetchWinklerIndex(lat: number, lon: number): Promise<number> {
  try {
    const today = new Date();
    const year  = today.getFullYear();
    const april1 = new Date(year, 3, 1);
    if (today < april1) return 0;
    const oct31  = new Date(year, 10, 1);
    const endDate = today < oct31 ? today : oct31;
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const start = fmt(april1);
    const end   = fmt(new Date(endDate.getTime() - 86400000));
    if (start >= end) return 0;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return 0;
    const data = await res.json();
    const tmax: (number | null)[] = data.daily?.temperature_2m_max ?? [];
    const tmin: (number | null)[] = data.daily?.temperature_2m_min ?? [];
    let gdd = 0;
    for (let i = 0; i < tmax.length; i++) {
      const mx = tmax[i], mn = tmin[i];
      if (mx !== null && mn !== null) gdd += Math.max(0, (mx + mn) / 2 - 10);
    }
    return Math.round(gdd);
  } catch { return 0; }
}

async function fetchSoilData(lat: number, lon: number): Promise<{ soilTemperature: number | null; soilMoisture: number | null }> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm&forecast_days=1&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { soilTemperature: null, soilMoisture: null };
    const data  = await res.json();
    const hour  = new Date().getHours();
    const temps: (number | null)[]    = data.hourly?.soil_temperature_0cm    ?? [];
    const moisture: (number | null)[] = data.hourly?.soil_moisture_0_to_1cm  ?? [];
    const soilTemp = temps[hour] ?? null;
    const raw = moisture[hour];
    return {
      soilTemperature: soilTemp !== null ? Math.round(soilTemp * 10) / 10 : null,
      soilMoisture:    raw !== null && raw !== undefined ? Math.round((raw as number) * 100) : null,
    };
  } catch { return { soilTemperature: null, soilMoisture: null }; }
}

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
  const [ecmwf, gfs, icon, mf, ukmo, gem, yrno, wttr, owm, wapi, histResult, slotsResult, winklerResult, soilResult] = await Promise.allSettled([
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
    fetchYesterdaySlots(lat, lon),
    fetchWinklerIndex(lat, lon),
    fetchSoilData(lat, lon),
  ]);

  const historicalPrecip = histResult.status    === "fulfilled" ? histResult.value    : [];
  const yesterdaySlots   = slotsResult.status   === "fulfilled" ? slotsResult.value   : [];
  const winklerIndex     = winklerResult.status  === "fulfilled" ? winklerResult.value  : 0;
  const soilData         = soilResult.status     === "fulfilled" ? soilResult.value     : { soilTemperature: null, soilMoisture: null };

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

  return NextResponse.json({ ...aggregated, historicalPrecip, yesterdaySlots, winklerIndex, ...soilData }, {
    headers: {
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    },
  });
}
