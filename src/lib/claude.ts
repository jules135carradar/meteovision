import Anthropic from "@anthropic-ai/sdk";
import { AggregatedWeather } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const METIER_LABELS: Record<string, string> = {
  viticulteur: "viticulteur / arboriculteur",
  agriculteur: "agriculteur / céréalier",
  btp: "professionnel du BTP / construction",
  transport: "transporteur / logisticien",
  evenementiel: "professionnel de l'événementiel",
  nautisme: "navigateur / pêcheur",
  pompier: "pompier / sécurité civile",
  grand_public: "grand public",
  autre: "professionnel",
};

export async function generateSynthesis(
  weather: AggregatedWeather,
  metier: string = "grand_public"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateFallbackSynthesis(weather, metier);
  }

  const metierLabel = METIER_LABELS[metier] ?? metier;
  const validSources = weather.sources.filter((s) => !s.error);
  const divergences = weather.divergences.filter((d) => d.severity !== "faible");

  const dataContext = {
    ville: weather.location.name,
    temperature: `${weather.temperature.toFixed(1)}°C`,
    ressenti: `${weather.feelsLike.toFixed(1)}°C`,
    humidite: `${weather.humidity.toFixed(0)}%`,
    vent: `${weather.windSpeed.toFixed(0)} km/h`,
    precipitations: `${weather.precipitation.toFixed(1)} mm`,
    pression: `${weather.pressure.toFixed(0)} hPa`,
    uv: weather.uvIndex.toFixed(1),
    description: weather.description,
    sources_valides: validSources.length,
    divergences: divergences.map((d) => d.message),
    viticulture: metier === "viticulteur" ? {
      risque_gel: weather.viticulture.frostRiskLevel,
      risque_mildiou: weather.viticulture.mildewRisk,
      etp: `${weather.viticulture.etp} mm`,
      cumul_pluie_7j: `${weather.viticulture.rainCumul7d} mm`,
      fenetre_traitement: weather.viticulture.treatmentWindow ? "Favorable" : "Défavorable",
    } : undefined,
  };

  const prompt = `Tu es un assistant météorologique expert. Voici les données météo agrégées de ${validSources.length} sources pour ${weather.location.name} :

${JSON.stringify(dataContext, null, 2)}

Rédige une synthèse météo en français, en 3 à 4 phrases maximum, adaptée à un ${metierLabel}.
${divergences.length > 0 ? "Mentionne clairement les divergences importantes entre sources." : ""}
${metier === "viticulteur" ? "Inclus une mention sur le risque gel et le risque mildiou." : ""}
${metier === "btp" ? "Mentionne si les conditions sont favorables pour le travail en hauteur (vent, pluie)." : ""}
${metier === "transport" ? "Mentionne les risques de verglas, brouillard ou vent violent sur les routes." : ""}

Sois précis, professionnel et concis. Pas de bullet points, uniquement du texte fluide.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return generateFallbackSynthesis(weather, metier);
  } catch (err) {
    console.error("Erreur Claude:", err);
    return generateFallbackSynthesis(weather, metier);
  }
}

function generateFallbackSynthesis(weather: AggregatedWeather, metier: string): string {
  const { temperature, humidity, windSpeed, precipitation, description, validSources, divergences } = weather;
  const city = weather.location.name;

  let text = `À ${city}, les conditions actuelles indiquent ${description.toLowerCase()} avec une température de ${temperature.toFixed(1)}°C (ressenti ${weather.feelsLike.toFixed(1)}°C). `;
  text += `L'humidité est de ${humidity.toFixed(0)}% et le vent souffle à ${windSpeed.toFixed(0)} km/h. `;

  if (precipitation > 0.5) {
    text += `Des précipitations de ${precipitation.toFixed(1)} mm sont enregistrées. `;
  }

  const highDivergences = divergences.filter((d) => d.severity === "élevée");
  if (highDivergences.length > 0) {
    text += `Attention : divergence significative entre les ${validSources} sources consultées concernant ${highDivergences[0].metricLabel.toLowerCase()}. `;
  }

  if (metier === "viticulteur" && weather.viticulture.frostRisk) {
    text += `Risque de gel ${weather.viticulture.frostRiskLevel} à surveiller pour la vigne.`;
  }

  return text;
}
