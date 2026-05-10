"use client";

import { useState, useEffect } from "react";

export interface FavoriteCity {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  admin1?: string;
}

const KEY = "meteo_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next: FavoriteCity[]) {
    setFavorites(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function addFavorite(city: FavoriteCity) {
    setFavorites((prev) => {
      if (prev.some((f) => f.lat === city.lat && f.lon === city.lon)) return prev;
      const next = [...prev, city];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function removeFavorite(lat: number, lon: number) {
    setFavorites((prev) => {
      const next = prev.filter((f) => !(f.lat === lat && f.lon === lon));
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function isFavorite(lat: number, lon: number) {
    return favorites.some((f) => f.lat === lat && f.lon === lon);
  }

  return { favorites, addFavorite, removeFavorite, isFavorite, persist };
}
