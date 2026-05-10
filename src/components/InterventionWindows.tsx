"use client";

import { AggregatedHourlyForecast } from "@/lib/types";

// ─── Règles par métier ────────────────────────────────────────────────────────

interface WindowDef {
  label: string;
  icon: string;
  description: string;
  minHours: number;
  dayOnly: boolean;
  months: number[]; // mois actifs (1=jan … 12=dec)
  check: (h: AggregatedHourlyForecast) => boolean;
}

const ALL_MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

const RULES: Record<string, WindowDef[]> = {
  viticulteur: [
    {
      label: "Taille de la vigne",
      icon: "✂️", description: "T° > 2°C · Vent < 30 km/h · Sec",
      minHours: 3, dayOnly: true, months: [1,2,3,12],
      check: (h) => h.temperature > 2 && h.windSpeed < 30 && h.precipitation < 0.5,
    },
    {
      label: "Protection gel printanier",
      icon: "🥶", description: "Surveillance T° nocturne — risque gel",
      minHours: 1, dayOnly: false, months: [3,4,5],
      check: (h) => h.temperature > 0, // fenêtre = heures sans gel
    },
    {
      label: "Traitement phyto (mildiou / oïdium)",
      icon: "🧪", description: "Vent < 15 km/h · Sec · 8–28°C",
      minHours: 2, dayOnly: true, months: [4,5,6,7,8,9],
      check: (h) => h.windSpeed < 15 && h.precipitation < 0.1 && h.temperature >= 8 && h.temperature <= 28,
    },
    {
      label: "Vendanges",
      icon: "🍇", description: "Sec · T° > 15°C · Vent < 25 km/h",
      minHours: 4, dayOnly: true, months: [8,9,10],
      check: (h) => h.precipitation < 0.1 && h.temperature > 15 && h.windSpeed < 25,
    },
    {
      label: "Travaux de sol / Labour",
      icon: "🚜", description: "Sec · Sol non saturé",
      minHours: 4, dayOnly: true, months: [10,11],
      check: (h) => h.precipitation < 0.1 && h.windSpeed < 35,
    },
  ],

  agriculteur: [
    {
      label: "Semis de printemps",
      icon: "🌱", description: "T° > 8°C · Sec · Vent < 25 km/h",
      minHours: 3, dayOnly: true, months: [3,4,5,6],
      check: (h) => h.temperature > 8 && h.precipitation < 0.3 && h.windSpeed < 25,
    },
    {
      label: "Traitement phyto",
      icon: "🧪", description: "Vent < 19 km/h · Sec · 5–28°C",
      minHours: 2, dayOnly: true, months: [4,5,6,7,8,9],
      check: (h) => h.windSpeed < 19 && h.precipitation < 0.1 && h.temperature >= 5 && h.temperature <= 28,
    },
    {
      label: "Irrigation",
      icon: "💧", description: "T° > 18°C · Vent < 15 km/h",
      minHours: 2, dayOnly: true, months: [6,7,8,9],
      check: (h) => h.temperature > 18 && h.windSpeed < 15,
    },
    {
      label: "Semis d'automne (blé, orge)",
      icon: "🌾", description: "T° 5–20°C · Sec · Sol non saturé",
      minHours: 4, dayOnly: true, months: [9,10,11],
      check: (h) => h.temperature >= 5 && h.temperature <= 20 && h.precipitation < 0.1,
    },
    {
      label: "Travaux de sol",
      icon: "🚜", description: "Sec · Vent < 30 km/h",
      minHours: 4, dayOnly: true, months: [11,12,1,2],
      check: (h) => h.precipitation < 0.3 && h.windSpeed < 30 && h.temperature > 2,
    },
  ],

  grandes_cultures: [
    {
      label: "Semis de printemps",
      icon: "🌱", description: "T° > 8°C · Sec · Vent < 25 km/h",
      minHours: 4, dayOnly: true, months: [3,4,5],
      check: (h) => h.temperature > 8 && h.precipitation < 0.1 && h.windSpeed < 25,
    },
    {
      label: "Traitement (fongicide / herbicide)",
      icon: "🧪", description: "Vent < 19 km/h · Sec · T° 5–25°C",
      minHours: 2, dayOnly: true, months: [4,5,6,7],
      check: (h) => h.windSpeed < 19 && h.precipitation < 0.1 && h.temperature >= 5 && h.temperature <= 25,
    },
    {
      label: "Moisson / Récolte",
      icon: "🌾", description: "T° > 15°C · HR < 70% · Sec",
      minHours: 4, dayOnly: true, months: [6,7,8],
      check: (h) => h.temperature > 15 && h.humidity < 70 && h.precipitation < 0.1,
    },
    {
      label: "Semis d'automne (blé, colza)",
      icon: "🌱", description: "T° 5–20°C · Sec",
      minHours: 4, dayOnly: true, months: [8,9,10],
      check: (h) => h.temperature >= 5 && h.temperature <= 20 && h.precipitation < 0.1,
    },
    {
      label: "Labour / Préparation sol",
      icon: "🚜", description: "Sec · T° > 2°C",
      minHours: 4, dayOnly: true, months: [10,11,12],
      check: (h) => h.precipitation < 0.3 && h.temperature > 2,
    },
  ],

  apiculture: [
    {
      label: "Surveillance hivernage",
      icon: "🏠", description: "Éviter les visites par T° < 8°C ou vent fort",
      minHours: 2, dayOnly: true, months: [11,12,1,2],
      check: (h) => h.temperature >= 8 && h.windSpeed < 20 && h.precipitation < 0.5,
    },
    {
      label: "Première visite de printemps",
      icon: "🌸", description: "T° > 14°C · Vent < 15 km/h · Sec",
      minHours: 1, dayOnly: true, months: [2,3],
      check: (h) => h.temperature > 14 && h.windSpeed < 15 && h.precipitation < 0.1,
    },
    {
      label: "Période d'essaimage",
      icon: "🐝", description: "T° > 18°C · Sec · Surveiller les colonies",
      minHours: 2, dayOnly: true, months: [4,5,6],
      check: (h) => h.temperature > 18 && h.precipitation < 0.1 && h.windSpeed < 20,
    },
    {
      label: "Butinage / Grande miellée",
      icon: "🍯", description: "T° > 12°C · Vent < 20 km/h · Sec",
      minHours: 3, dayOnly: true, months: [6,7,8],
      check: (h) => h.temperature > 12 && h.windSpeed < 20 && h.precipitation < 0.1,
    },
    {
      label: "Récolte du miel",
      icon: "🫙", description: "T° > 20°C · Sec · HR < 60%",
      minHours: 3, dayOnly: true, months: [7,8,9],
      check: (h) => h.temperature > 20 && h.precipitation < 0.1 && h.humidity < 60,
    },
    {
      label: "Préparation hivernage",
      icon: "🍂", description: "T° > 10°C · Derniers traitements varroa",
      minHours: 2, dayOnly: true, months: [9,10],
      check: (h) => h.temperature > 10 && h.precipitation < 0.3 && h.windSpeed < 20,
    },
  ],

  forestier: [
    {
      label: "Abattage (sève basse)",
      icon: "🌲", description: "Vent < 40 km/h · Période optimale",
      minHours: 3, dayOnly: true, months: [10,11,12,1,2,3],
      check: (h) => h.windSpeed < 40 && h.precipitation < 1,
    },
    {
      label: "Débardage / Engins",
      icon: "🚜", description: "Sec · Vent < 30 km/h · Sols portants",
      minHours: 4, dayOnly: true, months: ALL_MONTHS,
      check: (h) => h.windSpeed < 30 && h.precipitation < 0.3,
    },
    {
      label: "Prévention incendie (DFCI)",
      icon: "🔥", description: "Surveiller : T° > 25°C + HR < 40% + Vent > 30",
      minHours: 1, dayOnly: true, months: [5,6,7,8,9],
      // Fenêtre = heures à risque faible
      check: (h) => !(h.temperature > 25 && h.humidity < 40 && h.windSpeed > 30),
    },
    {
      label: "Plantation / Reboisement",
      icon: "🌱", description: "T° 5–20°C · Humide · Pas de gel",
      minHours: 4, dayOnly: true, months: [10,11,2,3,4],
      check: (h) => h.temperature >= 5 && h.temperature <= 20 && h.precipitation < 2 && h.humidity > 50,
    },
  ],

  sport_outdoor: [
    {
      label: "Randonnée / Raquettes",
      icon: "🥾", description: "Pas d'orage · Vent < 50 km/h · Visibilité OK",
      minHours: 3, dayOnly: true, months: [11,12,1,2,3],
      check: (h) => h.weatherCode < 95 && h.windSpeed < 50 && h.precipitation < 3,
    },
    {
      label: "Trail / Randonnée",
      icon: "🏃", description: "Pas d'orage · T° 5–35°C · Vent < 50 km/h",
      minHours: 3, dayOnly: true, months: [3,4,5,6,7,8,9,10],
      check: (h) => h.weatherCode < 95 && h.temperature >= 5 && h.temperature <= 35 && h.windSpeed < 50 && h.precipitation < 2,
    },
    {
      label: "Cyclisme / VTT",
      icon: "🚴", description: "Sec · Vent < 40 km/h · T° > 8°C",
      minHours: 2, dayOnly: true, months: [3,4,5,6,7,8,9,10],
      check: (h) => h.precipitation < 0.5 && h.windSpeed < 40 && h.temperature > 8,
    },
  ],

  btp: [
    {
      label: "Coulage béton",
      icon: "🪨", description: "T° 5–30°C · Sec · Vent < 30 km/h",
      minHours: 4, dayOnly: true, months: ALL_MONTHS,
      check: (h) => h.temperature >= 5 && h.temperature <= 30 && h.precipitation < 0.1 && h.windSpeed < 30,
    },
    {
      label: "Grue (seuil 45 km/h)",
      icon: "🏗️", description: "Vent < 45 km/h",
      minHours: 2, dayOnly: false, months: ALL_MONTHS,
      check: (h) => h.windSpeed < 45,
    },
    {
      label: "Travaux d'étanchéité / Toiture",
      icon: "🏠", description: "Sec · Vent < 30 km/h · T° > 5°C",
      minHours: 4, dayOnly: true, months: ALL_MONTHS,
      check: (h) => h.precipitation < 0.1 && h.windSpeed < 30 && h.temperature > 5,
    },
  ],

  evenementiel: [
    {
      label: "Événement hivernal extérieur",
      icon: "❄️", description: "Pas de verglas · Vent < 40 km/h",
      minHours: 4, dayOnly: true, months: [11,12,1,2],
      check: (h) => h.windSpeed < 40 && h.precipitation < 1 && !(h.temperature < 0),
    },
    {
      label: "Événement extérieur",
      icon: "🎪", description: "Sec · Vent < 50 km/h · T° > 10°C",
      minHours: 4, dayOnly: true, months: [3,4,5,6,7,8,9,10],
      check: (h) => h.precipitation < 0.5 && h.windSpeed < 50 && h.temperature > 10,
    },
  ],

  nautisme: [
    {
      label: "Sortie hivernale",
      icon: "⚓", description: "Vent < 30 km/h (Bf < 6) · Pas d'orage",
      minHours: 3, dayOnly: true, months: [11,12,1,2,3],
      check: (h) => h.windSpeed < 30 && h.weatherCode < 95,
    },
    {
      label: "Sortie en mer",
      icon: "⛵", description: "Vent < 50 km/h (Bf < 8) · Pas d'orage",
      minHours: 3, dayOnly: true, months: [4,5,6,7,8,9,10],
      check: (h) => h.windSpeed < 50 && h.weatherCode < 95,
    },
  ],

  transport: [
    {
      label: "Conditions sûres",
      icon: "🚛", description: "Pas de verglas · Pas de neige · Bonne visibilité",
      minHours: 2, dayOnly: false, months: ALL_MONTHS,
      check: (h) => !(h.temperature < 3 && h.humidity > 75) && h.weatherCode < 70,
    },
    {
      label: "Vigilance verglas",
      icon: "🧊", description: "T° < 4°C — surveiller les routes",
      minHours: 1, dayOnly: false, months: [11,12,1,2,3],
      // Fenêtre = heures sans risque verglas
      check: (h) => h.temperature >= 3 || h.humidity < 70,
    },
  ],
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function findWindows(
  hourly: AggregatedHourlyForecast[],
  rule: WindowDef
): { start: Date; end: Date; hours: number }[] {
  const now = Date.now();
  const results: { start: Date; end: Date; hours: number }[] = [];
  let winStart: Date | null = null;
  let count = 0;
  let lastTime: Date | null = null;

  for (const h of hourly) {
    const t = new Date(h.time);
    if (t.getTime() <= now) continue;
    const hr = t.getHours();
    if (rule.dayOnly && (hr < 6 || hr >= 20)) {
      if (winStart && count >= rule.minHours && lastTime) {
        results.push({ start: winStart, end: lastTime, hours: count });
        if (results.length >= 3) break;
      }
      winStart = null; count = 0; lastTime = null;
      continue;
    }
    if (rule.check(h)) {
      if (!winStart) winStart = t;
      count++;
      lastTime = t;
    } else {
      if (winStart && count >= rule.minHours && lastTime) {
        results.push({ start: winStart, end: lastTime, hours: count });
        if (results.length >= 3) break;
      }
      winStart = null; count = 0; lastTime = null;
    }
  }
  if (winStart && count >= rule.minHours && lastTime) {
    results.push({ start: winStart, end: lastTime, hours: count });
  }
  return results.slice(0, 3);
}

type SlotColor = "good" | "partial" | "bad" | "none";

function slotColor(
  hourly: AggregatedHourlyForecast[],
  dateStr: string,
  h0: number,
  h1: number,
  rule: WindowDef
): SlotColor {
  const hours = hourly.filter((h) => {
    const t = new Date(h.time);
    return localDateStr(t) === dateStr && t.getHours() >= h0 && t.getHours() < h1;
  });
  if (hours.length === 0) return "none";
  const ok = hours.filter((h) => rule.check(h)).length;
  const ratio = ok / hours.length;
  if (ratio >= 0.75) return "good";
  if (ratio >= 0.35) return "partial";
  return "bad";
}

const SLOT_COLOR_STYLE: Record<SlotColor, { bg: string; border: string }> = {
  good:    { bg: "#dcfce7", border: "#86efac" },
  partial: { bg: "#fef9c3", border: "#fde047" },
  bad:     { bg: "#fee2e2", border: "#fca5a5" },
  none:    { bg: "#f1f5f9", border: "#e2e8f0" },
};
const SLOT_COLOR_TEXT: Record<SlotColor, string> = {
  good: "#15803d", partial: "#92400e", bad: "#991b1b", none: "#94a3b8",
};

function formatDay(d: Date, todayStr: string): string {
  const s = localDateStr(d);
  if (s === todayStr) return "Auj.";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (s === localDateStr(tomorrow)) return "Dem.";
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

function formatHour(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}h`;
}

function formatWindow(win: { start: Date; end: Date; hours: number }, todayStr: string): string {
  const day = formatDay(win.start, todayStr);
  const h0  = formatHour(win.start);
  const h1  = formatHour(new Date(win.end.getTime() + 3600000)); // +1h (inclusive end)
  return `${day} ${h0}–${h1} (${win.hours}h)`;
}

// ─── Composant principal ──────────────────────────────────────────────────────

const SLOTS = [
  { label: "Matin",    h0: 6,  h1: 12 },
  { label: "Après-m.", h0: 12, h1: 18 },
  { label: "Soirée",  h0: 18, h1: 22 },
];

export default function InterventionWindows({
  hourly,
  metier,
}: {
  hourly: AggregatedHourlyForecast[];
  metier: string;
}) {
  const allRules = RULES[metier];
  if (!allRules || hourly.length === 0) return null;

  const today = new Date();
  const todayStr = localDateStr(today);
  const currentMonth = today.getMonth() + 1;

  const rules = allRules.filter((r) => r.months.includes(currentMonth));

  if (rules.length === 0) return null;

  // 7 prochains jours
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{
      borderRadius: 20, overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#059669,#0284c7,#7c3aed) border-box",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #059669 0%, #0284c7 55%, #7c3aed 100%)",
        padding: "13px 24px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>📅 Fenêtres d'intervention</span>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        {rules.map((rule) => {
          const windows = findWindows(hourly, rule);
          const next = windows[0];

          return (
            <div key={rule.label}>
              {/* Titre de la règle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{rule.icon}</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{rule.label}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{rule.description}</span>
                </div>
              </div>

              {/* Prochaine fenêtre */}
              {next ? (
                <div style={{
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  border: "1.5px solid #86efac",
                  borderRadius: 12, padding: "10px 14px", marginBottom: 10,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>Prochaine fenêtre</div>
                    <div style={{ fontSize: 14, color: "#166534", fontWeight: 800, marginTop: 1 }}>
                      {formatWindow(next, todayStr)}
                    </div>
                    {windows.length > 1 && (
                      <div style={{ fontSize: 11, color: "#4ade80", marginTop: 3 }}>
                        + {windows.slice(1).map(w => formatWindow(w, todayStr)).join("  ·  ")}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "#fff1f2", border: "1.5px solid #fca5a5",
                  borderRadius: 12, padding: "10px 14px", marginBottom: 10,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>❌</span>
                  <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                    Aucune fenêtre favorable dans les 7 jours
                  </div>
                </div>
              )}

              {/* Heatmap 7j */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: 4, minWidth: 360 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 52, fontSize: 10, color: "#94a3b8", fontWeight: 600, textAlign: "left", paddingBottom: 4 }} />
                      {days.map((d) => (
                        <th key={localDateStr(d)} style={{
                          fontSize: 11, fontWeight: d === today ? 800 : 600,
                          color: localDateStr(d) === todayStr ? "#0284c7" : "#64748b",
                          textAlign: "center", paddingBottom: 4,
                        }}>
                          {formatDay(d, todayStr)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((slot) => (
                      <tr key={slot.label}>
                        <td style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, paddingRight: 6, whiteSpace: "nowrap" }}>
                          {slot.label}
                        </td>
                        {days.map((d) => {
                          const sc = slotColor(hourly, localDateStr(d), slot.h0, slot.h1, rule);
                          const { bg, border } = SLOT_COLOR_STYLE[sc];
                          const textColor = SLOT_COLOR_TEXT[sc];
                          const icon = sc === "good" ? "✓" : sc === "partial" ? "◐" : sc === "bad" ? "✗" : "·";
                          return (
                            <td key={localDateStr(d)} style={{
                              background: bg, border: `1.5px solid ${border}`,
                              borderRadius: 8, textAlign: "center",
                              fontSize: 13, fontWeight: 700, color: textColor,
                              padding: "6px 4px", minWidth: 38,
                            }}>
                              {icon}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Légende */}
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
                <span style={{ color: "#15803d" }}>✓ Favorable</span>
                <span style={{ color: "#92400e" }}>◐ Partiel</span>
                <span style={{ color: "#991b1b" }}>✗ Défavorable</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
