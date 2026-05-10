import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Thresholds {
  gel?: number | null;
  vent?: number | null;
  pluie?: number | null;
  humidite?: number | null;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
}

async function fetchHourly(lat: number, lon: number): Promise<HourlyForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,precipitation,relative_humidity_2m&forecast_days=2&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const times: string[] = data.hourly?.time ?? [];
  const temps: number[] = data.hourly?.temperature_2m ?? [];
  const winds: number[] = data.hourly?.wind_speed_10m ?? [];
  const precips: number[] = data.hourly?.precipitation ?? [];
  const humids: number[] = data.hourly?.relative_humidity_2m ?? [];
  return times.map((t, i) => ({
    time: t,
    temperature: temps[i],
    windSpeed: winds[i],
    precipitation: precips[i],
    humidity: humids[i],
  }));
}

function checkAlerts(hourly: HourlyForecast[], thresholds: Thresholds): string[] {
  const alerts: string[] = [];
  const now = Date.now();
  const in48h = now + 48 * 3600 * 1000;

  const next48 = hourly.filter(h => {
    const t = new Date(h.time).getTime();
    return t >= now && t <= in48h;
  });

  if (thresholds.gel != null) {
    const hit = next48.find(h => h.temperature <= thresholds.gel!);
    if (hit) {
      const label = new Date(hit.time).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" });
      alerts.push(`🥶 Gel prévu ${label} (${hit.temperature.toFixed(1)}°C)`);
    }
  }

  if (thresholds.vent != null) {
    const hit = next48.find(h => h.windSpeed >= thresholds.vent!);
    if (hit) {
      const label = new Date(hit.time).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" });
      alerts.push(`💨 Vent fort prévu ${label} (${hit.windSpeed.toFixed(0)} km/h)`);
    }
  }

  if (thresholds.pluie != null) {
    const hit = next48.find(h => h.precipitation >= thresholds.pluie!);
    if (hit) {
      const label = new Date(hit.time).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" });
      alerts.push(`🌧️ Pluie forte prévue ${label} (${hit.precipitation.toFixed(1)} mm)`);
    }
  }

  if (thresholds.humidite != null) {
    const hit = next48.find(h => h.humidity >= thresholds.humidite!);
    if (hit) {
      const label = new Date(hit.time).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" });
      alerts.push(`🦠 Humidité élevée prévue ${label} (${hit.humidity.toFixed(0)}%)`);
    }
  }

  return alerts;
}

export async function GET(request: NextRequest) {
  // Vérifier le secret cron
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:chevroton.jules@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error || !subscriptions) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      const hourly = await fetchHourly(sub.lat, sub.lon);
      const alerts = checkAlerts(hourly, sub.thresholds ?? {});

      if (alerts.length === 0) continue;

      const payload = JSON.stringify({
        title: `⚠️ Alerte météo — ${sub.city}`,
        body: alerts.join("\n"),
        url: `/ville/${sub.city.toLowerCase().replace(/\s+/g, "-")}?lat=${sub.lat}&lon=${sub.lon}&city=${encodeURIComponent(sub.city)}`,
      });

      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err: unknown) {
      // Supprimer les abonnements expirés
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
