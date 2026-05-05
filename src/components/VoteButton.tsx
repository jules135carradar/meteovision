"use client";

import { useState } from "react";
import { VoteValue } from "@/lib/types";

interface Props {
  ville: string;
  metier: string;
}

export default function VoteButton({ ville, metier }: Props) {
  const [selected, setSelected] = useState<VoteValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleVote(vote: VoteValue) {
    if (loading || submitted) return;
    setSelected(vote);
    setLoading(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ville, vote, metier }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setMessage(data.message ?? "Vote enregistré !");
      } else {
        setMessage(data.error ?? "Erreur lors du vote");
        setSelected(null);
      }
    } catch {
      setMessage("Erreur de connexion");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-5 text-center">
        <span className="text-3xl">🙏</span>
        <p className="text-green-300 font-semibold mt-2">{message}</p>
        <p className="text-sky-300 text-sm mt-1">
          Votre vote améliore la précision de l'agrégation pour tous.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
      <h2 className="text-xl font-bold text-white mb-1">La météo d'hier était-elle exacte ?</h2>
      <p className="text-sky-300 text-sm mb-5">
        Votre retour terrain améliore les scores de réputation des sources.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <VoteBtn
          vote="oui"
          label="Oui, exacte"
          emoji="✅"
          selected={selected}
          loading={loading}
          onClick={handleVote}
        />
        <VoteBtn
          vote="partiellement"
          label="Partiellement"
          emoji="🤔"
          selected={selected}
          loading={loading}
          onClick={handleVote}
        />
        <VoteBtn
          vote="non"
          label="Non, incorrecte"
          emoji="❌"
          selected={selected}
          loading={loading}
          onClick={handleVote}
        />
      </div>

      {message && !submitted && (
        <p className="text-red-400 text-sm mt-3">{message}</p>
      )}
    </div>
  );
}

function VoteBtn({
  vote,
  label,
  emoji,
  selected,
  loading,
  onClick,
}: {
  vote: VoteValue;
  label: string;
  emoji: string;
  selected: VoteValue | null;
  loading: boolean;
  onClick: (v: VoteValue) => void;
}) {
  const isSelected = selected === vote;
  const colors: Record<VoteValue, string> = {
    oui: "border-green-500/50 bg-green-900/30 hover:bg-green-800/40 text-green-300",
    partiellement: "border-yellow-500/50 bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300",
    non: "border-red-500/50 bg-red-900/30 hover:bg-red-800/40 text-red-300",
  };

  return (
    <button
      onClick={() => onClick(vote)}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-semibold transition-all ${colors[vote]} ${
        isSelected ? "ring-2 ring-white/30 scale-105" : ""
      } disabled:opacity-50`}
    >
      <span className="text-xl">{emoji}</span>
      {label}
      {isSelected && loading && (
        <span className="ml-1 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}
