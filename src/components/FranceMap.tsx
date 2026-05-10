"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Popup, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "@/lib/useFavorites";

const makeIcon = (emoji: string, size = 30) =>
  new L.DivIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));transform:translateX(-50%) translateY(-100%)">${emoji}</div>`,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -(size + 4)],
  });

const PIN_ICON  = makeIcon("📍", 32);
const STAR_ICON = makeIcon("⭐", 26);

interface ClickState {
  lat: number;
  lon: number;
  cityName: string | null;
  admin1: string | null;
  loading: boolean;
}

function ClickHandler({ onResult }: { onResult: (s: ClickState) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onResult({ lat, lon: lng, cityName: null, admin1: null, loading: true });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
          { headers: { "User-Agent": "MétéoVision/1.0" } }
        );
        const data = await res.json();
        const addr = data.address ?? {};
        const cityName =
          addr.city ?? addr.town ?? addr.village ?? addr.hamlet ??
          addr.municipality ?? data.name ?? "Ville inconnue";
        const admin1 = addr.state ?? addr["ISO3166-2-lvl4"] ?? "";
        onResult({ lat, lon: lng, cityName, admin1, loading: false });
      } catch {
        onResult({ lat, lon: lng, cityName: "Ville inconnue", admin1: "", loading: false });
      }
    },
  });
  return null;
}

export default function FranceMap() {
  const router  = useRouter();
  const { favorites } = useFavorites();
  const [click, setClick] = useState<ClickState | null>(null);

  function goToWeather(city: string, lat: number, lon: number, admin1: string) {
    const slug = city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
    const url  = `/ville/${slug}?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}${admin1 ? `&admin1=${encodeURIComponent(admin1)}` : ""}`;
    router.push(url);
  }

  return (
    <MapContainer
      center={[46.5, 2.5]}
      zoom={6}
      minZoom={5}
      maxZoom={13}
      style={{ width: "100%", height: "100%", borderRadius: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <ClickHandler onResult={setClick} />

      {/* Favoris */}
      {favorites.map((fav) => (
        <Marker key={`${fav.lat}-${fav.lon}`} position={[fav.lat, fav.lon]} icon={STAR_ICON}>
          <Popup>
            <div style={{ textAlign: "center", minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⭐ {fav.name}</div>
              {fav.admin1 && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{fav.admin1}</div>}
              <button
                onClick={() => goToWeather(fav.name, fav.lat, fav.lon, fav.admin1 ?? "")}
                style={{
                  background: "linear-gradient(90deg,#059669,#0284c7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Voir la météo →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Clic utilisateur */}
      {click && (
        <Marker position={[click.lat, click.lon]} icon={PIN_ICON}>
          <Popup autoClose={false} closeOnClick={false}>
            <div style={{ textAlign: "center", minWidth: 150 }}>
              {click.loading ? (
                <div style={{ padding: "8px 0", color: "#64748b", fontSize: 13 }}>
                  📍 Localisation...
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    {click.cityName}
                  </div>
                  {click.admin1 && (
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                      {click.admin1}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      goToWeather(click.cityName!, click.lat, click.lon, click.admin1 ?? "")
                    }
                    style={{
                      background: "linear-gradient(90deg,#059669,#0284c7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Voir la météo →
                  </button>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
