"use client";

import { useState, useEffect } from "react";

interface AlertDef {
  key: "gel" | "vent" | "pluie" | "humidite";
  icon: string;
  label: string;
  defaultValue: number;
  unit: string;
  below: boolean;
  description: string;
}

const ALERTS_BY_METIER: Record<string, AlertDef[]> = {
  viticulteur: [
    { key: "gel",      icon: "🥶", label: "Gel",     defaultValue: 2,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent",     icon: "💨", label: "Vent",     defaultValue: 15, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie",    icon: "🌧️", label: "Pluie",    defaultValue: 3,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "humidite", icon: "🦠", label: "Mildiou",  defaultValue: 80, unit: "%",    below: false, description: "Alerte si humidité dépasse" },
  ],
  agriculteur: [
    { key: "gel",   icon: "🥶", label: "Gel",   defaultValue: 0,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent",  icon: "💨", label: "Vent",  defaultValue: 30, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie", defaultValue: 10, unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
  ],
  grandes_cultures: [
    { key: "gel",   icon: "🥶", label: "Gel",   defaultValue: 0,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent",  icon: "💨", label: "Vent",  defaultValue: 25, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie", defaultValue: 5,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
  ],
  apiculture: [
    { key: "gel",      icon: "🥶", label: "Gel",      defaultValue: 4,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent",     icon: "💨", label: "Vent",      defaultValue: 20, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie",    icon: "🌧️", label: "Pluie",     defaultValue: 2,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "humidite", icon: "💧", label: "Humidité",  defaultValue: 85, unit: "%",    below: false, description: "Alerte si humidité dépasse" },
  ],
  forestier: [
    { key: "vent",  icon: "💨", label: "Tempête",      defaultValue: 60, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie forte",  defaultValue: 15, unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "gel",   icon: "🥶", label: "Gel",          defaultValue: 0,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
  ],
  btp: [
    { key: "vent",  icon: "💨", label: "Vent grue",   defaultValue: 45, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie béton", defaultValue: 2,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "gel",   icon: "🥶", label: "Gel béton",   defaultValue: 2,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
  ],
  sport_outdoor: [
    { key: "vent",  icon: "💨", label: "Vent fort", defaultValue: 50, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie",     defaultValue: 5,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "gel",   icon: "🥶", label: "Gel",       defaultValue: 0,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
  ],
  transport: [
    { key: "gel",  icon: "🥶", label: "Verglas",     defaultValue: 2,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent", icon: "💨", label: "Vent violent", defaultValue: 70, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
  ],
  evenementiel: [
    { key: "pluie", icon: "🌧️", label: "Pluie", defaultValue: 1,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
    { key: "vent",  icon: "💨", label: "Vent",  defaultValue: 40, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
  ],
  nautisme: [
    { key: "vent",  icon: "💨", label: "Vent",  defaultValue: 30, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie", defaultValue: 5,  unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
  ],
  pompier: [
    { key: "vent",  icon: "💨", label: "Vent fort",   defaultValue: 50, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Pluie forte", defaultValue: 20, unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
  ],
  grand_public: [
    { key: "gel",   icon: "🥶", label: "Gel",         defaultValue: 0,  unit: "°C",   below: true,  description: "Alerte si T° descend sous" },
    { key: "vent",  icon: "💨", label: "Vent fort",    defaultValue: 50, unit: "km/h", below: false, description: "Alerte si vent dépasse" },
    { key: "pluie", icon: "🌧️", label: "Grosse pluie", defaultValue: 10, unit: "mm",   below: false, description: "Alerte si pluie dépasse" },
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
  const alerts = ALERTS_BY_METIER[metier] ?? ALERTS_BY_METIER.grand_public;

  const [active, setActive]       = useState<Record<string, boolean>>({});
  const [values, setValues]       = useState<Record<string, string>>(() =>
    Object.fromEntries(alerts.map((a) => [a.key, String(a.defaultValue)]))
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState<"idle" | "success" | "error">("idle");
  const [supported, setSupported]   = useState(true);

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

  // Réinitialiser les valeurs quand le métier change
  useEffect(() => {
    setValues(Object.fromEntries(alerts.map((a) => [a.key, String(a.defaultValue)])));
    setActive({});
  }, [metier]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(key: string) {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatus("idle");
  }

  async function subscribe() {
    const hasActive = Object.values(active).some(Boolean);
    if (!hasActive) { setStatus("error"); return; }
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
      for (const a of alerts) {
        if (active[a.key]) thresholds[a.key] = parseFloat(values[a.key]) || a.defaultValue;
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
      setActive({});
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
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>
            Activez et personnalisez vos seuils :
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {alerts.map((a) => {
              const isOn = !!active[a.key];
              return (
                <div key={a.key} style={{
                  borderRadius: 12,
                  border: `1.5px solid ${isOn ? "#059669" : "#e2e8f0"}`,
                  background: isOn ? "#f0fdf4" : "#f8fafc",
                  overflow: "hidden",
                  transition: "all 0.15s",
                }}>
                  {/* Ligne principale — clic pour activer */}
                  <button
                    onClick={() => toggle(a.key)}
                    style={{
                      width: "100%", padding: "10px 14px",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isOn ? "#059669" : "#475569" }}>
                      {a.label}
                    </span>
                    <div style={{
                      width: 36, height: 20, borderRadius: 10,
                      background: isOn ? "#059669" : "#cbd5e1",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}>
                      <div style={{
                        position: "absolute", top: 2,
                        left: isOn ? 18 : 2,
                        width: 16, height: 16, borderRadius: "50%",
                        background: "#fff", transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </div>
                  </button>

                  {/* Champ de valeur — visible uniquement si actif */}
                  {isOn && (
                    <div style={{ padding: "0 14px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{a.description}</span>
                      <input
                        type="number"
                        value={values[a.key]}
                        onChange={(e) => setValues((v) => ({ ...v, [a.key]: e.target.value }))}
                        style={{
                          width: 64, padding: "5px 8px", borderRadius: 8,
                          border: "1.5px solid #86efac", fontSize: 16,
                          textAlign: "center", outline: "none", background: "#fff",
                          fontWeight: 700, color: "#059669",
                        }}
                      />
                      <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>{a.unit}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {status === "error" && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "0 0 8px" }}>Activez au moins une alerte.</p>
          )}

          <button
            onClick={subscribe}
            disabled={loading || !Object.values(active).some(Boolean)}
            style={{
              width: "100%", padding: "11px", borderRadius: 12, border: "none",
              background: Object.values(active).some(Boolean)
                ? "linear-gradient(90deg, #059669, #0284c7)"
                : "#e2e8f0",
              color: Object.values(active).some(Boolean) ? "#fff" : "#94a3b8",
              fontSize: 14, fontWeight: 700,
              cursor: Object.values(active).some(Boolean) ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Activation..." : `🔔 M'alerter sur ${city}`}
          </button>
        </div>
      )}
    </div>
  );
}
