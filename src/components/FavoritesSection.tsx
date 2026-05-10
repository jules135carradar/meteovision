"use client";

import { useFavorites } from "@/lib/useFavorites";

export default function FavoritesSection() {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <div style={{ width: "100%", maxWidth: 512, margin: "0 auto 8px" }}>
      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, textAlign: "center" }}>
        ⭐ Mes villes favorites
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {favorites.map((fav) => {
          const href = `/ville/${fav.slug}?lat=${fav.lat}&lon=${fav.lon}&city=${encodeURIComponent(fav.name)}${fav.admin1 ? `&admin1=${encodeURIComponent(fav.admin1)}` : ""}`;
          return (
            <div key={`${fav.lat}-${fav.lon}`} style={{
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(135deg, #fefce8, #fef9c3)",
              border: "1.5px solid #fde68a",
              borderRadius: 999,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <a
                href={href}
                style={{
                  padding: "8px 14px 8px 14px",
                  fontSize: 14,
                  color: "#92400e",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                ⭐ {fav.name}
                {fav.admin1 && (
                  <span style={{ fontWeight: 400, color: "#a16207", fontSize: 12, marginLeft: 4 }}>
                    {fav.admin1}
                  </span>
                )}
              </a>
              <button
                onClick={() => removeFavorite(fav.lat, fav.lon)}
                title="Retirer des favoris"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 10px 8px 2px",
                  color: "#d97706",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
