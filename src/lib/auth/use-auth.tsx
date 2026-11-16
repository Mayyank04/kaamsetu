"use client";

import * as React from "react";
import { UserProfile } from "@/types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isDemo, setIsDemo] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsDemo(Boolean(data.isDemo));
        } else {
          setUser(null);
          setIsDemo(false);
        }
      } else {
        setUser(null);
        setIsDemo(false);
      }
    } catch (err) {
      console.warn("Session check error:", err);
      setUser(null);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsDemo(false);
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
        isDemo,
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
    return {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isDemo: false,
      logout: async () => {},
      refreshSession: async () => {},
    };
  }
  return ctx;
}
