"use client";

import { useState, useEffect, useCallback } from "react";
import type { ListeningEpisode } from "@/types/listening";

export function useListening() {
  const [episodes, setEpisodes] = useState<ListeningEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEpisodes = useCallback(async () => {
    try {
      const res = await fetch("/api/listening");
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return { episodes, loading, refetch: fetchEpisodes };
}
