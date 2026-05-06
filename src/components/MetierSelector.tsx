"use client";

const METIERS = [
  { id: "grand_public",  label: "Grand public",  emoji: "👥" },
  { id: "viticulteur",   label: "Viticulteur",   emoji: "🍇" },
  { id: "agriculteur",   label: "Agriculteur",   emoji: "🌾" },
  { id: "btp",           label: "BTP",           emoji: "🏗️" },
  { id: "transport",     label: "Transport",     emoji: "🚛" },
  { id: "evenementiel",  label: "Événementiel",  emoji: "🎪" },
  { id: "nautisme",      label: "Nautisme",      emoji: "⛵" },
  { id: "pompier",       label: "Pompiers",      emoji: "🚒" },
];

interface Props { value: string; onChange: (m: string) => void; }

export default function MetierSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">Votre profil</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {METIERS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] justify-center sm:justify-start ${
              value === m.id
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <span>{m.emoji}</span>
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
