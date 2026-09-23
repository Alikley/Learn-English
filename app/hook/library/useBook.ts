"use client";

import { Book } from "@prisma/client";
import { useState, useEffect } from "react";

export function useBook(bookId: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    const id = Number(bookId);
    if (isNaN(id)) {
      setTimeout(() => {
        setNotFound(true);
        setLoading(false);
      });
      return;
    }

    fetch("/api/books")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((books: Book[]) => {
        const found = books.find((b) => b.id === id);
        found ? setBook(found) : setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  return { book, loading, notFound };
}
