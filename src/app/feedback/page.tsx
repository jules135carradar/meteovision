"use client";

import { useState } from "react";

const METIERS = [
  { id: "grand_public",    label: "Grand public" },
  { id: "viticulteur",     label: "Viticulteur" },
  { id: "agriculteur",     label: "Agriculteur" },
  { id: "grandes_cultures",label: "Grandes cultures" },
  { id: "apiculture",      label: "Apiculture" },
  { id: "forestier",       label: "Forestier" },
  { id: "sport_outdoor",   label: "Sport outdoor" },
  { id: "btp",             label: "BTP" },
  { id: "transport",       label: "Transport" },
  { id: "evenementiel",    label: "Événementiel" },
  { id: "nautisme",        label: "Nautisme" },
  { id: "pompier",         label: "Pompiers" },
];

export default function FeedbackPage() {
  const [name, setName]       = useState("");
  const [metier, setMetier]   = useState("grand_public");
  const [message, setMessage] = useState("");
  const [status, setStatus]   = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, metier, message }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 52 }}>💬</span>
        <h1 style={{ fontSize: "clamp(1.5rem,5vw,2rem)", fontWeight: 300, color: "#1e293b", margin: "16px 0 8px" }}>
          Votre avis compte
        </h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
          Une idée, un bug, une fonctionnalité manquante ? Écrivez-nous, chaque message est lu et pris en compte.
        </p>
      </div>

      {status === "sent" ? (
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
          border: "2px solid #86efac",
          borderRadius: 20, padding: "40px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: "#15803d", fontWeight: 700, marginBottom: 8 }}>Message envoyé !</h2>
          <p style={{ color: "#166534", fontSize: 14 }}>
            Merci pour votre retour. Nous le lirons et ferons de notre mieux pour améliorer le site.
          </p>
          <button
            onClick={() => { setMessage(""); setName(""); setStatus("idle"); }}
            style={{
              marginTop: 20, background: "#059669", color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nom */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Votre nom <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Profil */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Votre profil
            </label>
            <select
              value={metier}
              onChange={(e) => setMetier(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                background: "#fff", cursor: "pointer", boxSizing: "border-box",
              }}
            >
              {METIERS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Votre message <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Une idée d'amélioration, un bug rencontré, une donnée manquante pour votre métier..."
              rows={6}
              required
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              {message.length} caractère{message.length > 1 ? "s" : ""}
            </p>
          </div>

          {status === "error" && (
            <div style={{
              background: "#fff1f2", border: "1.5px solid #fca5a5",
              borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#991b1b",
            }}>
              ⚠️ Erreur lors de l'envoi. Veuillez réessayer.
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending" || message.trim().length < 5}
            style={{
              background: status === "sending"
                ? "#94a3b8"
                : "linear-gradient(90deg, #059669, #0284c7)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "14px 24px", fontSize: 15, fontWeight: 700,
              cursor: status === "sending" ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {status === "sending" ? "Envoi en cours..." : "Envoyer mon message →"}
          </button>

          <p style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center" }}>
            Votre message est envoyé directement à l'équipe. Aucun compte requis.
          </p>
        </form>
      )}
    </div>
  );
}
