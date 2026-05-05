import { WeatherSourceResult, DailyForecast, HourlyForecast } from "./types";
import { getWeatherDescription } from "./weather-codes";

const USER_AGENT = "MeteoAgregee/1.0 (contact@meteoagregee.fr)";

// Parse "YYYY-MM-DDTHH:MM" from Open-Meteo (timezone=UTC) into a proper UTC Date.
// Using Date.UTC avoids any server-timezone ambiguity.
function parseOpenMeteoUTC(s: string): Date {
  const [d, t] = s.split("T");
  const [yr, mo, da] = d.split("-").map(Number);
  const [hr] = t.split(":").map(Number);
  return new Date(Date.UTC(yr, mo - 1, da, hr, 0, 0, 0));
}

// Current UTC hour boundary — used to filter past slots while keeping the current hour.
function currentUTCHourStart(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), n.getUTCHours(), 0, 0, 0));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ────────────────────────────────────────────────────────────
// Open-Meteo ECMWF (source principale, modèle européen)
// ────────────────────────────────────────────────────────────
export async function fetchOpenMeteoECMWF(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "open-meteo-ecmwf",
    displayName: "Open-Meteo (ECMWF)",
    url: "https://open-meteo.com",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weathercode,surface_pressure,uv_index,visibility` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
      `&timezone=UTC&forecast_days=2`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const c = data.current;
    base.temperature = c.temperature_2m ?? null;
    base.feelsLike = c.apparent_temperature ?? null;
    base.humidity = c.relative_humidity_2m ?? null;
    base.windSpeed = c.wind_speed_10m ?? null;
    base.windDirection = c.wind_direction_10m ?? null;
    base.precipitation = c.precipitation ?? null;
    base.weatherCode = c.weathercode ?? null;
    base.pressure = c.surface_pressure ?? null;
    base.uvIndex = c.uv_index ?? null;
    base.visibility = c.visibility ? c.visibility / 1000 : null;
    base.description = getWeatherDescription(base.weatherCode);

    if (data.daily) {
      const d = data.daily;
      for (let i = 0; i < (d.time?.length ?? 0); i++) {
        base.daily.push({
          date: d.time[i],
          tempMax: d.temperature_2m_max?.[i] ?? null,
          tempMin: d.temperature_2m_min?.[i] ?? null,
          precipitation: d.precipitation_sum?.[i] ?? null,
          windSpeed: d.wind_speed_10m_max?.[i] ?? null,
          weatherCode: d.weathercode?.[i] ?? null,
        });
      }
    }

    if (data.hourly) {
      const h = data.hourly;
      const hourStart = currentUTCHourStart();
      for (let i = 0; i < (h.time?.length ?? 0); i++) {
        const t = parseOpenMeteoUTC(h.time[i]);
        if (t < hourStart || base.hourly.length >= 24) continue;
        base.hourly.push({
          time: t.toISOString(),
          temperature: h.temperature_2m?.[i] ?? null,
          feelsLike: h.apparent_temperature?.[i] ?? null,
          precipitation: h.precipitation?.[i] ?? null,
          precipitationProbability: h.precipitation_probability?.[i] ?? null,
          windSpeed: h.wind_speed_10m?.[i] ?? null,
          weatherCode: h.weathercode?.[i] ?? null,
        });
      }
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// Open-Meteo GFS (modèle américain NOAA)
// ────────────────────────────────────────────────────────────
export async function fetchOpenMeteoGFS(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "open-meteo-gfs",
    displayName: "Open-Meteo GFS (NOAA)",
    url: "https://open-meteo.com",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&models=gfs_seamless` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weathercode,surface_pressure` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
      `&timezone=UTC&forecast_days=2`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const c = data.current;
    base.temperature = c.temperature_2m ?? null;
    base.feelsLike = c.apparent_temperature ?? null;
    base.humidity = c.relative_humidity_2m ?? null;
    base.windSpeed = c.wind_speed_10m ?? null;
    base.windDirection = c.wind_direction_10m ?? null;
    base.precipitation = c.precipitation ?? null;
    base.weatherCode = c.weathercode ?? null;
    base.pressure = c.surface_pressure ?? null;
    base.description = getWeatherDescription(base.weatherCode);

    if (data.daily) {
      const d = data.daily;
      for (let i = 0; i < (d.time?.length ?? 0); i++) {
        base.daily.push({
          date: d.time[i],
          tempMax: d.temperature_2m_max?.[i] ?? null,
          tempMin: d.temperature_2m_min?.[i] ?? null,
          precipitation: d.precipitation_sum?.[i] ?? null,
          windSpeed: d.wind_speed_10m_max?.[i] ?? null,
          weatherCode: d.weathercode?.[i] ?? null,
        });
      }
    }

    if (data.hourly) {
      const h = data.hourly;
      const now = new Date();
      for (let i = 0; i < (h.time?.length ?? 0); i++) {
        const t = new Date(h.time[i] + "Z");
        if (t < now || base.hourly.length >= 24) continue;
        base.hourly.push({
          time: t.toISOString(),
          temperature: h.temperature_2m?.[i] ?? null,
          feelsLike: h.apparent_temperature?.[i] ?? null,
          precipitation: h.precipitation?.[i] ?? null,
          precipitationProbability: h.precipitation_probability?.[i] ?? null,
          windSpeed: h.wind_speed_10m?.[i] ?? null,
          weatherCode: h.weathercode?.[i] ?? null,
        });
      }
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// Open-Meteo ICON (modèle allemand DWD)
// ────────────────────────────────────────────────────────────
export async function fetchOpenMeteoICON(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "open-meteo-icon",
    displayName: "Open-Meteo ICON (DWD)",
    url: "https://open-meteo.com",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&models=icon_seamless` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weathercode,surface_pressure` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
      `&timezone=UTC&forecast_days=2`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const c = data.current;
    base.temperature = c.temperature_2m ?? null;
    base.feelsLike = c.apparent_temperature ?? null;
    base.humidity = c.relative_humidity_2m ?? null;
    base.windSpeed = c.wind_speed_10m ?? null;
    base.windDirection = c.wind_direction_10m ?? null;
    base.precipitation = c.precipitation ?? null;
    base.weatherCode = c.weathercode ?? null;
    base.pressure = c.surface_pressure ?? null;
    base.description = getWeatherDescription(base.weatherCode);

    if (data.daily) {
      const d = data.daily;
      for (let i = 0; i < (d.time?.length ?? 0); i++) {
        base.daily.push({
          date: d.time[i],
          tempMax: d.temperature_2m_max?.[i] ?? null,
          tempMin: d.temperature_2m_min?.[i] ?? null,
          precipitation: d.precipitation_sum?.[i] ?? null,
          windSpeed: d.wind_speed_10m_max?.[i] ?? null,
          weatherCode: d.weathercode?.[i] ?? null,
        });
      }
    }

    if (data.hourly) {
      const h = data.hourly;
      const hourStart = currentUTCHourStart();
      for (let i = 0; i < (h.time?.length ?? 0); i++) {
        const t = parseOpenMeteoUTC(h.time[i]);
        if (t < hourStart || base.hourly.length >= 24) continue;
        base.hourly.push({
          time: t.toISOString(),
          temperature: h.temperature_2m?.[i] ?? null,
          feelsLike: h.apparent_temperature?.[i] ?? null,
          precipitation: h.precipitation?.[i] ?? null,
          precipitationProbability: h.precipitation_probability?.[i] ?? null,
          windSpeed: h.wind_speed_10m?.[i] ?? null,
          weatherCode: h.weathercode?.[i] ?? null,
        });
      }
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// Open-Meteo générique — Météo France, UK Met Office, GEM Canada
// ────────────────────────────────────────────────────────────
async function fetchOpenMeteoModel(
  lat: number, lon: number, reputation: number,
  sourceId: string, displayName: string, model: string
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: sourceId, displayName, url: "https://open-meteo.com",
    temperature: null, feelsLike: null, humidity: null, windSpeed: null,
    windDirection: null, precipitation: null, description: null,
    weatherCode: null, pressure: null, uvIndex: null, visibility: null,
    daily: [], hourly: [], reputation,
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&models=${model}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weathercode,surface_pressure` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
      `&timezone=UTC&forecast_days=2`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const c = data.current;
    base.temperature = c.temperature_2m ?? null;
    base.feelsLike = c.apparent_temperature ?? null;
    base.humidity = c.relative_humidity_2m ?? null;
    base.windSpeed = c.wind_speed_10m ?? null;
    base.windDirection = c.wind_direction_10m ?? null;
    base.precipitation = c.precipitation ?? null;
    base.weatherCode = c.weathercode ?? null;
    base.pressure = c.surface_pressure ?? null;
    base.description = getWeatherDescription(base.weatherCode);

    if (data.daily) {
      const d = data.daily;
      for (let i = 0; i < (d.time?.length ?? 0); i++) {
        base.daily.push({
          date: d.time[i],
          tempMax: d.temperature_2m_max?.[i] ?? null,
          tempMin: d.temperature_2m_min?.[i] ?? null,
          precipitation: d.precipitation_sum?.[i] ?? null,
          windSpeed: d.wind_speed_10m_max?.[i] ?? null,
          weatherCode: d.weathercode?.[i] ?? null,
        });
      }
    }

    if (data.hourly) {
      const h = data.hourly;
      const hourStart = currentUTCHourStart();
      for (let i = 0; i < (h.time?.length ?? 0); i++) {
        const t = parseOpenMeteoUTC(h.time[i]);
        if (t < hourStart || base.hourly.length >= 24) continue;
        base.hourly.push({
          time: t.toISOString(),
          temperature: h.temperature_2m?.[i] ?? null,
          feelsLike: h.apparent_temperature?.[i] ?? null,
          precipitation: h.precipitation?.[i] ?? null,
          precipitationProbability: h.precipitation_probability?.[i] ?? null,
          windSpeed: h.wind_speed_10m?.[i] ?? null,
          weatherCode: h.weathercode?.[i] ?? null,
        });
      }
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

export const fetchOpenMeteoMF = (lat: number, lon: number, rep: number) =>
  fetchOpenMeteoModel(lat, lon, rep, "open-meteo-mf", "Météo France (ARPÈGE)", "meteofrance_seamless");

export const fetchOpenMeteoUKMO = (lat: number, lon: number, rep: number) =>
  fetchOpenMeteoModel(lat, lon, rep, "open-meteo-ukmo", "UK Met Office", "ukmo_seamless");

export const fetchOpenMeteoGEM = (lat: number, lon: number, rep: number) =>
  fetchOpenMeteoModel(lat, lon, rep, "open-meteo-gem", "GEM Canada", "gem_seamless");

// ────────────────────────────────────────────────────────────
// Yr.no (service météo norvégien, modèle NWP)
// ────────────────────────────────────────────────────────────
export async function fetchYrNo(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "yr-no",
    displayName: "Yr.no (Météorologie Norvège)",
    url: "https://yr.no",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const timeseries = data.properties?.timeseries;
    if (!timeseries?.length) throw new Error("Aucune donnée");

    // Current conditions (first entry)
    const current = timeseries[0];
    const details = current.data?.instant?.details;
    if (details) {
      base.temperature = details.air_temperature ?? null;
      base.humidity = details.relative_humidity ?? null;
      base.windSpeed = details.wind_speed !== undefined ? details.wind_speed * 3.6 : null;
      base.windDirection = details.wind_from_direction ?? null;
      base.pressure = details.air_pressure_at_sea_level ?? null;
    }

    const next1h = current.data?.next_1_hours;
    if (next1h?.details) {
      base.precipitation = next1h.details.precipitation_amount ?? null;
    }
    const symbolCode = next1h?.summary?.symbol_code ?? current.data?.next_6_hours?.summary?.symbol_code;
    if (symbolCode) {
      base.description = symbolCode
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
    }

    // Agrégation journalière + horaire depuis le timeseries
    const dailyMap: Record<string, { temps: number[]; precip: number; windSpeeds: number[] }> = {};
    const yrHourStart = currentUTCHourStart();

    for (const entry of timeseries) {
      const entryTime = new Date(entry.time); // Yr.no times have explicit Z — safe to parse directly
      const date = entry.time.split("T")[0];
      const entryDetails = entry.data?.instant?.details;

      // Daily
      if (!dailyMap[date]) dailyMap[date] = { temps: [], precip: 0, windSpeeds: [] };
      const d = dailyMap[date];
      if (entryDetails?.air_temperature !== undefined) d.temps.push(entryDetails.air_temperature);
      if (entryDetails?.wind_speed !== undefined) d.windSpeeds.push(entryDetails.wind_speed * 3.6);
      const precip1h = entry.data?.next_1_hours?.details?.precipitation_amount;
      if (precip1h) d.precip += precip1h;

      // Horaire (24 prochaines heures) — filter from current UTC hour start
      if (entryTime >= yrHourStart && base.hourly.length < 24 && entryDetails) {
        const precip = entry.data?.next_1_hours?.details?.precipitation_amount ?? null;
        base.hourly.push({
          time: new Date(entry.time).toISOString(),
          temperature: entryDetails.air_temperature ?? null,
          feelsLike: null,
          precipitation: precip,
          precipitationProbability: null,
          windSpeed: entryDetails.wind_speed !== undefined ? entryDetails.wind_speed * 3.6 : null,
          weatherCode: null,
        });
      }
    }

    const sortedDates = Object.keys(dailyMap).sort().slice(0, 7);
    for (const date of sortedDates) {
      const d = dailyMap[date];
      base.daily.push({
        date,
        tempMax: d.temps.length ? Math.max(...d.temps) : null,
        tempMin: d.temps.length ? Math.min(...d.temps) : null,
        precipitation: d.precip > 0 ? d.precip : null,
        windSpeed: d.windSpeeds.length ? Math.max(...d.windSpeeds) : null,
        weatherCode: null,
      });
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// wttr.in (service simple, sans inscription)
// ────────────────────────────────────────────────────────────
export async function fetchWttrIn(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "wttr-in",
    displayName: "wttr.in",
    url: "https://wttr.in",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  try {
    const url = `https://wttr.in/${lat},${lon}?format=j1`;
    const res = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const current = data.current_condition?.[0];
    if (current) {
      base.temperature = parseFloat(current.temp_C) || null;
      base.feelsLike = parseFloat(current.FeelsLikeC) || null;
      base.humidity = parseFloat(current.humidity) || null;
      base.windSpeed = parseFloat(current.windspeedKmph) || null;
      base.windDirection = parseFloat(current.winddirDegree) || null;
      base.pressure = parseFloat(current.pressure) || null;
      base.uvIndex = parseFloat(current.uvIndex) || null;
      base.visibility = parseFloat(current.visibility) || null;
      base.description =
        current.lang_fr?.[0]?.value ?? current.weatherDesc?.[0]?.value ?? null;
      base.precipitation = parseFloat(current.precipMM) || 0;
    }

    // Daily forecasts
    const weather = data.weather ?? [];
    for (const day of weather) {
      const hourlyTemps = (day.hourly ?? []).map((h: Record<string, string>) =>
        parseFloat(h.tempC)
      );
      const forecast: DailyForecast = {
        date: day.date,
        tempMax: parseFloat(day.maxtempC) || null,
        tempMin: parseFloat(day.mintempC) || null,
        precipitation: parseFloat(day.hourly?.[0]?.precipMM) * (day.hourly?.length ?? 0) || null,
        windSpeed: parseFloat(day.hourly?.[0]?.windspeedKmph) || null,
        weatherCode: null,
      };
      void hourlyTemps;
      base.daily.push(forecast);
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// OpenWeatherMap (clé API requise - optionnelle pour MVP)
// ────────────────────────────────────────────────────────────
export async function fetchOpenWeatherMap(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "openweathermap",
    displayName: "OpenWeatherMap",
    url: "https://openweathermap.org",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    base.error = "Clé API non configurée";
    return base;
  }

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric&lang=fr`;

    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    base.temperature = data.main?.temp ?? null;
    base.feelsLike = data.main?.feels_like ?? null;
    base.humidity = data.main?.humidity ?? null;
    base.pressure = data.main?.pressure ?? null;
    base.windSpeed = data.wind?.speed !== undefined ? data.wind.speed * 3.6 : null;
    base.windDirection = data.wind?.deg ?? null;
    base.visibility = data.visibility ? data.visibility / 1000 : null;
    base.precipitation = data.rain?.["1h"] ?? 0;
    base.description = data.weather?.[0]?.description ?? null;

    // Daily forecast via separate endpoint
    const forecastUrl =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}` +
      `&appid=${apiKey}&units=metric&lang=fr&cnt=40`;
    const fRes = await fetchWithTimeout(forecastUrl);
    if (fRes.ok) {
      const fData = await fRes.json();
      const dailyMap = new Map<string, { temps: number[]; precip: number; windSpeeds: number[] }>();

      for (const entry of fData.list ?? []) {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyMap.has(date)) dailyMap.set(date, { temps: [], precip: 0, windSpeeds: [] });
        const d = dailyMap.get(date)!;
        if (entry.main?.temp !== undefined) d.temps.push(entry.main.temp);
        if (entry.wind?.speed !== undefined) d.windSpeeds.push(entry.wind.speed * 3.6);
        d.precip += entry.rain?.["3h"] ?? 0;
      }

      for (const [date, d] of Array.from(dailyMap.entries()).sort().slice(0, 7)) {
        base.daily.push({
          date,
          tempMax: d.temps.length ? Math.max(...d.temps) : null,
          tempMin: d.temps.length ? Math.min(...d.temps) : null,
          precipitation: d.precip > 0 ? d.precip : null,
          windSpeed: d.windSpeeds.length ? Math.max(...d.windSpeeds) : null,
          weatherCode: null,
        });
      }
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}

// ────────────────────────────────────────────────────────────
// WeatherAPI.com (clé API requise - optionnelle)
// ────────────────────────────────────────────────────────────
export async function fetchWeatherAPI(
  lat: number,
  lon: number,
  reputation: number
): Promise<WeatherSourceResult> {
  const base: WeatherSourceResult = {
    source: "weatherapi",
    displayName: "WeatherAPI.com",
    url: "https://weatherapi.com",
    temperature: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    windDirection: null,
    precipitation: null,
    description: null,
    weatherCode: null,
    pressure: null,
    uvIndex: null,
    visibility: null,
    daily: [],
    hourly: [],
    reputation,
  };

  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) {
    base.error = "Clé API non configurée";
    return base;
  }

  try {
    const url =
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}` +
      `&days=7&lang=fr`;

    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const current = data.current;
    base.temperature = current?.temp_c ?? null;
    base.feelsLike = current?.feelslike_c ?? null;
    base.humidity = current?.humidity ?? null;
    base.windSpeed = current?.wind_kph ?? null;
    base.windDirection = current?.wind_degree ?? null;
    base.pressure = current?.pressure_mb ?? null;
    base.uvIndex = current?.uv ?? null;
    base.visibility = current?.vis_km ?? null;
    base.precipitation = current?.precip_mm ?? null;
    base.description = current?.condition?.text ?? null;

    for (const day of data.forecast?.forecastday ?? []) {
      base.daily.push({
        date: day.date,
        tempMax: day.day?.maxtemp_c ?? null,
        tempMin: day.day?.mintemp_c ?? null,
        precipitation: day.day?.totalprecip_mm ?? null,
        windSpeed: day.day?.maxwind_kph ?? null,
        weatherCode: null,
      });
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  return base;
}
