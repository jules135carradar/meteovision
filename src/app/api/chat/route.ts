import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const METIER_LABELS: Record<string, string> = {
  grand_public:     "grand public",
  viticulteur:      "viticulteur",
  agriculteur:      "agriculteur",
  grandes_cultures: "agriculteur grandes cultures",
  apiculture:       "apiculteur",
  forestier:        "forestier",
  sport_outdoor:    "sportif outdoor",
  btp:              "professionnel du BTP",
  transport:        "transporteur",
  evenementiel:     "organisateur d'événements",
  nautisme:         "navigateur",
  pompier:          "pompier",
};

export async function POST(request: NextRequest) {
  try {
    const { question, weatherContext, metier, history } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question vide" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ answer: "Le service IA n'est pas configuré." });
    }

    const metierLabel = METIER_LABELS[metier] ?? "utilisateur";

    const today = new Date();
    const todayStr = today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const systemPrompt = `Tu es un assistant météo expert intégré à MétéoVision. L'utilisateur est ${metierLabel === "grand public" ? "du" : "un"} ${metierLabel}.

Aujourd'hui c'est le ${todayStr}. Utilise cette date pour calculer correctement les jours de la semaine — ne te trompe jamais sur le jour correspondant à une date.

Voici les données météo actuelles et les prévisions pour ${weatherContext.city} :

CONDITIONS ACTUELLES :
- Température : ${weatherContext.temperature}°C (ressenti ${weatherContext.feelsLike}°C)
- Humidité : ${weatherContext.humidity}%
- Vent : ${weatherContext.windSpeed} km/h
- Précipitations : ${weatherContext.precipitation} mm
- Pression : ${weatherContext.pressure} hPa
- UV : ${weatherContext.uvIndex}
- Description : ${weatherContext.description}
${weatherContext.soilTemperature !== null ? `- Sol : ${weatherContext.soilTemperature}°C, humidité sol ${weatherContext.soilMoisture}%` : ""}
${weatherContext.winklerIndex > 0 ? `- Indice Winkler : ${weatherContext.winklerIndex} degrés-jours` : ""}

PRÉVISIONS 7 JOURS :
${weatherContext.daily.map((d: {date: string; tempMax: number; tempMin: number; precipitation: number; windSpeed: number; description: string}) =>
  `- ${d.date} : ${d.tempMin}°C / ${d.tempMax}°C, ${d.precipitation}mm de pluie, vent ${d.windSpeed}km/h, ${d.description}`
).join("\n")}

PRÉVISIONS HORAIRES (48h) :
${weatherContext.hourly.slice(0, 48).map((h: {time: string; temperature: number; precipitation: number; precipitationProbability: number; windSpeed: number; description: string}) => {
  const d = new Date(h.time);
  const label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `- ${label} : ${h.temperature.toFixed(1)}°C, pluie ${h.precipitation.toFixed(1)}mm (${h.precipitationProbability.toFixed(0)}%), vent ${h.windSpeed.toFixed(0)}km/h`;
}).join("\n")}
${weatherContext.viticulture ? `
INDICATEURS VITICULTURE :
- Risque gel : ${weatherContext.viticulture.frostRiskLevel}
- Risque mildiou : ${weatherContext.viticulture.mildewRisk}
- ETP : ${weatherContext.viticulture.etp} mm
- Fenêtre de traitement : ${weatherContext.viticulture.treatmentWindow ? "Favorable" : "Défavorable"}
- Cumul pluie 7j : ${weatherContext.viticulture.rainCumul7d} mm` : ""}

Réponds en français en 2-3 phrases maximum. Sois direct et concret. Donne un jour précis si possible. Ne dépasse jamais 3 phrases. Base-toi uniquement sur les données fournies.`;

    const messages = [
      ...(history ?? []),
      { role: "user" as const, content: question },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      system: systemPrompt,
      messages,
    });

    const answer = response.content[0].type === "text"
      ? response.content[0].text
      : "Désolé, je n'ai pas pu répondre à votre question.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
