"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState<Event & { prompt: () => void } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as Event & { prompt: () => void });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt) return null;

  return (
    <button
      onClick={() => { prompt.prompt(); setPrompt(null); }}
      title="Installer l'application"
      className="text-slate-500 hover:text-emerald-500 text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4M8 12l4 4 4-4"/>
        <path d="M20 21H4"/>
      </svg>
      <span className="hidden sm:inline">Installer</span>
    </button>
  );
}
