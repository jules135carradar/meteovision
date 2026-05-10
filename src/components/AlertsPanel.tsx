"use client";

import { useState } from "react";
import { AggregatedHourlyForecast } from "@/lib/types";
import { useAlerts } from "@/lib/useAlerts";

// ─── Définitions des alertes par métier ──────────────────────────────────────

export interface AlertDef {
  id: string;
  label: string;
  icon: string;
  unit: string;
  defaultThreshold: number;
  severity: "warning" | "danger";
  /** retourne la valeur à comparer, null si pas de données */
  getValue: (h: AggregatedHourlyForecast) => number;
  /** true = alerte si valeur SOUS le seuil, false = DESSUS */
  below: boolean;
  metiers: string[];
}

const ALL = ["viticulteur","agriculteur","grandes_cultures","apiculture","forestier","sport_outdoor","btp","transport","evenementiel","nautisme","pompier"];

const ALERT_DEFS: AlertDef[] = [
  // ── Température ──────────────────────────────────────────────────────────
  {
    id: "gel",
    label: "Gel (T° min)",
    icon: "🥶",
    unit: "°C",
    defaultThreshold: 0,
    severity: "danger",
    getValue: (h) => h.temperature,
    below: true,
    metiers: ["viticulteur","agriculteur","grandes_cultures","apiculture","btp","transport","sport_outdoor"],
  },
  {
    id: "canicule",
    label: "Canicule (T° max)",
    icon: "🌡️",
    unit: "°C",
    defaultThreshold: 35,
    severity: "warning",
    getValue: (h) => h.temperature,
    below: false,
    metiers: ["agriculteur","grandes_cultures","apiculture","btp","evenementiel","sport_outdoor","transport"],
  },
  // ── Vent ─────────────────────────────────────────────────────────────────
  {
    id: "vent_traitement",
    label: "Vent (traitement impossible)",
    icon: "💨",
    unit: "km/h",
    defaultThreshold: 15,
    severity: "warning",
    getValue: (h) => h.windSpeed,
    below: false,
    metiers: ["viticulteur","agriculteur","grandes_cultures"],
  },
  {
    id: "vent_grue",
    label: "Vent (arrêt grue)",
    icon: "🏗️",
    unit: "km/h",
    defaultThreshold: 45,
    severity: "danger",
    getValue: (h) => h.windSpeed,
    below: false,
    metiers: ["btp"],
  },
  {
    id: "vent_fort",
    label: "Vent fort",
    icon: "💨",
    unit: "km/h",
    defaultThreshold: 50,
    severity: "danger",
    getValue: (h) => h.windSpeed,
    below: false,
    metiers: ["nautisme","evenementiel","forestier","sport_outdoor","transport"],
  },
  // ── Pluie ────────────────────────────────────────────────────────────────
  {
    id: "pluie",
    label: "Pluie (mm/h)",
    icon: "🌧️",
    unit: "mm",
    defaultThreshold: 3,
    severity: "warning",
    getValue: (h) => h.precipitation,
    below: false,
    metiers: ALL,
  },
  // ── Humidité ─────────────────────────────────────────────────────────────
  {
    id: "humidite_mildiou",
    label: "Humidité (risque mildiou)",
    icon: "🦠",
    unit: "%",
    defaultThreshold: 80,
    severity: "warning",
    getValue: (h) => h.humidity,
    below: false,
    metiers: ["viticulteur","agriculteur","grandes_cultures"],
  },
  {
    id: "humidite_miel",
    label: "Humidité (fermentation miel)",
    icon: "🍯",
    unit: "%",
    defaultThreshold: 60,
    severity: "warning",
    getValue: (h) => h.humidity,
    below: false,
    metiers: ["apiculture"],
  },
  // ── Orage ────────────────────────────────────────────────────────────────
  {
    id: "orage",
    label: "Risque d'orage",
    icon: "⛈️",
    unit: "(code WMO ≥ 95)",
    defaultThreshold: 95,
    severity: "danger",
    getValue: (h) => h.weatherCode,
    below: false,
    metiers: ["nautisme","sport_outdoor","evenementiel","btp","forestier","transport"],
  },
  // ── Sécheresse ────────────────────────────────────────────────────────────
  {
    id: "secheresse",
    label: "Sécheresse (HR basse)",
    icon: "🏜️",
    unit: "%",
    defaultThreshold: 30,
    severity: "warning",
    getValue: (h) => h.humidity,
    below: true,
    metiers: ["forestier","agriculteur","grandes_cultures","apiculture"],
  },
];

// ─── Vérification des alertes sur les 48h ────────────────────────────────────

export interface TriggeredAlert {
  def: AlertDef;
  threshold: number;
  worstValue: number;
  firstTime: Date;
}

export function checkAlerts(
  hourly: AggregatedHourlyForecast[],
  defs: AlertDef[],
  isEnabled: (id: string) => boolean,
  getThreshold: (id: string, def: number) => number,
): TriggeredAlert[] {
  const now = Date.now();
  const next48 = hourly.filter((h) => {
    const t = new Date(h.time).getTime();
    return t > now && t <= now + 48 * 3600000;
  });

  return defs.flatMap((def) => {
    if (!isEnabled(def.id)) return [];
    const threshold = getThreshold(def.id, def.defaultThreshold);
    const triggered = next48.filter((h) => {
      const v = def.getValue(h);
      return def.below ? v < threshold : v > threshold;
    });
    if (triggered.length === 0) return [];
    const values = triggered.map((h) => def.getValue(h));
    const worst = def.below ? Math.min(...values) : Math.max(...values);
    return [{
      def,
      threshold,
      worstValue: worst,
      firstTime: new Date(triggered[0].time),
    }];
  });
}

// ─── Composant principal ──────────────────────────────────────────────────────

function formatDay(d: Date): string {
  const now = new Date();
  const diff = d.getDate() - now.getDate();
  if (diff === 0) return `Aujourd'hui ${d.getHours()}h`;
  if (diff === 1) return `Demain ${d.getHours()}h`;
  return d.toLocaleDateString("fr-FR", { weekday: "long", hour: "2-digit" }).replace(":", "h");
}

export default function AlertsPanel({
  hourly,
  metier,
}: {
  hourly: AggregatedHourlyForecast[];
  metier: string;
}) {
  const { toggle, setThreshold, isEnabled, getThreshold } = useAlerts();
  const [open, setOpen] = useState(false);

  const relevantDefs = ALERT_DEFS.filter((d) => d.metiers.includes(metier));
  if (relevantDefs.length === 0) return null;

  const triggered = checkAlerts(hourly, relevantDefs, isEnabled, getThreshold);

  return (
    <div style={{
      borderRadius: 20, overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#ef4444,#f59e0b,#6d28d9) border-box",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", textAlign: "left", border: "none", cursor: "pointer",
          background: "linear-gradient(90deg, #dc2626 0%, #d97706 55%, #7c3aed 100%)",
          padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>🔔 Alertes seuils</span>
          {triggered.length > 0 && (
            <span style={{
              background: "#fff", color: "#dc2626", fontWeight: 800,
              fontSize: 12, borderRadius: 999, padding: "2px 8px",
            }}>
              {triggered.length} active{triggered.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
          style={{ color: "#fff", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Alertes actives (toujours visibles) */}
      {triggered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {triggered.map((t) => (
            <div key={t.def.id} style={{
              background: t.def.severity === "danger"
                ? "linear-gradient(135deg,#fff1f2,#fecaca)"
                : "linear-gradient(135deg,#fefce8,#fde68a)",
              borderTop: `2px solid ${t.def.severity === "danger" ? "#fca5a5" : "#fcd34d"}`,
              padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>{t.def.icon}</span>
              <div>
                <div style={{
                  fontWeight: 700, fontSize: 13,
                  color: t.def.severity === "danger" ? "#991b1b" : "#92400e",
                }}>
                  {t.def.label}
                </div>
                <div style={{ fontSize: 12, color: t.def.severity === "danger" ? "#b91c1c" : "#b45309", marginTop: 2 }}>
                  {t.def.below
                    ? `T° attendue : ${t.worstValue.toFixed(1)}${t.def.unit} (seuil : ${t.threshold}${t.def.unit})`
                    : `Valeur attendue : ${t.worstValue.toFixed(1)} ${t.def.unit} (seuil : ${t.threshold})`
                  } · Dès {formatDay(t.firstTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Config (dépliable) */}
      {open && (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Activez les alertes souhaitées. Elles vérifient les 48h à venir à chaque chargement.
          </p>
          {relevantDefs.map((def) => {
            const enabled = isEnabled(def.id);
            const threshold = getThreshold(def.id, def.defaultThreshold);
            return (
              <div key={def.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: enabled ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#f8fafc",
                border: `1.5px solid ${enabled ? "#86efac" : "#e2e8f0"}`,
                borderRadius: 12, padding: "12px 14px",
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{def.icon}</span>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(def.id, def.defaultThreshold)}
                  style={{
                    flexShrink: 0, width: 40, height: 22, borderRadius: 999,
                    background: enabled ? "#059669" : "#cbd5e1",
                    border: "none", cursor: "pointer", position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2,
                    left: enabled ? 20 : 2,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                  }} />
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{def.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {def.below ? "Alerte si en dessous de" : "Alerte si au-dessus de"} {threshold} {def.unit !== "(code WMO ≥ 95)" ? def.unit : ""}
                  </div>
                </div>

                {/* Seuil ajustable */}
                {enabled && def.id !== "orage" && (
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(def.id, Number(e.target.value))}
                    style={{
                      width: 64, padding: "4px 8px", borderRadius: 8,
                      border: "1.5px solid #a7f3d0", fontSize: 13, fontWeight: 700,
                      color: "#047857", textAlign: "center", background: "#fff",
                    }}
                  />
                )}
                <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{def.unit !== "(code WMO ≥ 95)" ? def.unit : ""}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
