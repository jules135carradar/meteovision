import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}` +
      `&count=8&language=fr&format=json`;

    const res = await fetch(url, {
      headers: { "User-Agent": "MeteoAgregee/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
    const data = await res.json();

    const results = (data.results ?? [])
      .filter((r: Record<string, unknown>) => r.country_code === "FR" || r.country === "France")
      .map((r: Record<string, unknown>) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country,
        admin1: r.admin1,
        population: r.population ?? 0,
      }))
      .sort(
        (a: { population: number }, b: { population: number }) =>
          (b.population ?? 0) - (a.population ?? 0)
      );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Erreur geocoding:", err);
    return NextResponse.json({ error: "Erreur de géocodage" }, { status: 500 });
  }
}
