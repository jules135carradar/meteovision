import {
  WeatherSourceResult,
  AggregatedWeather,
  AggregatedDailyForecast,
  AggregatedHourlyForecast,
  Divergence,
  Location,
  ViticultureIndicators,
} from "./types";
import { getWeatherDescription } from "./weather-codes";
import { weightedMean, standardDeviation } from "./utils";

interface MetricConfig {
  key: keyof WeatherSourceResult;
  label: string;
  thresholdStdLow: number;
  thresholdStdHigh: number;
  unit: string;
}

const METRICS: MetricConfig[] = [
  { key: "temperature", label: "Température", thresholdStdLow: 2, thresholdStdHigh: 4, unit: "°C" },
  { key: "windSpeed", label: "Vent", thresholdStdLow: 10, thresholdStdHigh: 20, unit: "km/h" },
  { key: "precipitation", label: "Précipitations", thresholdStdLow: 1, thresholdStdHigh: 3, unit: "mm" },
  { key: "humidity", label: "Humidité", thresholdStdLow: 10, thresholdStdHigh: 20, unit: "%" },
];

function detectDivergences(sources: WeatherSourceResult[]): Divergence[] {
  const valid = sources.filter((s) => !s.error);
  const divergences: Divergence[] = [];

  for (const metric of METRICS) {
    const values = valid
      .filter((s) => s[metric.key] !== null)
      .map((s) => ({ source: s.displayName, value: s[metric.key] as number }));

    if (values.length < 2) continue;

    const nums = values.map((v) => v.value);
    const std = standardDeviation(nums);
    const min = Math.min(...nums);
    const max = Math.max(...nums);

    if (std >= metric.thresholdStdLow) {
      const severity =
        std >= metric.thresholdStdHigh ? "élevée" : std >= metric.thresholdStdLow ? "modérée" : "faible";

      divergences.push({
        metric: metric.key as string,
        metricLabel: metric.label,
        values,
        min,
        max,
        severity,
        message: `${metric.label} : écart de ${(max - min).toFixed(1)}${metric.unit} entre les sources (${min.toFixed(1)} à ${max.toFixed(1)}${metric.unit})`,
      });
    }
  }

  return divergences;
}

function aggregateHourly(sources: WeatherSourceResult[]): AggregatedHourlyForecast[] {
  const valid = sources.filter((s) => !s.error && s.hourly.length > 0);
  if (valid.length === 0) return [];

  type HourAccumulator = {
    temps: { value: number; weight: number }[];
    feelsLike: { value: number; weight: number }[];
    humidities: { value: number; weight: number }[];
    precips: { value: number; weight: number }[];
    precipProbs: { value: number; weight: number }[];
    windSpeeds: { value: number; weight: number }[];
    windDirs: { value: number; weight: number }[];
    codes: number[];
  };

  const timeMap: Record<string, HourAccumulator> = {};

  for (const source of valid) {
    const weight = source.reputation / 100;
    for (const h of source.hourly) {
      // Normalize to UTC ISO hour key so all sources group correctly regardless of timezone format
      const key = new Date(h.time).toISOString().slice(0, 13) + ":00:00.000Z";
      if (!timeMap[key]) {
        timeMap[key] = { temps: [], feelsLike: [], humidities: [], precips: [], precipProbs: [], windSpeeds: [], windDirs: [], codes: [] };
      }
      const acc = timeMap[key];
      if (h.temperature !== null) acc.temps.push({ value: h.temperature, weight });
      if (h.feelsLike !== null) acc.feelsLike.push({ value: h.feelsLike, weight });
      if (h.humidity !== null) acc.humidities.push({ value: h.humidity, weight });
      if (h.precipitation !== null) acc.precips.push({ value: h.precipitation, weight });
      if (h.precipitationProbability !== null) acc.precipProbs.push({ value: h.precipitationProbability, weight });
      if (h.windSpeed !== null) acc.windSpeeds.push({ value: h.windSpeed, weight });
      if (h.windDirection !== null) acc.windDirs.push({ value: h.windDirection, weight });
      if (h.weatherCode !== null) acc.codes.push(h.weatherCode);
    }
  }

  const currentHourMs = new Date(new Date().toISOString().slice(0, 13) + ":00:00.000Z").getTime();

  return Object.keys(timeMap)
    .sort()
    .filter((key) => new Date(key).getTime() >= currentHourMs)
    .slice(0, 7 * 24)
    .map((time) => {
      const acc = timeMap[time];
      const codeFreq = acc.codes.reduce<Record<number, number>>((r, c) => { r[c] = (r[c] ?? 0) + 1; return r; }, {});
      const weatherCode = acc.codes.length > 0
        ? parseInt(Object.keys(codeFreq).sort((a, b) => codeFreq[parseInt(b)] - codeFreq[parseInt(a)])[0])
        : 0;
      return {
        time,
        temperature: weightedMean(acc.temps) ?? 0,
        feelsLike: weightedMean(acc.feelsLike) ?? 0,
        humidity: weightedMean(acc.humidities) ?? 0,
        precipitation: weightedMean(acc.precips) ?? 0,
        precipitationProbability: weightedMean(acc.precipProbs) ?? 0,
        windSpeed: weightedMean(acc.windSpeeds) ?? 0,
        windDirection: weightedMean(acc.windDirs) ?? 0,
        weatherCode,
        description: getWeatherDescription(weatherCode),
      };
    });
}

type DayAccumulator = {
  tempMaxes: { value: number; weight: number }[];
  tempMins: { value: number; weight: number }[];
  precips: { value: number; weight: number }[];
  windSpeeds: { value: number; weight: number }[];
  codes: number[];
};

function aggregateDaily(sources: WeatherSourceResult[]): AggregatedDailyForecast[] {
  const valid = sources.filter((s) => !s.error && s.daily.length > 0);
  if (valid.length === 0) return [];

  const dateMap: Record<string, DayAccumulator> = {};

  for (const source of valid) {
    const weight = source.reputation / 100;
    for (const day of source.daily) {
      if (!dateMap[day.date]) {
        dateMap[day.date] = { tempMaxes: [], tempMins: [], precips: [], windSpeeds: [], codes: [] };
      }
      const d = dateMap[day.date];
      if (day.tempMax !== null) d.tempMaxes.push({ value: day.tempMax, weight });
      if (day.tempMin !== null) d.tempMins.push({ value: day.tempMin, weight });
      if (day.precipitation !== null) d.precips.push({ value: day.precipitation, weight });
      if (day.windSpeed !== null) d.windSpeeds.push({ value: day.windSpeed, weight });
      if (day.weatherCode !== null) d.codes.push(day.weatherCode);
    }
  }

  return Object.keys(dateMap)
    .sort()
    .slice(0, 7)
    .map((date) => {
      const d = dateMap[date];
      const tempMax = weightedMean(d.tempMaxes) ?? 0;
      const tempMin = weightedMean(d.tempMins) ?? 0;
      const precipitation = weightedMean(d.precips) ?? 0;
      const windSpeed = weightedMean(d.windSpeeds) ?? 0;
      const codeFreq = d.codes.reduce<Record<number, number>>((acc, c) => {
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      }, {});
      const weatherCode =
        d.codes.length > 0
          ? parseInt(Object.keys(codeFreq).sort((a, b) => codeFreq[parseInt(b)] - codeFreq[parseInt(a)])[0])
          : 0;

      return {
        date,
        tempMax,
        tempMin,
        precipitation,
        windSpeed,
        weatherCode,
        description: getWeatherDescription(weatherCode),
      };
    });
}

function computeViticultureIndicators(
  aggregated: Omit<AggregatedWeather, "viticulture">,
  sources: WeatherSourceResult[]
): ViticultureIndicators {
  const daily = aggregated.daily;

  // Frost risk: check if any source predicts tempMin < 0°C in next 3 days
  const next3 = daily.slice(0, 3);
  const minTemps = next3.map((d) => d.tempMin).filter((t) => t !== null) as number[];
  const absoluteMin = minTemps.length > 0 ? Math.min(...minTemps) : null;
  const frostRisk = absoluteMin !== null && absoluteMin < 2;
  const frostRiskLevel =
    absoluteMin === null
      ? "aucun"
      : absoluteMin < -2
      ? "élevé"
      : absoluteMin < 0
      ? "modéré"
      : absoluteMin < 2
      ? "faible"
      : "aucun";

  // Mildew risk: temperature > 10°C + humidity > 60% + recent rain
  const mildewFactors: string[] = [];
  if (aggregated.temperature > 10) mildewFactors.push("Température > 10°C");
  if (aggregated.humidity > 60) mildewFactors.push("Humidité > 60%");
  if (aggregated.precipitation > 0) mildewFactors.push("Précipitations en cours");
  const rainInLast7d = daily.slice(0, 7).reduce((s, d) => s + d.precipitation, 0);
  if (rainInLast7d > 10) mildewFactors.push("Cumul pluie > 10mm / 7j");

  const mildewRisk =
    mildewFactors.length >= 3
      ? "élevé"
      : mildewFactors.length >= 2
      ? "modéré"
      : "faible";

  // ETP simplifié (formule de Thornthwaite approximée)
  // ETP ≈ 0.0023 × (T + 17.8) × (Tmax - Tmin)^0.5 × Ra
  // Simplified: rough daily ETP from temperature and wind
  const T = aggregated.temperature;
  const windFactor = 1 + (aggregated.windSpeed / 100);
  const humidityFactor = 1 - (aggregated.humidity / 200);
  const etp = T > 0 ? Math.max(0, (0.0023 * (T + 17.8) * Math.sqrt(Math.max(0, T + 5)) * windFactor * humidityFactor) * 5) : 0;

  // Treatment window: no rain in next 24h + wind < 20 km/h
  const next24hRain = daily[0]?.precipitation ?? 0;
  const treatmentWindow = next24hRain < 1 && aggregated.windSpeed < 20;
  const treatmentWindowHours = treatmentWindow ? 24 : 0;

  return {
    frostRisk,
    frostRiskLevel,
    minTemperature: absoluteMin,
    mildewRisk,
    mildewFactors,
    etp: Math.round(etp * 10) / 10,
    rainCumul7d: Math.round(rainInLast7d * 10) / 10,
    uvIndex: aggregated.uvIndex,
    treatmentWindow,
    treatmentWindowHours,
  };
}

export function aggregate(
  location: Location,
  sources: WeatherSourceResult[]
): AggregatedWeather {
  const valid = sources.filter((s) => !s.error && s.temperature !== null);

  const toWeighted = (key: keyof WeatherSourceResult) =>
    sources
      .filter((s) => !s.error && s[key] !== null)
      .map((s) => ({ value: s[key] as number, weight: s.reputation / 100 }));

  const temperature = weightedMean(toWeighted("temperature")) ?? 0;
  const feelsLike = weightedMean(toWeighted("feelsLike")) ?? temperature;
  const humidity = weightedMean(toWeighted("humidity")) ?? 0;
  const windSpeed = weightedMean(toWeighted("windSpeed")) ?? 0;
  const windDirection = weightedMean(toWeighted("windDirection")) ?? 0;
  const precipitation = weightedMean(toWeighted("precipitation")) ?? 0;
  const pressure = weightedMean(toWeighted("pressure")) ?? 1013;
  const uvIndex = weightedMean(toWeighted("uvIndex")) ?? 0;
  const visibility = weightedMean(toWeighted("visibility"));

  // Most common weather code (weighted)
  const codeScores: Record<number, number> = {};
  for (const s of valid) {
    if (s.weatherCode !== null) {
      const w = s.reputation / 100;
      codeScores[s.weatherCode] = (codeScores[s.weatherCode] ?? 0) + w;
    }
  }
  let weatherCode = 0;
  let maxScore = 0;
  for (const key of Object.keys(codeScores)) {
    const code = parseInt(key);
    if (codeScores[code] > maxScore) {
      maxScore = codeScores[code];
      weatherCode = code;
    }
  }

  const partial: Omit<AggregatedWeather, "viticulture"> = {
    location,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    windDirection,
    precipitation,
    pressure,
    uvIndex,
    visibility,
    description: getWeatherDescription(weatherCode),
    weatherCode,
    sources,
    validSources: valid.length,
    divergences: detectDivergences(sources),
    daily: aggregateDaily(sources),
    hourly: aggregateHourly(sources),
    historicalPrecip: [],
    yesterdaySlots: [],
    fetchedAt: new Date().toISOString(),
  };

  return {
    ...partial,
    viticulture: computeViticultureIndicators(partial, sources),
  };
}
