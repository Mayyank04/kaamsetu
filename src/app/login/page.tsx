"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  HardHat,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_PERSONAS, DemoPersona } from "@/lib/auth/personas";
import { useAuth } from "@/lib/auth/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";

  const { switchPersona, refreshSession } = useAuth();

  const allowDemo = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH !== "false";
  const [activeTab, setActiveTab] = React.useState<"personas" | "otp">(allowDemo ? "personas" : "otp");
  const [selectedRole, setSelectedRole] = React.useState<"worker" | "contractor">("worker");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError: boolean } | null>(null);

  const handlePersonaSelect = async (persona: DemoPersona) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const url = await switchPersona(persona.personaKey);
      router.push(redirectTarget || url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error selecting persona";
      setStatusMessage({ text: msg, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.replace(/\D/g, "") || phoneNumber.replace(/\D/g, "").length < 10) {
      setStatusMessage({
        text: "Please enter a valid 10-digit Indian mobile number.",
        isError: true,
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          role: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to send verification OTP.");
      }
      setOtpSent(true);
      if (data.isDemo || data.requiresDemoCode) {
        setOtpValue("123456"); // Fill demo OTP only in sandbox mode
        setStatusMessage({
          text: data.message || "OTP transmitted successfully. In sandbox mode, use code 123456 to verify.",
          isError: false,
        });
      } else {
        setOtpValue("");
        setStatusMessage({
          text: data.message || `Verification code sent via SMS to ${phoneNumber}.`,
          isError: false,
        });
      }
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : "Failed to transmit OTP.";
      // Clean, safe operational error: never leak environment variable names to ordinary users
      const safeMsg =
        rawMsg.includes("RATE_LIMIT_HMAC_SECRET") || rawMsg.includes("FATAL")
          ? "We're temporarily unable to process this request. Please try again shortly."
          : rawMsg;
      setStatusMessage({ text: safeMsg, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setStatusMessage({ text: "Please enter a 6-digit OTP code.", isError: true });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpValue,
          role: selectedRole,
          fullName: fullName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }
      await refreshSession();

      // Check role consistency: honor authoritative database role
      const actualRole = data.user?.role;
      if (actualRole && actualRole !== selectedRole) {
        setStatusMessage({
          text: `Signed in as verified ${actualRole}. Redirecting to your dashboard...`,
          isError: false,
        });
      }

      const targetDestination = redirectTarget || data.redirectUrl || (actualRole === "contractor" ? "/contractor/dashboard" : "/dashboard");
      router.push(targetDestination);
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : "Verification failed.";
      const safeMsg =
        rawMsg.includes("RATE_LIMIT_HMAC_SECRET") || rawMsg.includes("FATAL")
          ? "We're temporarily unable to process this request. Please try again shortly."
          : rawMsg;
      setStatusMessage({ text: safeMsg, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5F0] via-background to-[#F7F5F0]/60 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>SOVEREIGN AUTHENTICATION GATEWAY</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-forest">
            Sign In to KAAMSETU
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Access your sovereign workforce identity, verify credentials, manage incoming client bookings, or discover certified craftspeople.
          </p>
        </div>

        {/* Tab Switcher */}
        {allowDemo && (
          <div className="flex rounded-xl bg-forest/5 p-1 border border-forest/15 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("personas")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "personas"
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "text-charcoal-muted hover:text-forest"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sand" />
              <span>Hackathon Quick-Sign In</span>
              <Badge variant="outline" className="text-[10px] bg-sand/20 border-sand text-sand-800 hidden sm:inline-flex">
                Fast Track
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("otp")}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === "otp"
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "text-charcoal-muted hover:text-forest"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP Login</span>
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMessage.isError
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span className="flex-1 leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: Hackathon Quick-Sign In */}
        {activeTab === "personas" && (
          <div className="space-y-4">
            <div className="text-xs text-charcoal-muted px-1 flex items-center justify-between">
              <span>Select a pre-verified role for instant evaluation:</span>
              <span className="font-mono text-[10px] bg-forest/5 text-forest px-1.5 py-0.5 rounded">
                1-CLICK ACCESS
              </span>
            </div>

            <div className="grid gap-3">
              {DEMO_PERSONAS.map((persona) => {
                const isWorker = persona.role === "worker";
                return (
                  <button
                    key={persona.personaKey}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handlePersonaSelect(persona)}
                    className="w-full text-left p-4 rounded-2xl bg-card border border-forest/15 hover:border-forest/40 hover:shadow-sovereign-sm transition-all group flex items-start gap-4 relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-xl bg-forest/10 border border-forest/15 shrink-0 overflow-hidden flex items-center justify-center">
                      {persona.avatarUrl ? (
                        <Image
                          src={persona.avatarUrl}
                          alt={persona.fullName}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-forest font-bold text-sm">
                          {persona.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-forest group-hover:text-forest-600 transition-colors">
                          {persona.fullName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-forest/5 border-forest/15 text-forest font-mono"
                        >
                          {persona.badgeLabel}
                        </Badge>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 ml-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          DigiLocker Linked
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted line-clamp-1">
                        {persona.subtitle}
                      </p>
                      <div className="text-[11px] text-charcoal-muted font-mono flex items-center gap-3 pt-0.5">
                        <span>{persona.phone}</span>
                        <span>•</span>
                        <span className="text-forest font-semibold">
                          Redirects to {persona.targetDashboard}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-forest/40 group-hover:text-forest group-hover:translate-x-1 transition-all shrink-0 self-center" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Mobile OTP Login */}
        {activeTab === "otp" && (
          <div className="bg-card p-6 sm:p-8 rounded-2xl border border-forest/15 shadow-sovereign-sm space-y-6">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Role Switcher */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("worker")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        selectedRole === "worker"
                          ? "border-forest bg-forest/5 text-forest shadow-xs font-bold"
                          : "border-forest/15 text-charcoal-muted hover:border-forest/30"
                      }`}
                    >
                      <HardHat className="w-4 h-4 text-forest" />
                      <span>Skilled Worker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("contractor")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        selectedRole === "contractor"
                          ? "border-forest bg-forest/5 text-forest shadow-xs font-bold"
                          : "border-forest/15 text-charcoal-muted hover:border-forest/30"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-forest" />
                      <span>Contractor / Client</span>
                    </button>
                  </div>
                </div>

                {/* Name Optional */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rameshwar Sharma"
                    className="w-full h-11 px-3.5 rounded-xl border border-forest/20 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Indian Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-forest/20 bg-forest/5 text-xs font-mono font-bold text-forest">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full h-11 px-3.5 rounded-r-xl border border-forest/20 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-forest/20 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    We will send a 6-digit cryptographic verification code.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
                >
                  {isLoading ? "Transmitting Sovereign OTP..." : "Send Verification OTP"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1 pb-2 border-b border-forest/10">
                  <div className="text-xs text-charcoal-muted">
                    Verification code sent to:
                  </div>
                  <div className="font-mono text-sm font-bold text-forest">
                    +91 {phoneNumber}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-forest underline hover:text-forest-600 inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Change mobile number
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                    6-Digit Security OTP *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xl border border-forest/20 bg-background focus:outline-none focus:ring-2 focus:ring-forest/20"
                  />
                  {allowDemo && (
                    <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
                      <span>Sandbox Code: <strong className="font-mono text-forest">123456</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpValue("123456")}
                        className="text-forest underline font-bold"
                      >
                        Fill Demo Code
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
                >
                  {isLoading ? "Validating Ledger Proof..." : "Verify & Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Footer / Create New Identity Callout */}
        <div className="text-center p-4 rounded-xl bg-forest/5 border border-forest/10 space-y-2">
          <p className="text-xs text-charcoal-muted">
            Are you a skilled worker without an account?
          </p>
          <Button variant="outline" size="sm" asChild className="border-forest/20 text-forest text-xs font-bold">
            <Link href="/onboarding">
              Claim Your Sovereign Identity via Voice
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
