"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "flex_english_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Read from localStorage synchronously during initialization to avoid
    // calling setState inside useEffect which may cause cascading renders.
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // user is initialized from localStorage in the state initializer above

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const userData = { name: email.split("@")[0], email };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setIsLoading(false);
    router.push("/");
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setIsLoading(false);
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
