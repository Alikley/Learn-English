"use client";

import { Book } from "@prisma/client";
import { useState, useEffect } from "react";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setBooks(data);
      } catch (e) {
        console.error("Books fetch error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { books, loading };
}
