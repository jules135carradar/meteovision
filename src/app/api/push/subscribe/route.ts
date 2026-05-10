import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, city, lat, lon, thresholds } = await request.json();

    if (!subscription?.endpoint || !city || !lat || !lon) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        endpoint:  subscription.endpoint,
        p256dh:    subscription.keys.p256dh,
        auth:      subscription.keys.auth,
        city,
        lat,
        lon,
        thresholds,
      }, { onConflict: "endpoint" });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
