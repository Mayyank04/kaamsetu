"use client";

import * as React from "react";
import { UserProfile } from "@/types/auth";
import { DEMO_PERSONAS, DemoPersona } from "@/lib/auth/personas";

interface AuthContextValue {
  user: UserProfile | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchPersona: (personaKey: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(DEMO_PERSONAS[0]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.warn("Session check error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const switchPersona = async (personaKey: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaKey }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return data.redirectUrl || "/dashboard";
      }
      throw new Error(data.message || "Failed to switch persona");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        switchPersona,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    // Graceful fallback for components outside provider
    return {
      user: DEMO_PERSONAS[0],
      role: DEMO_PERSONAS[0].role,
      isAuthenticated: true,
      isLoading: false,
      switchPersona: async () => "/dashboard",
      logout: async () => {},
      refreshSession: async () => {},
    };
  }
  return ctx;
}
