import { AggregatedWeather } from "@/lib/types";

interface Props {
  weather: AggregatedWeather;
  metier: string;
}

export default function ProModeIndicators({ weather, metier }: Props) {
  if (metier === "grand_public") return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-base font-medium text-slate-700 mb-4 flex items-center gap-2">
        🎯 Indicateurs professionnels
        <span className="text-sm font-normal text-slate-400 capitalize">
          — {METIER_LABELS[metier] ?? metier}
        </span>
      </h2>

      {metier === "viticulteur" && <ViticulteurPanel weather={weather} />}
      {metier === "agriculteur" && <AgriculteurPanel weather={weather} />}
      {metier === "btp" && <BTPPanel weather={weather} />}
      {metier === "transport" && <TransportPanel weather={weather} />}
      {metier === "evenementiel" && <EvenementielPanel weather={weather} />}
      {metier === "nautisme" && <NautismePanel weather={weather} />}
      {metier === "pompier" && <PompierPanel weather={weather} />}
    </div>
  );
}

const METIER_LABELS: Record<string, string> = {
  viticulteur: "Viticulteur / Arboriculteur",
  agriculteur: "Agriculteur / Céréalier",
  btp: "BTP / Construction",
  transport: "Transport / Logistique",
  evenementiel: "Événementiel",
  nautisme: "Nautisme / Pêche",
  pompier: "Pompiers / Sécurité civile",
};

function RiskBadge({ level, labels }: { level: string; labels: Record<string, string> }) {
  const colors: Record<string, string> = {
    aucun: "bg-green-50 border-green-200 text-green-600",
    faible: "bg-green-50 border-green-200 text-green-600",
    modéré: "bg-amber-50 border-amber-200 text-amber-600",
    élevé: "bg-red-50 border-red-200 text-red-600",
    favorable: "bg-green-50 border-green-200 text-green-600",
    défavorable: "bg-red-50 border-red-200 text-red-600",
  };
  const colorClass = colors[level] ?? "bg-slate-50 border-slate-200 text-slate-500";
  const label = labels[level] ?? level;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}

function ProCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <p className="text-sky-500 text-xs uppercase font-medium mb-2 flex items-center gap-1">
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  );
}

function ViticulteurPanel({ weather }: { weather: AggregatedWeather }) {
  const v = weather.viticulture;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🥶" title="Risque gel">
        <RiskBadge
          level={v.frostRiskLevel}
          labels={{ aucun: "Aucun", faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
        {v.minTemperature !== null && (
          <p className="text-slate-700 text-sm mt-2">T° min : {v.minTemperature.toFixed(1)}°C</p>
        )}
      </ProCard>

      <ProCard icon="🦠" title="Risque mildiou">
        <RiskBadge
          level={v.mildewRisk}
          labels={{ faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
        {v.mildewFactors.length > 0 && (
          <ul className="text-slate-500 text-xs mt-2 space-y-0.5">
            {v.mildewFactors.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        )}
      </ProCard>

      <ProCard icon="💧" title="ETP (évapotranspiration)">
        <p className="text-slate-800 text-2xl font-bold">{v.etp} mm/j</p>
      </ProCard>

      <ProCard icon="🌧️" title="Cumul pluie 7 jours">
        <p className="text-slate-800 text-2xl font-bold">{v.rainCumul7d} mm</p>
      </ProCard>

      <ProCard icon="☀️" title="Indice UV">
        <p className="text-slate-800 text-2xl font-bold">{weather.uvIndex.toFixed(1)}</p>
      </ProCard>

      <ProCard icon="🧪" title="Fenêtre traitement">
        <RiskBadge
          level={v.treatmentWindow ? "favorable" : "défavorable"}
          labels={{ favorable: "Favorable ✓", défavorable: "Défavorable ✗" }}
        />
        {v.treatmentWindow && (
          <p className="text-slate-400 text-xs mt-2">Pas de pluie + vent faible</p>
        )}
      </ProCard>
    </div>
  );
}

function AgriculteurPanel({ weather }: { weather: AggregatedWeather }) {
  const v = weather.viticulture;
  const windOkForTreatment = weather.windSpeed < 20;
  const noRain = weather.precipitation < 0.5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🥶" title="Risque gel">
        <RiskBadge
          level={v.frostRiskLevel}
          labels={{ aucun: "Aucun", faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
      </ProCard>
      <ProCard icon="💧" title="Cumul pluie 7j">
        <p className="text-slate-800 text-2xl font-bold">{v.rainCumul7d} mm</p>
      </ProCard>
      <ProCard icon="🧪" title="Fenêtre traitement">
        <RiskBadge
          level={windOkForTreatment && noRain ? "favorable" : "défavorable"}
          labels={{ favorable: "Favorable ✓", défavorable: "Défavorable ✗" }}
        />
        <p className="text-slate-400 text-xs mt-2">Vent : {Math.round(weather.windSpeed)} km/h</p>
      </ProCard>
      <ProCard icon="💨" title="Vent">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.windSpeed)} km/h</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.windSpeed < 20 ? "✓ OK traitement" : "✗ Trop fort"}
        </p>
      </ProCard>
    </div>
  );
}

function BTPPanel({ weather }: { weather: AggregatedWeather }) {
  const craneSafe = weather.windSpeed < 45;
  const scaffoldingSafe = weather.windSpeed < 60;
  const frostRisk = weather.viticulture.frostRisk;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🏗️" title="Grue (seuil 45 km/h)">
        <RiskBadge
          level={craneSafe ? "favorable" : "élevé"}
          labels={{ favorable: "Autorisation ✓", élevé: "ARRÊT OBLIGATOIRE 🚨" }}
        />
        <p className="text-slate-700 text-sm mt-2">{Math.round(weather.windSpeed)} km/h</p>
      </ProCard>
      <ProCard icon="🪜" title="Échafaudage (seuil 60 km/h)">
        <RiskBadge
          level={scaffoldingSafe ? "favorable" : "élevé"}
          labels={{ favorable: "OK ✓", élevé: "DANGER 🚨" }}
        />
      </ProCard>
      <ProCard icon="🌧️" title="Pluie">
        <p className="text-slate-800 text-2xl font-bold">{weather.precipitation.toFixed(1)} mm</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.precipitation < 1 ? "✓ Favorable béton" : "✗ Reporter coulage béton"}
        </p>
      </ProCard>
      <ProCard icon="🥶" title="Gel / Dégel">
        <RiskBadge
          level={frostRisk ? "élevé" : "aucun"}
          labels={{ aucun: "Aucun risque", élevé: "Risque prise béton ⚠️" }}
        />
      </ProCard>
    </div>
  );
}

function TransportPanel({ weather }: { weather: AggregatedWeather }) {
  const blackIceRisk =
    weather.temperature < 3 && weather.humidity > 75 && weather.temperature > -5;
  const fogRisk = weather.visibility !== null && weather.visibility < 1;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🧊" title="Risque verglas">
        <RiskBadge
          level={blackIceRisk ? "élevé" : "aucun"}
          labels={{ aucun: "Faible", élevé: "ÉLEVÉ 🚨" }}
        />
        <p className="text-slate-400 text-xs mt-2">T°={Math.round(weather.temperature)}°C Hum.={Math.round(weather.humidity)}%</p>
      </ProCard>
      <ProCard icon="🌫️" title="Brouillard">
        <RiskBadge
          level={fogRisk ? "élevé" : "aucun"}
          labels={{ aucun: "Visibilité OK", élevé: "BROUILLARD ⚠️" }}
        />
        {weather.visibility !== null && (
          <p className="text-slate-700 text-sm mt-2">Visibilité : {weather.visibility.toFixed(1)} km</p>
        )}
      </ProCard>
      <ProCard icon="💨" title="Rafales">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.windSpeed)} km/h</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.windSpeed > 80 ? "⚠️ Danger poids lourds" : "✓ OK"}
        </p>
      </ProCard>
    </div>
  );
}

function EvenementielPanel({ weather }: { weather: AggregatedWeather }) {
  const tentSafe = weather.windSpeed < 50;
  const rainFree = weather.precipitation < 1;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🎪" title="Tente / Podium (seuil 50 km/h)">
        <RiskBadge
          level={tentSafe ? "favorable" : "élevé"}
          labels={{ favorable: "OK ✓", élevé: "DANGER 🚨" }}
        />
        <p className="text-slate-700 text-sm mt-2">{Math.round(weather.windSpeed)} km/h</p>
      </ProCard>
      <ProCard icon="🌧️" title="Pluie">
        <RiskBadge
          level={rainFree ? "favorable" : "modéré"}
          labels={{ favorable: "Sec ✓", modéré: "Pluie ⚠️" }}
        />
      </ProCard>
      <ProCard icon="🌡️" title="Température ressentie">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.feelsLike)}°C</p>
      </ProCard>
      <ProCard icon="☀️" title="Indice UV">
        <p className="text-slate-800 text-2xl font-bold">{weather.uvIndex.toFixed(1)}</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.uvIndex >= 6 ? "⚠️ Protection solaire" : "✓ Faible"}
        </p>
      </ProCard>
    </div>
  );
}

function NautismePanel({ weather }: { weather: AggregatedWeather }) {
  const beaufort = getBeaufortForce(weather.windSpeed);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="⚓" title="Force du vent (Beaufort)">
        <p className="text-slate-800 text-3xl font-bold">Bf {beaufort}</p>
        <p className="text-slate-400 text-sm mt-1">{Math.round(weather.windSpeed)} km/h</p>
      </ProCard>
      <ProCard icon="📊" title="Pression atmosphérique">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.pressure)} hPa</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.pressure < 1005 ? "⚠️ Dépression" : weather.pressure > 1020 ? "✓ Anticyclone" : "Stable"}
        </p>
      </ProCard>
      <ProCard icon="👁️" title="Visibilité">
        <p className="text-slate-800 text-2xl font-bold">
          {weather.visibility !== null ? `${weather.visibility.toFixed(1)} km` : "N/D"}
        </p>
      </ProCard>
    </div>
  );
}

function PompierPanel({ weather }: { weather: AggregatedWeather }) {
  const fireIndex = computeFireRisk(weather);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🔥" title="Indice risque incendie">
        <RiskBadge
          level={fireIndex}
          labels={{ aucun: "Nul", faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
      </ProCard>
      <ProCard icon="💨" title="Vent (propagation)">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.windSpeed)} km/h</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.windSpeed > 40 ? "⚠️ Propagation rapide" : "✓ Limité"}
        </p>
      </ProCard>
      <ProCard icon="💧" title="Humidité">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.humidity)}%</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.humidity < 30 ? "⚠️ Végétation sèche" : "✓ OK"}
        </p>
      </ProCard>
      <ProCard icon="🌡️" title="Température">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
      </ProCard>
    </div>
  );
}

function getBeaufortForce(kmh: number): number {
  if (kmh < 1) return 0;
  if (kmh < 6) return 1;
  if (kmh < 12) return 2;
  if (kmh < 20) return 3;
  if (kmh < 29) return 4;
  if (kmh < 39) return 5;
  if (kmh < 50) return 6;
  if (kmh < 62) return 7;
  if (kmh < 75) return 8;
  if (kmh < 89) return 9;
  if (kmh < 103) return 10;
  if (kmh < 118) return 11;
  return 12;
}

function computeFireRisk(weather: AggregatedWeather): string {
  let score = 0;
  if (weather.temperature > 30) score += 2;
  else if (weather.temperature > 25) score += 1;
  if (weather.humidity < 30) score += 2;
  else if (weather.humidity < 50) score += 1;
  if (weather.windSpeed > 40) score += 2;
  else if (weather.windSpeed > 20) score += 1;
  if (weather.precipitation < 0.5) score += 1;

  if (score >= 6) return "élevé";
  if (score >= 4) return "modéré";
  if (score >= 2) return "faible";
  return "aucun";
}
