"use client";

import { useState, useEffect } from "react";

export interface AlertConfig {
  id: string;
  enabled: boolean;
  threshold: number;
}

const KEY = "meteo_alerts_v1";

export function useAlerts() {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setConfigs(JSON.parse(raw));
    } catch {}
  }, []);

  function save(next: AlertConfig[]) {
    setConfigs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }

  function toggle(id: string, defaultThreshold: number) {
    setConfigs((prev) => {
      const existing = prev.find((c) => c.id === id);
      let next: AlertConfig[];
      if (existing) {
        next = prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c);
      } else {
        next = [...prev, { id, enabled: true, threshold: defaultThreshold }];
      }
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function setThreshold(id: string, threshold: number) {
    setConfigs((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, threshold } : c);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function isEnabled(id: string) {
    return configs.find((c) => c.id === id)?.enabled ?? false;
  }

  function getThreshold(id: string, defaultVal: number) {
    return configs.find((c) => c.id === id)?.threshold ?? defaultVal;
  }

  return { configs, toggle, setThreshold, isEnabled, getThreshold };
}
