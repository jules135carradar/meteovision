"use client";

import { useState, useRef, useEffect } from "react";
import { AggregatedWeather } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS: Record<string, string[]> = {
  viticulteur:      ["Puis-je traiter ma vigne cette semaine ?", "Risque de gel dans les prochains jours ?", "Quand les conditions seront favorables pour la vendange ?"],
  agriculteur:      ["Quand puis-je irriguer ?", "Risque de gel sur mes cultures ?", "Conditions pour les semis cette semaine ?"],
  grandes_cultures: ["Quel jour pour la récolte ?", "Risque de gel tardif ?", "Conditions pour les traitements ?"],
  apiculture:       ["Les abeilles peuvent-elles voler demain ?", "Quel est le meilleur jour pour inspecter les ruches ?"],
  forestier:        ["Risque de tempête cette semaine ?", "Conditions pour l'exploitation forestière ?"],
  btp:              ["Peut-on couler du béton demain ?", "Le vent est-il trop fort pour la grue ?", "Conditions de chantier cette semaine ?"],
  transport:        ["Risque de verglas sur les routes ?", "Conditions de visibilité demain ?"],
  evenementiel:     ["Quel est le meilleur jour pour un événement extérieur ?", "Risque de pluie ce week-end ?"],
  nautisme:         ["Conditions de navigation demain ?", "Le vent est-il favorable pour sortir en mer ?"],
  pompier:          ["Risque d'incendie cette semaine ?", "Conditions météo pour les interventions ?"],
  sport_outdoor:    ["Quel jour pour une sortie en montagne ?", "Conditions pour une randonnée demain ?"],
  grand_public:     ["Que mettre comme vêtements demain ?", "Quel jour faire un barbecue ?", "Risque d'orage ce week-end ?"],
};

interface Props {
  weather: AggregatedWeather;
  metier: string;
}

export default function WeatherChat({ weather, metier }: Props) {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg: Message = { role: "user", content: question };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const weatherContext = {
      city:          weather.location.name,
      temperature:   weather.temperature.toFixed(1),
      feelsLike:     weather.feelsLike.toFixed(1),
      humidity:      weather.humidity.toFixed(0),
      windSpeed:     weather.windSpeed.toFixed(0),
      precipitation: weather.precipitation.toFixed(1),
      pressure:      weather.pressure.toFixed(0),
      uvIndex:       weather.uvIndex.toFixed(1),
      description:   weather.description,
      soilTemperature: weather.soilTemperature,
      soilMoisture:    weather.soilMoisture,
      winklerIndex:    weather.winklerIndex,
      viticulture:     weather.viticulture,
      daily:  weather.daily,
      hourly: weather.hourly,
    };

    const history = newMessages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, weatherContext, metier, history }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "Désolé, je n'ai pas pu répondre." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = SUGGESTIONS[metier] ?? SUGGESTIONS.grand_public;

  return (
    <>
      {/* Panel chat */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 88, right: 20, zIndex: 100,
          width: 340, height: 500,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #059669, #0284c7)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Assistant météo</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Posez n'importe quelle question</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 20, padding: 4, lineHeight: 1 }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0" }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "8px 0 12px" }}>
                  Bonjour ! Je connais la météo de <strong style={{ color: "#475569" }}>{weather.location.name}</strong> en détail. Posez-moi une question.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 10, padding: "8px 12px",
                        fontSize: 12, color: "#475569", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #059669, #0284c7)" : "#f1f5f9",
                  color: msg.role === "user" ? "#fff" : "#334155",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                  background: "#f1f5f9", display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#94a3b8",
                      animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Votre question..."
              disabled={loading}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", fontSize: 16,
                outline: "none", background: loading ? "#f8fafc" : "#fff",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 12, border: "none",
                background: loading || !input.trim() ? "#e2e8f0" : "linear-gradient(135deg, #059669, #0284c7)",
                color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 24, right: 20, zIndex: 100,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: isOpen ? "#475569" : "linear-gradient(135deg, #059669, #0284c7)",
          color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(5,150,105,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          fontSize: 22,
        }}
        title="Assistant météo IA"
      >
        {isOpen ? "×" : "🤖"}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
