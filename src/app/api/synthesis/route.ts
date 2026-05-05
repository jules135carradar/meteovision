import { NextRequest, NextResponse } from "next/server";
import { generateSynthesis } from "@/lib/claude";
import { AggregatedWeather } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weather, metier } = body as { weather: AggregatedWeather; metier?: string };

    if (!weather || !weather.location) {
      return NextResponse.json({ error: "Données météo manquantes" }, { status: 400 });
    }

    const synthesis = await generateSynthesis(weather, metier ?? "grand_public");
    return NextResponse.json({ synthesis });
  } catch (err) {
    console.error("Erreur synthesis:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la synthèse" },
      { status: 500 }
    );
  }
}
