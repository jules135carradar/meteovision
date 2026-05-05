"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  population?: number;
}

export default function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  function handleSelect(result: GeoResult) {
    setIsOpen(false);
    setQuery(result.name);
    const slug = result.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-");
    router.push(
      `/ville/${slug}?lat=${result.latitude}&lon=${result.longitude}&city=${encodeURIComponent(result.name)}&admin1=${encodeURIComponent(result.admin1 ?? "")}`
    );
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 text-xl pointer-events-none">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher une ville française..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/15 transition-all text-lg"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-sky-300">
            ⟳
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-md border border-sky-800/50 rounded-xl shadow-2xl overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(r)}
                className="w-full text-left px-5 py-3 hover:bg-sky-900/60 transition-colors flex items-center gap-3"
              >
                <span className="text-sky-400 text-lg">📍</span>
                <div>
                  <span className="text-white font-medium">{r.name}</span>
                  {r.admin1 && (
                    <span className="text-sky-300 text-sm ml-2">{r.admin1}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
