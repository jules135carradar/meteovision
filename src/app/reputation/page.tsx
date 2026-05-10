"use client";

import { useEffect, useState } from "react";
import { ReputationRecord } from "@/lib/types";

const SOURCE_NAMES: Record<string, string> = {
  "open-meteo-ecmwf": "Open-Meteo ECMWF",
  "open-meteo-gfs":   "Open-Meteo GFS (NOAA)",
  "open-meteo-icon":  "Open-Meteo ICON (DWD)",
  "open-meteo-mf":    "Open-Meteo MF",
  "open-meteo-ukmo":  "Open-Meteo UKMO",
  "open-meteo-gem":   "Open-Meteo GEM",
  "yr-no":            "Yr.no",
  "wttr-in":          "wttr.in",
  "openweathermap":   "OpenWeatherMap",
  "weatherapi":       "WeatherAPI.com",
};

const SOURCE_FLAGS: Record<string, string> = {
  "open-meteo-ecmwf": "🇪🇺",
  "open-meteo-gfs":   "🇺🇸",
  "open-meteo-icon":  "🇩🇪",
  "open-meteo-mf":    "🇫🇷",
  "open-meteo-ukmo":  "🇬🇧",
  "open-meteo-gem":   "🇨🇦",
  "yr-no":            "🇳🇴",
  "wttr-in":          "🌐",
  "openweathermap":   "🌍",
  "weatherapi":       "🌍",
};

function scoreGradient(score: number): string {
  if (score >= 70) return "linear-gradient(90deg, #10b981, #34d399)";
  if (score >= 55) return "linear-gradient(90deg, #f59e0b, #fbbf24)";
  return "linear-gradient(90deg, #ef4444, #f87171)";
}

function scoreColor(score: number): string {
  if (score >= 70) return "#047857";
  if (score >= 55) return "#b45309";
  return "#991b1b";
}

function scoreBg(score: number): string {
  if (score >= 70) return "linear-gradient(135deg, #f0fdf4, #d1fae5)";
  if (score >= 55) return "linear-gradient(135deg, #fefce8, #fde68a)";
  return "linear-gradient(135deg, #fff1f2, #fecaca)";
}

function scoreBorder(score: number): string {
  if (score >= 70) return "#a7f3d0";
  if (score >= 55) return "#fcd34d";
  return "#fca5a5";
}

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

export default function ReputationPage() {
  const [records, setRecords]   = useState<ReputationRecord[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/reputation")
      .then((r) => r.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = records.reduce((s, r) => s + r.nb_votes, 0);
  const bestSource = records[0];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 56 }}>📊</span>
        <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 300, color: "#1e293b", margin: "16px 0 8px" }}>
          Réputation des sources météo
        </h1>
        <p style={{ color: "#94a3b8", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Les scores évoluent à chaque vote. Une source fiable pèse plus dans l'agrégation finale.
        </p>
      </div>

      {/* Stats globales */}
      {!loading && records.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28,
        }}>
          <StatCard icon="🗳️" label="Votes total" value={totalVotes.toString()} color="#6d28d9" bg="linear-gradient(135deg,#fdf4ff,#ede9fe)" border="#ddd6fe" />
          <StatCard icon="🏆" label="Meilleure source" value={SOURCE_NAMES[bestSource?.source] ?? "—"} color="#047857" bg="linear-gradient(135deg,#f0fdf4,#d1fae5)" border="#a7f3d0" small />
          <StatCard icon="📈" label="Score moyen" value={`${(records.reduce((s,r)=>s+r.score,0)/records.length).toFixed(1)}`} color="#0369a1" bg="linear-gradient(135deg,#f0f9ff,#e0f2fe)" border="#7dd3fc" />
        </div>
      )}

      {/* Barème */}
      <div style={{
        borderRadius: 16, overflow: "hidden", marginBottom: 28,
        border: "2px solid transparent",
        background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#10b981,#f59e0b,#ef4444) border-box",
      }}>
        <div style={{ background: "linear-gradient(90deg,#047857,#b45309,#991b1b)", padding: "11px 20px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>⚖️ Barème des votes</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", padding: "16px 20px", gap: 8 }}>
          {[
            { pts: "+3 pts", label: "Oui, exacte",    emoji: "✅", color: "#047857", bg: "#f0fdf4" },
            { pts: "+1 pt",  label: "Partiellement",  emoji: "🤔", color: "#b45309", bg: "#fefce8" },
            { pts: "−3 pts", label: "Non, incorrecte",emoji: "❌", color: "#991b1b", bg: "#fff1f2" },
          ].map(({ pts, label, emoji, color, bg }) => (
            <div key={pts} style={{ textAlign: "center", background: bg, borderRadius: 12, padding: "12px 8px" }}>
              <div style={{ fontSize: 22 }}>{emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 4 }}>{pts}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", paddingBottom: 12 }}>
          Pros terrain (viticulteur, BTP…) = poids ×1,5 · 1 vote/IP/ville/jour
        </p>
      </div>

      {/* Liste des sources */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: 16, background: "#f1f5f9" }} />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗳️</div>
          <p>Aucun vote enregistré pour l'instant.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Score initial de chaque source : 50/100</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((record, i) => (
            <SourceRow key={record.source} record={record} rank={i + 1} />
          ))}
        </div>
      )}

      <p style={{ color: "#cbd5e1", fontSize: 11, textAlign: "center", marginTop: 24 }}>
        Score initial : 50/100 · Mis à jour en temps réel après chaque vote
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, border, small = false }: {
  icon: string; label: string; value: string; color: string; bg: string; border: string; small?: boolean;
}) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: small ? 13 : 22, fontWeight: 700, color, marginTop: 4, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function SourceRow({ record, rank }: { record: ReputationRecord; rank: number }) {
  const score  = record.score;
  const name   = SOURCE_NAMES[record.source] ?? record.source;
  const flag   = SOURCE_FLAGS[record.source] ?? "🌐";
  const rankLabel = RANK_EMOJI[rank - 1] ?? `${rank}.`;
  const total  = record.nb_votes;

  const pctOk      = total > 0 ? Math.round(record.nb_correct   / total * 100) : 0;
  const pctPartial = total > 0 ? Math.round(record.nb_partial    / total * 100) : 0;
  const pctBad     = total > 0 ? Math.round(record.nb_incorrect  / total * 100) : 0;

  return (
    <div style={{
      background: scoreBg(score),
      border: `1.5px solid ${scoreBorder(score)}`,
      borderRadius: 16,
      padding: "16px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{rankLabel}</span>
        <span style={{ fontSize: 18 }}>{flag}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </span>
            <span style={{ fontWeight: 800, fontSize: 20, color: scoreColor(score), flexShrink: 0, marginLeft: 12 }}>
              {score.toFixed(1)}
            </span>
          </div>

          {/* Barre de score */}
          <div style={{ width: "100%", background: "rgba(255,255,255,0.6)", borderRadius: 8, height: 8, marginBottom: total > 0 ? 10 : 0 }}>
            <div style={{
              width: `${score}%`, height: "100%", borderRadius: 8,
              background: scoreGradient(score), transition: "width 0.5s ease",
            }} />
          </div>

          {/* Détail votes */}
          {total > 0 && (
            <>
              {/* Barre tricolore */}
              <div style={{ display: "flex", height: 4, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${pctOk}%`,      background: "#10b981" }} />
                <div style={{ width: `${pctPartial}%`, background: "#f59e0b" }} />
                <div style={{ width: `${pctBad}%`,     background: "#ef4444" }} />
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>
                  {total} vote{total > 1 ? "s" : ""}
                </span>
                <span style={{ color: "#047857" }}>✓ {record.nb_correct} ({pctOk}%)</span>
                <span style={{ color: "#b45309" }}>~ {record.nb_partial} ({pctPartial}%)</span>
                <span style={{ color: "#991b1b" }}>✗ {record.nb_incorrect} ({pctBad}%)</span>
              </div>
            </>
          )}

          {total === 0 && (
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Aucun vote — score initial 50</span>
          )}
        </div>
      </div>
    </div>
  );
}
