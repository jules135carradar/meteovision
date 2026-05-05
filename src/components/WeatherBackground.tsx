"use client";

import { useMemo } from "react";

interface Props {
  weatherCode: number;
  windSpeed: number;
}

type Effect = "sunny" | "cloudy" | "rainy" | "snowy" | "windy";

function getEffects(code: number, wind: number): Effect[] {
  const effects: Effect[] = [];
  if (code === 0 || code === 1)              effects.push("sunny");
  if (code >= 2 && code <= 3)               effects.push("cloudy");
  if (code >= 45 && code <= 48)             effects.push("cloudy");
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) effects.push("rainy");
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) effects.push("snowy");
  if (wind > 30)                            effects.push("windy");
  return effects.length > 0 ? effects : ["cloudy"];
}

/* Positions déterministes — pas de Math.random() pour éviter les erreurs d'hydratation */
const RAIN_PROPS = Array.from({ length: 22 }, (_, i) => ({
  left:     `${(i * 4.7 + 1.3) % 100}%`,
  delay:    `${((i * 0.41) % 2.8).toFixed(2)}s`,
  duration: `${(0.75 + (i * 0.061) % 0.55).toFixed(2)}s`,
  height:   `${14 + (i * 3) % 9}px`,
  opacity:  `${(0.28 + (i * 0.023) % 0.28).toFixed(2)}`,
}));

const SNOW_PROPS = Array.from({ length: 18 }, (_, i) => ({
  left:     `${(i * 5.6 + 2.1) % 100}%`,
  delay:    `${((i * 0.55) % 4.5).toFixed(2)}s`,
  duration: `${(5 + (i * 0.48) % 5).toFixed(2)}s`,
  size:     `${4 + (i * 2) % 5}px`,
  opacity:  `${(0.35 + (i * 0.025) % 0.3).toFixed(2)}`,
}));

const WIND_PROPS = Array.from({ length: 10 }, (_, i) => ({
  top:      `${(i * 9.3 + 4) % 90}%`,
  delay:    `${((i * 0.7) % 4).toFixed(2)}s`,
  duration: `${(3.5 + (i * 0.42) % 3).toFixed(2)}s`,
  width:    `${60 + (i * 17) % 100}px`,
  opacity:  `${(0.15 + (i * 0.018) % 0.18).toFixed(2)}`,
}));

const CLOUD_PROPS = Array.from({ length: 5 }, (_, i) => ({
  top:      `${8 + i * 16}%`,
  delay:    `${i * 4}s`,
  duration: `${28 + i * 8}s`,
  width:    `${160 + i * 60}px`,
  height:   `${60 + i * 20}px`,
}));

export default function WeatherBackground({ weatherCode, windSpeed }: Props) {
  const effects = useMemo(() => getEffects(weatherCode, windSpeed), [weatherCode, windSpeed]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>

      {/* ── Soleil ── */}
      {effects.includes("sunny") && (
        <>
          <div
            className="anim-sun absolute rounded-full"
            style={{
              width: 420, height: 420,
              top: -120, right: -80,
              background: "radial-gradient(circle, rgba(253,224,71,0.22) 0%, rgba(251,191,36,0.08) 55%, transparent 75%)",
              animationDuration: "6s",
            }}
          />
          <div
            className="anim-sun absolute rounded-full"
            style={{
              width: 220, height: 220,
              top: -40, right: 60,
              background: "radial-gradient(circle, rgba(253,224,71,0.18) 0%, transparent 70%)",
              animationDuration: "4s",
              animationDelay: "1s",
            }}
          />
        </>
      )}

      {/* ── Nuages ── */}
      {effects.includes("cloudy") && CLOUD_PROPS.map((p, i) => (
        <div
          key={i}
          className="anim-cloud absolute rounded-full"
          style={{
            top: p.top,
            width: p.width,
            height: p.height,
            background: "rgba(203,213,225,0.18)",
            filter: "blur(28px)",
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* ── Pluie ── */}
      {effects.includes("rainy") && RAIN_PROPS.map((p, i) => (
        <div
          key={i}
          className="anim-rain absolute"
          style={{
            left: p.left,
            top: 0,
            width: "1.5px",
            height: p.height,
            background: "rgba(96,165,250,0.55)",
            borderRadius: 2,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* ── Neige ── */}
      {effects.includes("snowy") && SNOW_PROPS.map((p, i) => (
        <div
          key={i}
          className="anim-snow absolute rounded-full"
          style={{
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            background: "rgba(186,230,253,0.8)",
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* ── Vent ── */}
      {effects.includes("windy") && WIND_PROPS.map((p, i) => (
        <div
          key={i}
          className="anim-wind absolute"
          style={{
            top: p.top,
            left: 0,
            width: p.width,
            height: "1.5px",
            background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.4), transparent)",
            borderRadius: 999,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
