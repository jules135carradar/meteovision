"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export default function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen]   = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const router      = useRouter();

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setIsOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch { setResults([]); }
      finally  { setLoading(false); }
    }, 300);
  }, [query]);

  function handleSelect(r: GeoResult) {
    setIsOpen(false);
    setQuery(r.name);
    const slug = r.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
    router.push(`/ville/${slug}?lat=${r.latitude}&lon=${r.longitude}&city=${encodeURIComponent(r.name)}&admin1=${encodeURIComponent(r.admin1 ?? "")}`);
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher une ville française..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 shadow-sm transition-all text-base"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 animate-spin">⟳</span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 min-h-[48px]"
              >
                <span className="text-sky-400">📍</span>
                <div>
                  <span className="text-slate-700 font-medium text-sm">{r.name}</span>
                  {r.admin1 && <span className="text-slate-400 text-xs ml-2">{r.admin1}</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
