import { AggregatedWeather } from "@/lib/types";

interface Props {
  weather: AggregatedWeather;
  metier: string;
}

export default function ProModeIndicators({ weather, metier }: Props) {
  if (metier === "grand_public") return null;

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "2px solid transparent", background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#f59e0b,#ef4444,#7c3aed) border-box" }}>
      <div style={{ background: "linear-gradient(90deg,#b45309,#9f1239,#6d28d9)", padding: "13px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🎯 Indicateurs professionnels</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", textTransform: "capitalize" }}>— {METIER_LABELS[metier] ?? metier}</span>
      </div>
      <div style={{ padding: 20 }}>

        {metier === "viticulteur"      && <ViticulteurPanel weather={weather} />}
        {metier === "agriculteur"      && <AgriculteurPanel weather={weather} />}
        {metier === "grandes_cultures" && <GrandesCulturesPanel weather={weather} />}
        {metier === "apiculture"       && <ApiculturePanel weather={weather} />}
        {metier === "forestier"        && <ForestierPanel weather={weather} />}
        {metier === "sport_outdoor"    && <SportOutdoorPanel weather={weather} />}
        {metier === "btp"              && <BTPPanel weather={weather} />}
        {metier === "transport"        && <TransportPanel weather={weather} />}
        {metier === "evenementiel"     && <EvenementielPanel weather={weather} />}
        {metier === "nautisme"         && <NautismePanel weather={weather} />}
        {metier === "pompier"          && <PompierPanel weather={weather} />}
      </div>
    </div>
  );
}

const METIER_LABELS: Record<string, string> = {
  viticulteur:      "Viticulteur / Arboriculteur",
  agriculteur:      "Agriculteur / Maraîcher",
  grandes_cultures: "Grandes cultures / Céréalier",
  apiculture:       "Apiculture",
  forestier:        "Forestier / Exploitation",
  sport_outdoor:    "Sport outdoor / Randonnée",
  btp:              "BTP / Construction",
  transport:        "Transport / Logistique",
  evenementiel:     "Événementiel",
  nautisme:         "Nautisme / Pêche",
  pompier:          "Pompiers / Sécurité civile",
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

const CARD_GRADIENTS = [
  { bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "#bfdbfe", title: "#1d4ed8" },
  { bg: "linear-gradient(135deg,#f0fdf4,#d1fae5)", border: "#a7f3d0", title: "#047857" },
  { bg: "linear-gradient(135deg,#fdf4ff,#ede9fe)", border: "#ddd6fe", title: "#6d28d9" },
  { bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "#fed7aa", title: "#c2410c" },
  { bg: "linear-gradient(135deg,#fefce8,#fde68a)", border: "#fcd34d", title: "#92400e" },
  { bg: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", border: "#7dd3fc", title: "#0369a1" },
];
function ProCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const g = CARD_GRADIENTS[title.charCodeAt(0) % CARD_GRADIENTS.length];
  return (
    <div style={{ background: g.bg, borderRadius: 16, padding: 16, border: `1.5px solid ${g.border}` }}>
      <p style={{ color: g.title, fontSize: 11, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.04em", marginBottom: 8, lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "break-word" }}>
        <span style={{ marginRight: 4 }}>{icon}</span>{title}
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

      <ProCard icon="💧" title="ETP / Évapotranspiration">
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

function GrandesCulturesPanel({ weather }: { weather: AggregatedWeather }) {
  const v = weather.viticulture;

  // Degrés-jours de croissance (base 6°C) sur les 7 prochains jours
  const ddj = weather.daily.reduce((sum, day) => {
    const avg = (day.tempMax + day.tempMin) / 2;
    return sum + Math.max(0, avg - 6);
  }, 0);

  // Bilan hydrique approximatif
  const etpWeek = (v.etp ?? 0) * 7;
  const deficit  = Math.max(0, etpWeek - v.rainCumul7d);
  const deficitLevel = deficit < 5 ? "favorable" : deficit < 20 ? "modéré" : "élevé";

  // Fenêtre récolte
  const harvestOk = weather.temperature > 15 && weather.humidity < 70 && weather.precipitation < 0.5;

  // Risque maladies fongiques (humide + chaud)
  const fungalRisk = weather.humidity > 80 && weather.temperature > 15;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🌡️" title="Degrés-jours 7j (base 6°C)">
        <p className="text-slate-800 text-2xl font-bold">{ddj.toFixed(0)} °J</p>
        <p className="text-slate-400 text-xs mt-1">Cumul thermique à venir</p>
      </ProCard>
      <ProCard icon="💧" title="Déficit hydrique 7j">
        <p className="text-slate-800 text-2xl font-bold">{deficit.toFixed(0)} mm</p>
        <RiskBadge
          level={deficitLevel}
          labels={{ favorable: "✓ Bilan OK", modéré: "◐ Léger déficit", élevé: "⚠️ Déficit important" }}
        />
      </ProCard>
      <ProCard icon="🌾" title="Fenêtre récolte">
        <RiskBadge
          level={harvestOk ? "favorable" : "défavorable"}
          labels={{ favorable: "Favorable ✓", défavorable: "Défavorable ✗" }}
        />
        <p className="text-slate-400 text-xs mt-2">T°={Math.round(weather.temperature)}°C · HR={Math.round(weather.humidity)}%</p>
      </ProCard>
      <ProCard icon="🦠" title="Risque fongique">
        <RiskBadge
          level={fungalRisk ? "élevé" : "faible"}
          labels={{ faible: "Faible ✓", élevé: "Élevé ⚠️" }}
        />
        <p className="text-slate-400 text-xs mt-2">Humidité + chaleur favorisent les champignons</p>
      </ProCard>
      <ProCard icon="🥶" title="Risque gel">
        <RiskBadge
          level={v.frostRiskLevel}
          labels={{ aucun: "Aucun", faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
      </ProCard>
      <ProCard icon="🌧️" title="Pluie cumulée 7j">
        <p className="text-slate-800 text-2xl font-bold">{v.rainCumul7d} mm</p>
        <p className="text-slate-400 text-xs mt-1">ETP estimée : {etpWeek.toFixed(0)} mm</p>
      </ProCard>
    </div>
  );
}

function ApiculturePanel({ weather }: { weather: AggregatedWeather }) {
  // Score conditions de butinage (0-4)
  let score = 0;
  if (weather.temperature > 12)    score++;
  if (weather.temperature < 35)    score++;
  if (weather.precipitation < 0.5) score++;
  if (weather.windSpeed < 20)      score++;
  const butinageLevel = score === 4 ? "favorable" : score >= 2 ? "modéré" : "défavorable";

  const hiveStress = weather.temperature < 8 || weather.temperature > 38;
  const fermentRisk = weather.humidity > 80;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🐝" title="Conditions butinage">
        <RiskBadge
          level={butinageLevel}
          labels={{ favorable: "Excellentes ✓", modéré: "Correctes ◐", défavorable: "Mauvaises ✗" }}
        />
        <p className="text-slate-400 text-xs mt-2">{score}/4 critères favorables</p>
      </ProCard>
      <ProCard icon="🌡️" title="Température ruche">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
        <p className="text-slate-400 text-xs mt-1">
          {hiveStress ? "⚠️ Stress colonie" : "✓ Zone de confort"}
        </p>
      </ProCard>
      <ProCard icon="💨" title="Vent">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.windSpeed)} km/h</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.windSpeed < 20 ? "✓ Butinage possible" : "✗ Abeilles à la ruche"}
        </p>
      </ProCard>
      <ProCard icon="☀️" title="Ensoleillement (UV)">
        <p className="text-slate-800 text-2xl font-bold">{weather.uvIndex.toFixed(1)}</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.uvIndex > 2 ? "✓ Activité favorisée" : "◐ Faible ensoleillement"}
        </p>
      </ProCard>
      <ProCard icon="💧" title="Humidité / Miel">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.humidity)}%</p>
        <p className="text-slate-400 text-xs mt-1">
          {fermentRisk ? "⚠️ Risque fermentation miel" : "✓ OK"}
        </p>
      </ProCard>
      <ProCard icon="🌧️" title="Pluie">
        <p className="text-slate-800 text-2xl font-bold">{weather.precipitation.toFixed(1)} mm</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.precipitation >= 0.5 ? "✗ Sortie impossible" : "✓ Sec"}
        </p>
      </ProCard>
    </div>
  );
}

function ForestierPanel({ weather }: { weather: AggregatedWeather }) {
  const v = weather.viticulture;
  const fireRisk = computeFireRisk(weather);

  // Portance des sols selon pluie cumulée 7j
  const portanceLevel =
    v.rainCumul7d < 20 ? "favorable" :
    v.rainCumul7d < 50 ? "modéré" : "élevé";

  // Conditions d'abattage
  const fellingOk = weather.windSpeed < 40;
  const visOk = weather.visibility === null || weather.visibility > 2;

  // Risque chablis (arbres déracinés par le vent)
  const chabliRisk = weather.windSpeed > 60 ? "élevé" : weather.windSpeed > 40 ? "modéré" : "faible";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🔥" title="Risque incendie">
        <RiskBadge
          level={fireRisk}
          labels={{ aucun: "Nul", faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
        <p className="text-slate-400 text-xs mt-2">T°={Math.round(weather.temperature)}°C · Hum.={Math.round(weather.humidity)}%</p>
      </ProCard>
      <ProCard icon="🚜" title="Portance des sols">
        <RiskBadge
          level={portanceLevel}
          labels={{ favorable: "Carrossable ✓", modéré: "Limité ◐", élevé: "Impraticable ✗" }}
        />
        <p className="text-slate-400 text-xs mt-2">Pluie 7j : {v.rainCumul7d} mm</p>
      </ProCard>
      <ProCard icon="🌲" title="Conditions abattage">
        <RiskBadge
          level={fellingOk && visOk ? "favorable" : "élevé"}
          labels={{ favorable: "Favorables ✓", élevé: "Déconseillé ✗" }}
        />
        <p className="text-slate-400 text-xs mt-2">Vent : {Math.round(weather.windSpeed)} km/h</p>
      </ProCard>
      <ProCard icon="🌀" title="Risque chablis">
        <RiskBadge
          level={chabliRisk}
          labels={{ faible: "Faible", modéré: "Modéré ⚠️", élevé: "ÉLEVÉ 🚨" }}
        />
      </ProCard>
      <ProCard icon="💧" title="Humidité végétation">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.humidity)}%</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.humidity < 40 ? "⚠️ Végétation très sèche" : weather.humidity < 60 ? "◐ Sèche" : "✓ OK"}
        </p>
      </ProCard>
      <ProCard icon="👁️" title="Visibilité">
        <p className="text-slate-800 text-2xl font-bold">
          {weather.visibility !== null ? `${weather.visibility.toFixed(1)} km` : "N/D"}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.visibility !== null && weather.visibility < 2 ? "⚠️ Mauvaise visibilité" : "✓ OK"}
        </p>
      </ProCard>
    </div>
  );
}

function SportOutdoorPanel({ weather }: { weather: AggregatedWeather }) {
  // Indice de chaleur ressenti (simplifié)
  const stormRisk = weather.weatherCode >= 95;
  const rainRisk  = weather.precipitation >= 1;
  const windRisk  = weather.windSpeed > 50;

  const globalLevel =
    stormRisk ? "élevé" :
    (rainRisk && windRisk) ? "modéré" :
    "favorable";

  // UV protection
  const uvLabel =
    weather.uvIndex >= 8 ? "⚠️ Protection forte obligatoire" :
    weather.uvIndex >= 5 ? "◐ Crème solaire recommandée" :
    "✓ Faible";

  // Visibilité trail
  const visOk = weather.visibility === null || weather.visibility > 3;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ProCard icon="🏃" title="Conditions outdoor">
        <RiskBadge
          level={globalLevel}
          labels={{ favorable: "Excellentes ✓", modéré: "Correctes ◐", élevé: "Dangereuses ✗" }}
        />
      </ProCard>
      <ProCard icon="🌡️" title="Température ressentie">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.feelsLike)}°C</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.feelsLike > 35 ? "⚠️ Coup de chaleur" : weather.feelsLike < 0 ? "⚠️ Hypothermie" : "✓ Confortable"}
        </p>
      </ProCard>
      <ProCard icon="⛈️" title="Risque orage">
        <RiskBadge
          level={stormRisk ? "élevé" : "faible"}
          labels={{ faible: "Faible ✓", élevé: "ORAGE — Rentrez ✗" }}
        />
      </ProCard>
      <ProCard icon="☀️" title="Indice UV">
        <p className="text-slate-800 text-2xl font-bold">{weather.uvIndex.toFixed(1)}</p>
        <p className="text-slate-400 text-xs mt-1">{uvLabel}</p>
      </ProCard>
      <ProCard icon="👁️" title="Visibilité trail">
        <p className="text-slate-800 text-2xl font-bold">
          {weather.visibility !== null ? `${weather.visibility.toFixed(1)} km` : "N/D"}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          {!visOk ? "⚠️ Brouillard — balisage obligatoire" : "✓ Bonne visibilité"}
        </p>
      </ProCard>
      <ProCard icon="💨" title="Vent">
        <p className="text-slate-800 text-2xl font-bold">{Math.round(weather.windSpeed)} km/h</p>
        <p className="text-slate-400 text-xs mt-1">
          {weather.windSpeed > 60 ? "⚠️ Dangereux en altitude" : weather.windSpeed > 30 ? "◐ Effort accru" : "✓ OK"}
        </p>
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
