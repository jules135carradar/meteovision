"use client";

import dynamic from "next/dynamic";

const FranceMap = dynamic(() => import("@/components/FranceMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f0f9ff", borderRadius: 0,
    }}>
      <div style={{ textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
        <p style={{ fontSize: 14 }}>Chargement de la carte...</p>
      </div>
    </div>
  ),
});

export default function CartePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>

      {/* Header */}
      <div style={{
        padding: "14px 20px",
        background: "linear-gradient(90deg, #0369a1 0%, #059669 50%, #7c3aed 100%)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 24 }}>🗺️</span>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: 0, lineHeight: 1.2 }}>
            Carte interactive
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0, marginTop: 2 }}>
            Cliquez n'importe où pour voir la météo · ⭐ = vos favoris
          </p>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <FranceMap />
      </div>
    </div>
  );
}
