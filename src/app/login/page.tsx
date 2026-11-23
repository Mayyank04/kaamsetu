"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { sanitizeRedirectUrl } from "@/lib/security/redirect";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";

  const { refreshSession } = useAuth();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Please enter your email or mobile number.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid credentials. Please try again.");
      }

      // Refresh client session state
      await refreshSession();

      // Navigate to destination with open-redirect sanitization
      const target = redirectTarget || result.redirectUrl || "/dashboard";
      const destination = sanitizeRedirectUrl(target, "/dashboard");
      router.push(destination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>Sovereign Identity Authentication</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-forest">
            Sign In to KAAMSETU
          </h1>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto leading-relaxed">
            Access your verified skill profile, work contracts, or organizational dashboard.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 text-[13px] leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-card rounded-md border border-forest/15 p-4 sm:p-7 shadow-sovereign-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (Email or Phone) */}
            <div className="space-y-1">
              <label htmlFor="login-id" className="text-xs font-medium text-charcoal block">
                Email Address or Mobile Number
              </label>
              <input
                id="login-id"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ramesh@example.com or 9876543210"
                className="w-full h-11 px-3 text-sm bg-surface border border-forest/20 rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-charcoal block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 px-3 pr-10 text-sm bg-surface border border-forest/20 rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-charcoal-muted hover:text-forest"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-forest hover:bg-forest-600 text-ivory text-sm font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="pt-2 text-center border-t border-forest/10">
            <p className="text-xs text-charcoal-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-forest hover:text-forest-600 underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
