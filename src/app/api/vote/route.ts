import { NextRequest, NextResponse } from "next/server";
import { checkVoteExists, submitVote } from "@/lib/supabase";
import { hashIp } from "@/lib/utils";
import { VoteValue } from "@/lib/types";
import { getTodayDateStr } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ville, vote, metier } = body as {
      ville: string;
      vote: VoteValue;
      metier?: string;
    };

    if (!ville || !vote) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (!["oui", "partiellement", "non"].includes(vote)) {
      return NextResponse.json({ error: "Vote invalide" }, { status: 400 });
    }

    // Récupérer l'IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const ipHash = hashIp(ip);
    const date = getTodayDateStr();

    // Vérifier anti-spam (1 vote par IP par ville par jour)
    const alreadyVoted = await checkVoteExists(ipHash, ville, date);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: "Vous avez déjà voté pour cette ville aujourd'hui" },
        { status: 429 }
      );
    }

    const result = await submitVote({
      ville,
      date,
      vote,
      metier,
      ip_hash: ipHash,
      source: "aggregated",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Vote enregistré, merci !" });
  } catch (err) {
    console.error("Erreur vote:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
