"use client";

import { useState, useEffect, useCallback } from "react";

export type CategoryCard = {
  key: string;
  title: string;
  image: string;
  color: string;
  avgProgress: number;
};

export function useCategories() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchCategories]);

  return { categories, loading };
}
