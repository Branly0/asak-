"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const stored = localStorage.getItem("asak_user");

    if (token && stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUserState(parsedUser);
        setAccessTokenState(token);
      } catch (error) {
        // Clear corrupted data if JSON parsing fails to avoid infinite loops
        localStorage.removeItem("asak_user");
        Cookies.remove("access_token");
      }
    }
    
    // This updates in the same batch, ensuring state matches on the next render pass
    setLoading(false);
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("asak_user", JSON.stringify(u));
    else localStorage.removeItem("asak_user");
  };

  const setAccessToken = (t: string | null) => {
    setAccessTokenState(t);
    if (t) Cookies.set("access_token", t, { expires: 1 });
    else Cookies.remove("access_token");
  };

  const signOut = () => {
    setUser(null);
    setAccessToken(null);
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("asak_user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}