"use client";

import { useState, useEffect } from "react";

interface Suggestion {
  key: "gel" | "vent" | "pluie" | "humidite";
  icon: string;
  label: string;
  value: number;
  unit: string;
  below?: boolean; // true = alerte si EN DESSOUS du seuil
}

const SUGGESTIONS: Record<string, Suggestion[]> = {
  viticulteur: [
    { key: "gel",      icon: "🥶", label: "Gel",            value: 2,  unit: "°C",   below: true },
    { key: "vent",     icon: "💨", label: "Vent traitement", value: 15, unit: "km/h" },
    { key: "pluie",    icon: "🌧️", label: "Pluie",          value: 3,  unit: "mm"   },
    { key: "humidite", icon: "🦠", label: "Mildiou",         value: 80, unit: "%"    },
  ],
  agriculteur: [
    { key: "gel",   icon: "🥶", label: "Gel",        value: 0,  unit: "°C",   below: true },
    { key: "vent",  icon: "💨", label: "Vent",        value: 30, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie forte", value: 10, unit: "mm"   },
  ],
  grandes_cultures: [
    { key: "gel",   icon: "🥶", label: "Gel tardif",  value: 0,  unit: "°C",   below: true },
    { key: "vent",  icon: "💨", label: "Vent récolte", value: 25, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie",        value: 5,  unit: "mm"   },
  ],
  apiculture: [
    { key: "gel",      icon: "🥶", label: "Gel",        value: 4,  unit: "°C",   below: true },
    { key: "vent",     icon: "💨", label: "Vent fort",   value: 20, unit: "km/h" },
    { key: "pluie",    icon: "🌧️", label: "Pluie",       value: 2,  unit: "mm"   },
    { key: "humidite", icon: "💧", label: "Humidité élevée", value: 85, unit: "%"   },
  ],
  forestier: [
    { key: "vent",  icon: "💨", label: "Tempête",     value: 60, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie forte", value: 15, unit: "mm"   },
    { key: "gel",   icon: "🥶", label: "Gel",          value: 0,  unit: "°C",   below: true },
  ],
  btp: [
    { key: "vent",  icon: "💨", label: "Vent grue",    value: 45, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie béton",  value: 2,  unit: "mm"   },
    { key: "gel",   icon: "🥶", label: "Gel béton",    value: 2,  unit: "°C",   below: true },
  ],
  sport_outdoor: [
    { key: "vent",  icon: "💨", label: "Vent fort",    value: 50, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie",        value: 5,  unit: "mm"   },
    { key: "gel",   icon: "🥶", label: "Gel",          value: 0,  unit: "°C",   below: true },
  ],
  transport: [
    { key: "gel",  icon: "🥶", label: "Verglas route", value: 2,  unit: "°C",   below: true },
    { key: "vent", icon: "💨", label: "Vent violent",   value: 70, unit: "km/h" },
  ],
  evenementiel: [
    { key: "pluie", icon: "🌧️", label: "Pluie événement", value: 1,  unit: "mm"   },
    { key: "vent",  icon: "💨", label: "Vent fort",        value: 40, unit: "km/h" },
  ],
  nautisme: [
    { key: "vent",  icon: "💨", label: "Vent navigation", value: 30, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie",           value: 5,  unit: "mm"   },
  ],
  pompier: [
    { key: "vent",  icon: "💨", label: "Vent fort",     value: 50, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Pluie forte",   value: 20, unit: "mm"   },
  ],
  grand_public: [
    { key: "gel",   icon: "🥶", label: "Gel",          value: 0,  unit: "°C",   below: true },
    { key: "vent",  icon: "💨", label: "Vent fort",     value: 50, unit: "km/h" },
    { key: "pluie", icon: "🌧️", label: "Grosse pluie", value: 10, unit: "mm"   },
  ],
};

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

interface Props {
  city: string;
  lat: number;
  lon: number;
  metier: string;
}

export default function PushAlerts({ city, lat, lon, metier }: Props) {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState<"idle" | "success" | "error">("idle");
  const [supported, setSupported] = useState(true);

  const suggestions = SUGGESTIONS[metier] ?? SUGGESTIONS.grand_public;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setSubscribed(true);
      });
    });
  }, []);

  function toggleSuggestion(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setStatus("idle");
  }

  async function subscribe() {
    if (selected.size === 0) { setStatus("error"); return; }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setLoading(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const thresholds: Record<string, number> = {};
      for (const s of suggestions) {
        if (selected.has(s.key)) thresholds[s.key] = s.value;
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), city, lat, lon, thresholds }),
      });

      if (res.ok) { setSubscribed(true); setStatus("success"); }
      else setStatus("error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
      setSelected(new Set());
      setStatus("idle");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (!supported) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🔔</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Alertes personnalisées</h3>
          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Notification chaque matin si un seuil est dépassé dans les 48h</p>
        </div>
      </div>

      {subscribed ? (
        <div>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
            ✅ Alertes actives pour {city}
          </div>
          <button onClick={unsubscribe} disabled={loading} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid #fca5a5", background: "#fff1f2", color: "#991b1b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "..." : "Désactiver les alertes"}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>Sélectionnez les alertes qui vous intéressent :</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {suggestions.map((s) => {
              const isOn = selected.has(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSuggestion(s.key)}
                  style={{
                    padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${isOn ? "#059669" : "#e2e8f0"}`,
                    background: isOn ? "#f0fdf4" : "#f8fafc",
                    color: isOn ? "#059669" : "#64748b",
                    fontSize: 13, fontWeight: isOn ? 700 : 400,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.15s",
                  }}
                >
                  {s.icon} {s.label} {s.below ? "<" : ">"} {s.value}{s.unit}
                  {isOn && <span style={{ marginLeft: 2 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {status === "error" && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 8px" }}>Sélectionnez au moins une alerte.</p>
          )}

          <button
            onClick={subscribe}
            disabled={loading || selected.size === 0}
            style={{
              width: "100%", padding: "11px", borderRadius: 12, border: "none",
              background: selected.size === 0 ? "#e2e8f0" : "linear-gradient(90deg, #059669, #0284c7)",
              color: selected.size === 0 ? "#94a3b8" : "#fff",
              fontSize: 14, fontWeight: 700, cursor: selected.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Activation..." : `🔔 M'alerter sur ${city}`}
          </button>
        </div>
      )}
    </div>
  );
}
