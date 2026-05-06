export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Ciel dégagé", icon: "☀️" },
  1: { label: "Principalement dégagé", icon: "🌤️" },
  2: { label: "Partiellement nuageux", icon: "⛅" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine modérée", icon: "🌦️" },
  55: { label: "Bruine dense", icon: "🌧️" },
  56: { label: "Bruine verglaçante légère", icon: "🌨️" },
  57: { label: "Bruine verglaçante dense", icon: "🌨️" },
  61: { label: "Pluie légère", icon: "🌦️" },
  63: { label: "Pluie modérée", icon: "🌧️" },
  65: { label: "Pluie forte", icon: "🌧️" },
  66: { label: "Pluie verglaçante légère", icon: "🌨️" },
  67: { label: "Pluie verglaçante forte", icon: "🌨️" },
  71: { label: "Neige légère", icon: "🌨️" },
  73: { label: "Neige modérée", icon: "❄️" },
  75: { label: "Neige forte", icon: "❄️" },
  77: { label: "Grains de neige", icon: "🌨️" },
  80: { label: "Averses légères", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌧️" },
  82: { label: "Averses violentes", icon: "⛈️" },
  85: { label: "Averses de neige légères", icon: "🌨️" },
  86: { label: "Averses de neige fortes", icon: "❄️" },
  95: { label: "Orage", icon: "⛈️" },
  96: { label: "Orage avec grêle légère", icon: "⛈️" },
  99: { label: "Orage avec grêle forte", icon: "⛈️" },
};

export function getWeatherDescription(code: number | null): string {
  if (code === null) return "Données indisponibles";
  return WMO_CODES[code]?.label ?? "Conditions variables";
}

export function getWeatherIcon(code: number | null, localHour?: number): string {
  if (code === null) return "🌡️";

  const isNight = localHour !== undefined && (localHour < 6 || localHour >= 21);

  if (isNight) {
    if (code === 0 || code === 1) return "🌙";
    if (code === 2) return "🌛";
    // Sun-with-rain icons become plain rain at night
    if (code === 51 || code === 53 || code === 61 || code === 80) return "🌧️";
  }

  return WMO_CODES[code]?.icon ?? "🌡️";
}

export function getWindDirection(degrees: number | null): string {
  if (degrees === null) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(degrees / 45) % 8];
}

export function getBeaufortScale(kmh: number): { force: number; label: string } {
  if (kmh < 1) return { force: 0, label: "Calme" };
  if (kmh < 6) return { force: 1, label: "Très légère brise" };
  if (kmh < 12) return { force: 2, label: "Légère brise" };
  if (kmh < 20) return { force: 3, label: "Petite brise" };
  if (kmh < 29) return { force: 4, label: "Jolie brise" };
  if (kmh < 39) return { force: 5, label: "Brise fraîche" };
  if (kmh < 50) return { force: 6, label: "Vent frais" };
  if (kmh < 62) return { force: 7, label: "Grand frais" };
  if (kmh < 75) return { force: 8, label: "Coup de vent" };
  if (kmh < 89) return { force: 9, label: "Fort coup de vent" };
  if (kmh < 103) return { force: 10, label: "Tempête" };
  if (kmh < 118) return { force: 11, label: "Violente tempête" };
  return { force: 12, label: "Ouragan" };
}
