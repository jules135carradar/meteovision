"use client";

import { useState } from "react";
import { VoteValue, YesterdaySlot } from "@/lib/types";
import { getWeatherIcon } from "@/lib/weather-codes";

const SLOT_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  "Nuit":       { bg: "#f1f5f9", border: "#cbd5e1", label: "#475569" },
  "Matin":      { bg: "#fefce8", border: "#fde68a", label: "#92400e" },
  "Après-midi": { bg: "#fff7ed", border: "#fed7aa", label: "#c2410c" },
  "Soirée":     { bg: "#f5f3ff", border: "#ddd6fe", label: "#5b21b6" },
};

function SlotCard({ slot }: { slot: YesterdaySlot }) {
  const icon   = getWeatherIcon(slot.weatherCode, slot.representativeHour);
  const colors = SLOT_COLORS[slot.label] ?? { bg: "#f8fafc", border: "#e2e8f0", label: "#475569" };
  const hasRain = slot.precipitation >= 1;

  return (
    <div style={{
      background: colors.bg,
      border: `1.5px solid ${colors.border}`,
      borderRadius: 14,
      padding: "12px 14px",
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.label }}>
          {slot.label}
        </span>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      </div>

      <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{slot.hours}</span>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
          {slot.tempMin}° – {slot.tempMax}°
        </span>
        {hasRain ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>
            💧 {slot.precipitation.toFixed(1)} mm
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#cbd5e1" }}>Pas de pluie</span>
        )}
      </div>
    </div>
  );
}

const VOTE_OPTS = [
  {
    vote: "oui"           as VoteValue,
    label: "Oui, exacte",
    emoji: "✅",
    bg: "#f0fdf4", border: "#86efac", color: "#15803d",
    activeBg: "#dcfce7",
  },
  {
    vote: "partiellement" as VoteValue,
    label: "Partiellement",
    emoji: "🤔",
    bg: "#fffbeb", border: "#fcd34d", color: "#b45309",
    activeBg: "#fef9c3",
  },
  {
    vote: "non"           as VoteValue,
    label: "Non, incorrecte",
    emoji: "❌",
    bg: "#fff1f2", border: "#fda4af", color: "#be123c",
    activeBg: "#ffe4e6",
  },
] as const;

interface Props {
  ville: string;
  metier: string;
  yesterdaySlots?: YesterdaySlot[];
}

export default function VoteButton({ ville, metier, yesterdaySlots = [] }: Props) {
  const [selected, setSelected]   = useState<VoteValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState<string | null>(null);

  async function handleVote(vote: VoteValue) {
    if (loading || submitted) return;
    setSelected(vote);
    setLoading(true);
    try {
      const res  = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ville, vote, metier }),
      });
      const data = await res.json();
      if (res.ok) { setSubmitted(true); setMessage(data.message ?? "Vote enregistré !"); }
      else        { setMessage(data.error ?? "Erreur"); setSelected(null); }
    } catch {
      setMessage("Erreur de connexion");
      setSelected(null);
    } finally { setLoading(false); }
  }

  if (submitted) {
    return (
      <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20, padding: "24px 20px", textAlign: "center" }}>
        <span style={{ fontSize: 32 }}>🙏</span>
        <p style={{ color: "#15803d", fontWeight: 600, fontSize: 15, marginTop: 8 }}>{message}</p>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Merci — votre retour terrain améliore l'agrégation.</p>
      </div>
    );
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateLabel = yesterday.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "2px solid transparent",
      background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(90deg,#6d28d9,#2563eb,#059669) border-box",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #4f46e5 0%, #0ea5e9 50%, #10b981 100%)",
        padding: "13px 20px",
      }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>
          📋 La météo d'hier était-elle exacte ?
        </p>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "3px 0 0" }}>
          {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} — votre retour améliore les scores de réputation des sources
        </p>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Blocs horaires */}
        {yesterdaySlots.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: 10 }}>
              Ce qu'il s'est passé hier
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {yesterdaySlots.map((slot) => (
                <SlotCard key={slot.label} slot={slot} />
              ))}
            </div>
          </div>
        )}

        {/* Séparateur */}
        {yesterdaySlots.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>Notre prévision était-elle juste ?</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>
        )}

        {/* Boutons de vote */}
        <div style={{ display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {VOTE_OPTS.map(({ vote, label, emoji, bg, border, color, activeBg }) => {
            const isSelected = selected === vote;
            return (
              <button
                key={vote}
                type="button"
                onClick={() => handleVote(vote)}
                disabled={loading}
                style={{
                  flex: 1,
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: `1.5px solid ${border}`,
                  background: isSelected ? activeBg : bg,
                  color,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading && !isSelected ? 0.5 : 1,
                  transition: "all 0.15s",
                  boxShadow: isSelected ? `0 0 0 2px ${border}` : "none",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = activeBg; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = bg; }}
              >
                <span>{emoji}</span>
                {label}
                {isSelected && loading && (
                  <span style={{
                    width: 12, height: 12,
                    border: `2px solid ${color}`,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {message && !submitted && (
          <p style={{ color: "#be123c", fontSize: 12, marginTop: 10 }}>{message}</p>
        )}
      </div>
    </div>
  );
}
