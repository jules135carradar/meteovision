"use client";

import { useState, useEffect } from "react";

interface Thresholds {
  gel: string;
  vent: string;
  pluie: string;
  humidite: string;
}

interface Props {
  city: string;
  lat: number;
  lon: number;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

export default function PushAlerts({ city, lat, lon }: Props) {
  const [thresholds, setThresholds] = useState<Thresholds>({ gel: "", vent: "", pluie: "", humidite: "" });
  const [subscribed, setSubscribed]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [status, setStatus]           = useState<"idle" | "success" | "error">("idle");
  const [endpoint, setEndpoint]       = useState<string | null>(null);
  const [supported, setSupported]     = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    // Vérifier si déjà abonné
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscribed(true);
          setEndpoint(sub.endpoint);
        }
      });
    });
  }, []);

  async function subscribe() {
    const hasAlert = Object.values(thresholds).some((v) => v.trim() !== "");
    if (!hasAlert) {
      setStatus("error");
      return;
    }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setLoading(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const parsed: Record<string, number> = {};
      if (thresholds.gel.trim() !== "")      parsed.gel      = parseFloat(thresholds.gel);
      if (thresholds.vent.trim() !== "")     parsed.vent     = parseFloat(thresholds.vent);
      if (thresholds.pluie.trim() !== "")    parsed.pluie    = parseFloat(thresholds.pluie);
      if (thresholds.humidite.trim() !== "") parsed.humidite = parseFloat(thresholds.humidite);

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), city, lat, lon, thresholds: parsed }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEndpoint(sub.endpoint);
        setStatus("success");
      } else {
        setStatus("error");
      }
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
      setEndpoint(null);
      setThresholds({ gel: "", vent: "", pluie: "", humidite: "" });
      setStatus("idle");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  const FIELDS = [
    { key: "gel",      icon: "🥶", label: "Gel", unit: "°C",   placeholder: "ex: 0",  desc: "Alerte si température descend sous ce seuil" },
    { key: "vent",     icon: "💨", label: "Vent", unit: "km/h", placeholder: "ex: 25", desc: "Alerte si le vent dépasse ce seuil" },
    { key: "pluie",    icon: "🌧️", label: "Pluie", unit: "mm",  placeholder: "ex: 5",  desc: "Alerte si les précipitations dépassent ce seuil" },
    { key: "humidite", icon: "🦠", label: "Humidité", unit: "%", placeholder: "ex: 80", desc: "Alerte si l'humidité dépasse ce seuil" },
  ] as const;

  return (
    <div style={{
      background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
      padding: "20px 20px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>🔔</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Alertes personnalisées</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Notification chaque matin si un seuil est dépassé dans les 48h</p>
        </div>
      </div>

      {subscribed ? (
        <div>
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 12, padding: "12px 16px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Alertes actives pour {city}</div>
              <div style={{ fontSize: 11, color: "#166534" }}>Vous recevrez une notification chaque matin si un seuil est atteint</div>
            </div>
          </div>
          <button
            onClick={unsubscribe}
            disabled={loading}
            style={{
              width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #fca5a5",
              background: "#fff1f2", color: "#991b1b", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Désactiver les alertes"}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14, marginTop: 0 }}>
            Laissez vide les seuils qui ne vous intéressent pas.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {FIELDS.map(({ key, icon, label, unit, placeholder, desc }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    value={thresholds[key]}
                    onChange={(e) => setThresholds((t) => ({ ...t, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: 64, padding: "6px 8px", borderRadius: 8, textAlign: "center",
                      border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#94a3b8", width: 32 }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {status === "error" && (
            <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>
              Définissez au moins un seuil pour activer les alertes.
            </p>
          )}

          {status === "success" && (
            <p style={{ fontSize: 12, color: "#059669", marginBottom: 10 }}>
              ✅ Alertes activées !
            </p>
          )}

          <button
            onClick={subscribe}
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(90deg, #059669, #0284c7)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Activation..." : `🔔 M'alerter sur ${city}`}
          </button>
        </div>
      )}
    </div>
  );
}
