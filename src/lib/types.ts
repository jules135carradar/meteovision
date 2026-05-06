export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  weatherCode: number | null;
}

export interface AggregatedHourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  description: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
}

export interface WeatherSourceResult {
  source: string;
  displayName: string;
  url: string;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  precipitation: number | null;
  description: string | null;
  weatherCode: number | null;
  pressure: number | null;
  uvIndex: number | null;
  visibility: number | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  reputation: number;
  error?: string;
}

export interface Divergence {
  metric: string;
  metricLabel: string;
  values: { source: string; value: number }[];
  min: number;
  max: number;
  severity: "faible" | "modérée" | "élevée";
  message: string;
}

export interface AggregatedDailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

export interface ViticultureIndicators {
  frostRisk: boolean;
  frostRiskLevel: "aucun" | "faible" | "modéré" | "élevé";
  minTemperature: number | null;
  mildewRisk: "faible" | "modéré" | "élevé";
  mildewFactors: string[];
  etp: number | null;
  rainCumul7d: number;
  uvIndex: number | null;
  treatmentWindow: boolean;
  treatmentWindowHours: number;
}

export interface AggregatedWeather {
  location: Location;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  pressure: number;
  uvIndex: number;
  visibility: number | null;
  description: string;
  weatherCode: number;
  sources: WeatherSourceResult[];
  validSources: number;
  divergences: Divergence[];
  daily: AggregatedDailyForecast[];
  hourly: AggregatedHourlyForecast[];
  viticulture: ViticultureIndicators;
  fetchedAt: string;
}

export interface ReputationRecord {
  source: string;
  score: number;
  nb_votes: number;
  nb_correct: number;
  nb_partial: number;
  nb_incorrect: number;
  updated_at: string;
}

export type VoteValue = "oui" | "partiellement" | "non";

export interface VoteRecord {
  id?: string;
  ville: string;
  date: string;
  source: string;
  vote: VoteValue;
  metier?: string;
  ip_hash?: string;
  created_at?: string;
}
