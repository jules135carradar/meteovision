"use client";

const METIERS = [
  { id: "grand_public", label: "Grand public", emoji: "👥" },
  { id: "viticulteur", label: "Viticulteur", emoji: "🍇" },
  { id: "agriculteur", label: "Agriculteur", emoji: "🌾" },
  { id: "btp", label: "BTP", emoji: "🏗️" },
  { id: "transport", label: "Transport", emoji: "🚛" },
  { id: "evenementiel", label: "Événementiel", emoji: "🎪" },
  { id: "nautisme", label: "Nautisme", emoji: "⛵" },
  { id: "pompier", label: "Pompiers", emoji: "🚒" },
];

interface Props {
  value: string;
  onChange: (metier: string) => void;
}

export default function MetierSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 sm:p-5">
      <p className="text-sky-300 text-sm font-medium mb-3">
        Mode d'affichage — votre profil :
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {METIERS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] justify-center sm:justify-start ${
              value === m.id
                ? "bg-sky-600 text-white shadow-lg scale-105"
                : "bg-white/5 text-sky-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-lg">{m.emoji}</span>
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
