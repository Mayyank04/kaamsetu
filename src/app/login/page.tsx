"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Building2,
  HardHat,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";

  const { refreshSession } = useAuth();

  const [selectedRole, setSelectedRole] = React.useState<"worker" | "contractor" | "institution" | "customer">("worker");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [sandboxCode, setSandboxCode] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError: boolean } | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
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
          intent: "login",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to send verification OTP.");
      }

      setOtpSent(true);
      if (data.isSandbox && data.sandboxCode) {
        setSandboxCode(data.sandboxCode);
        setStatusMessage({
          text: data.message || "Sandbox verification is enabled. No SMS will be sent.",
          isError: false,
        });
      } else {
        setSandboxCode(null);
        setStatusMessage({
          text: data.message || `Verification code dispatched to +91 ${cleanDigits.slice(-10)}.`,
          isError: false,
        });
      }
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : "Failed to transmit OTP.";
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
          intent: "login",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }
      await refreshSession();

      const actualRole = data.user?.role;
      const targetDestination =
        redirectTarget ||
        data.redirectUrl ||
        (actualRole === "contractor"
          ? "/contractor/dashboard"
          : actualRole === "institution"
          ? "/institution/dashboard"
          : "/dashboard");

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

        {/* Sandbox Transparent Testing Notice */}
        <div className="p-3.5 rounded-sm bg-sand/15 border border-sand/40 text-charcoal text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-forest">
            <Info className="w-4 h-4 text-forest shrink-0" />
            <span>Sandbox Verification Environment</span>
          </div>
          <p className="text-[11px] text-charcoal-muted leading-relaxed">
            No real SMS is transmitted. Verification codes are simulated transparently for account creation and testing.
          </p>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-sm border text-xs flex items-center gap-2.5 ${
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

        {/* Form Container */}
        <div className="bg-card p-6 sm:p-7 rounded-md border border-forest/15 shadow-sovereign-sm space-y-5">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("worker")}
                    className={`p-2.5 rounded-xs border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedRole === "worker"
                        ? "border-forest bg-forest/5 text-forest font-bold shadow-xs"
                        : "border-forest/15 text-charcoal-muted hover:border-forest/30"
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-forest shrink-0" />
                    <span>Artisan / Worker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("contractor")}
                    className={`p-2.5 rounded-xs border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedRole === "contractor"
                        ? "border-forest bg-forest/5 text-forest font-bold shadow-xs"
                        : "border-forest/15 text-charcoal-muted hover:border-forest/30"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-forest shrink-0" />
                    <span>Contractor / Client</span>
                  </button>
                </div>
              </div>

              {/* Mobile Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Mobile Number *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xs border border-r-0 border-forest/20 bg-forest/5 text-xs font-mono font-bold text-forest">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-11 px-3.5 rounded-r-xs border border-forest/20 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-forest/20 font-mono"
                  />
                </div>
                <p className="text-[11px] text-charcoal-muted">
                  Registered Indian mobile number for cryptographic OTP verification.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
              >
                {isLoading ? "Generating Sandbox Code..." : "Send Verification Code"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-forest/10">
                <div className="text-xs text-charcoal-muted">
                  Verification challenge active for:
                </div>
                <div className="font-mono text-sm font-bold text-forest">
                  +91 {phoneNumber}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpValue("");
                    setSandboxCode(null);
                  }}
                  className="text-[11px] text-forest underline hover:text-forest-600 inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Change mobile number
                </button>
              </div>

              {/* Sandbox Code Helper */}
              {sandboxCode && (
                <div className="p-3 rounded-xs bg-forest/5 border border-forest/20 space-y-1.5 text-center">
                  <div className="text-[11px] text-charcoal-muted">
                    Sandbox Verification Code for This Session:
                  </div>
                  <div className="font-mono text-xl font-bold tracking-widest text-forest">
                    {sandboxCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpValue(sandboxCode)}
                    className="text-[11px] text-forest font-bold underline hover:text-forest-600"
                  >
                    Insert Code Into Input
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="------"
                  className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xs border border-forest/20 bg-background focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
              >
                {isLoading ? "Verifying Credentials..." : "Verify & Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {/* Registration Link */}
          <div className="pt-3 border-t border-forest/10 text-center space-y-1">
            <p className="text-xs text-charcoal-muted">
              Don&apos;t have an account yet?
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
            >
              <span>Create an account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Footer Legal Disclosures */}
        <div className="text-center text-[11px] text-charcoal-muted space-x-1.5">
          <span>By continuing, you agree to our</span>
          <Link href="/terms" className="underline hover:text-forest">Terms of Service</Link>
          <span>and</span>
          <Link href="/privacy" className="underline hover:text-forest">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
