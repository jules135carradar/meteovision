import { NextResponse } from "next/server";
import { getAllReputationRecords } from "@/lib/supabase";

export async function GET() {
  try {
    const records = await getAllReputationRecords();
    return NextResponse.json(records, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Erreur reputation:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
