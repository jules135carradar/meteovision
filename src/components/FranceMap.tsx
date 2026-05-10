"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Popup, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "@/lib/useFavorites";
import { WMO_CODES } from "@/lib/weather-codes";

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

function tempColor(t: number): string {
  if (t <= 0)  return "#3b82f6";
  if (t <= 10) return "#06b6d4";
  if (t <= 18) return "#10b981";
  if (t <= 25) return "#f59e0b";
  if (t <= 30) return "#f97316";
  return "#ef4444";
}

interface CurrentWeather {
  temp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

interface ClickState {
  lat: number;
  lon: number;
  cityName: string | null;
  admin1: string | null;
  loading: boolean;
  weather: CurrentWeather | null;
}

function ClickHandler({ onResult }: { onResult: (s: ClickState) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onResult({ lat, lon: lng, cityName: null, admin1: null, loading: true, weather: null });

      const [geoRes, wxRes] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
          { headers: { "User-Agent": "MétéoVision/1.0" } }
        ).then((r) => r.json()),
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&wind_speed_unit=kmh&timezone=auto`
        ).then((r) => r.json()),
      ]);

      const geoData = geoRes.status === "fulfilled" ? geoRes.value : {};
      const wxData  = wxRes.status  === "fulfilled" ? wxRes.value  : null;

      const addr   = geoData.address ?? {};
      const cityName = addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? addr.municipality ?? geoData.name ?? "Ville inconnue";
      const admin1   = addr.state ?? "";

      const cur = wxData?.current;
      const weather: CurrentWeather | null = cur ? {
        temp:        Math.round(cur.temperature_2m),
        weatherCode: cur.weather_code ?? 0,
        windSpeed:   Math.round(cur.wind_speed_10m),
        humidity:    Math.round(cur.relative_humidity_2m),
      } : null;

      onResult({ lat, lon: lng, cityName, admin1, loading: false, weather });
    },
  });
  return null;
}

function MiniWeatherPopup({
  cityName, admin1, lat, lon, weather, loading, onGo,
}: {
  cityName: string | null;
  admin1: string | null;
  lat: number;
  lon: number;
  weather: CurrentWeather | null;
  loading: boolean;
  onGo: () => void;
}) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10px 0", color: "#64748b", fontSize: 13, minWidth: 160 }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>📍</div>
        Localisation...
      </div>
    );
  }

  const wmo = weather ? (WMO_CODES[weather.weatherCode] ?? { icon: "🌡️", label: "" }) : null;

  return (
    <div style={{ minWidth: 180, maxWidth: 210 }}>
      {/* Ville */}
      <div style={{ marginBottom: weather ? 10 : 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", lineHeight: 1.2 }}>
          {cityName}
        </div>
        {admin1 && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{admin1}</div>
        )}
      </div>

      {/* Météo actuelle */}
      {weather && wmo && (
        <div style={{
          background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
          border: "1px solid #bae6fd",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{wmo.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, color: tempColor(weather.temp), lineHeight: 1 }}>
              {weather.temp}°
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{wmo.label}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 11, color: "#64748b" }}>
            <div>💨 {weather.windSpeed} km/h</div>
            <div style={{ marginTop: 3 }}>💧 {weather.humidity} %</div>
          </div>
        </div>
      )}

      {/* Bouton */}
      <button
        onClick={onGo}
        style={{
          background: "linear-gradient(90deg,#059669,#0284c7)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Voir la météo complète →
      </button>
    </div>
  );
}

export default function FranceMap() {
  const router = useRouter();
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
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'
      />

      <ClickHandler onResult={setClick} />

      {/* Marqueurs favoris */}
      {favorites.map((fav) => (
        <Marker key={`${fav.lat}-${fav.lon}`} position={[fav.lat, fav.lon]} icon={STAR_ICON}>
          <Popup>
            <div style={{ textAlign: "center", minWidth: 150 }}>
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
            <MiniWeatherPopup
              cityName={click.cityName}
              admin1={click.admin1}
              lat={click.lat}
              lon={click.lon}
              weather={click.weather}
              loading={click.loading}
              onGo={() => goToWeather(click.cityName!, click.lat, click.lon, click.admin1 ?? "")}
            />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
