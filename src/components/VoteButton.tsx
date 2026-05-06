"use client";

import { useState } from "react";
import { VoteValue } from "@/lib/types";

export default function VoteButton({ ville, metier }: { ville: string; metier: string }) {
  const [selected, setSelected]   = useState<VoteValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState<string | null>(null);

  async function handleVote(vote: VoteValue) {
    if (loading || submitted) return;
    setSelected(vote);
    setLoading(true);
    try {
      const res  = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ville, vote, metier }),
      });
      const data = await res.json();
      if (res.ok) { setSubmitted(true); setMessage(data.message ?? "Vote enregistré !"); }
      else        { setMessage(data.error ?? "Erreur"); setSelected(null); }
    } catch {
      setMessage("Erreur de connexion");
      setSelected(null);
    } finally { setLoading(false); }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
        <p className="text-green-600 font-medium text-sm">{message}</p>
        <p className="text-slate-400 text-xs mt-1">Merci — votre retour terrain améliore l'agrégation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100/70">
      <p className="text-slate-700 font-medium text-sm mb-1">La météo d'hier était-elle exacte ?</p>
      <p className="text-slate-400 text-xs mb-4">Votre vote améliore les scores de réputation des sources.</p>

      <div className="flex flex-col sm:flex-row gap-2">
        {([
          { vote: "oui"          as VoteValue, label: "Oui, exacte",    emoji: "✅", color: "hover:bg-green-50 hover:border-green-200 hover:text-green-600" },
          { vote: "partiellement"as VoteValue, label: "Partiellement",  emoji: "🤔", color: "hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600" },
          { vote: "non"          as VoteValue, label: "Non, incorrecte",emoji: "❌", color: "hover:bg-red-50 hover:border-red-200 hover:text-red-600" },
        ]).map(({ vote, label, emoji, color }) => (
          <button
            key={vote}
            onClick={() => handleVote(vote)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all min-h-[48px] ${
              selected === vote
                ? "bg-sky-50 border-sky-200 text-sky-600"
                : `bg-slate-50 border-slate-200 text-slate-500 ${color}`
            } disabled:opacity-50`}
          >
            <span>{emoji}</span>
            {label}
            {selected === vote && loading && (
              <span className="ml-1 w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>
      {message && !submitted && <p className="text-red-400 text-xs mt-3">{message}</p>}
    </div>
  );
}
