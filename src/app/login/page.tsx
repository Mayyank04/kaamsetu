"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  validateIndianMobile,
  INVALID_PHONE_MESSAGE,
} from "@/lib/utilities/phone";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Building2,
  HardHat,
  RotateCcw,
  Info,
  Clock,
  Copy,
  ShieldCheck,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { useOtpFlow } from "@/lib/auth/use-otp-flow";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";

  const { refreshSession } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<"worker" | "contractor" | "institution" | "customer">("worker");

  const otpFlow = useOtpFlow({
    intent: "login",
    role: selectedRole,
    storageKey: "kaamsetu_login_otp_session",
    onSuccess: async (user) => {
      await refreshSession();
      const actualRole = user?.role || selectedRole;
      const targetDestination =
        redirectTarget ||
        (actualRole === "contractor"
          ? "/contractor/dashboard"
          : actualRole === "institution"
          ? "/institution/dashboard"
          : "/dashboard");
      router.push(targetDestination);
    },
  });

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await otpFlow.requestOtp();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await otpFlow.verifyCode();
    if (result.success && result.user) {
      await refreshSession();
      const actualRole = result.user.role || selectedRole;
      const targetDestination =
        redirectTarget ||
        result.redirectUrl ||
        (actualRole === "contractor"
          ? "/contractor/dashboard"
          : actualRole === "institution"
          ? "/institution/dashboard"
          : "/dashboard");
      router.push(targetDestination);
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
        {(otpFlow.errorMessage || otpFlow.infoMessage) && (
          <div
            className={`p-3.5 rounded-sm border text-xs flex items-center gap-2.5 ${
              otpFlow.errorMessage
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {otpFlow.errorMessage ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <div className="flex-1 leading-relaxed">
              <span>{otpFlow.errorMessage || otpFlow.infoMessage}</span>
              {otpFlow.state === "account_not_found" && (
                <div className="mt-1.5 pt-1.5 border-t border-red-200/60">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-1 font-bold text-red-900 underline hover:text-red-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create a new account now →</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-card p-6 sm:p-7 rounded-md border border-forest/15 shadow-sovereign-sm space-y-5">
          {otpFlow.step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("worker");
                      otpFlow.setRole("worker");
                    }}
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
                    onClick={() => {
                      setSelectedRole("contractor");
                      otpFlow.setRole("contractor");
                    }}
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
                    value={otpFlow.phone}
                    onChange={(e) => otpFlow.setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-11 px-3.5 rounded-r-xs border border-forest/20 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-forest/20 font-mono"
                  />
                </div>
                {otpFlow.phone.trim().length > 0 && !validateIndianMobile(otpFlow.phone).valid ? (
                  <p className="text-[11px] text-red-600 font-medium">
                    {INVALID_PHONE_MESSAGE}
                  </p>
                ) : (
                  <p className="text-[11px] text-charcoal-muted">
                    Registered Indian mobile number for cryptographic OTP verification.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={otpFlow.isLoading || otpFlow.cooldownSeconds > 0 || !validateIndianMobile(otpFlow.phone).valid}
                className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpFlow.isLoading ? (
                  "Sending OTP..."
                ) : otpFlow.cooldownSeconds > 0 ? (
                  `Resend code in ${otpFlow.cooldownSeconds}s`
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {otpFlow.hasActiveChallenge && (
                <button
                  type="button"
                  onClick={() => otpFlow.setStep(2)}
                  className="w-full text-center text-xs text-forest underline hover:text-forest-600 font-semibold"
                >
                  Already have an active verification code? Enter code →
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-forest/10">
                <div className="text-xs text-charcoal-muted">
                  Verification challenge active for:
                </div>
                <div className="font-mono text-sm font-bold text-forest">
                  +91 {otpFlow.phone}
                </div>
                <button
                  type="button"
                  onClick={otpFlow.editPhone}
                  className="text-[11px] text-forest underline hover:text-forest-600 inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Change mobile number
                </button>
              </div>

              {/* Sandbox Code Helper */}
              {otpFlow.sandboxCode && (
                <div className="p-3.5 rounded-xs bg-sand/20 border border-sand-600/30 text-xs text-forest space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-forest">
                      Sandbox Test Code
                    </span>
                    <span className="text-[10px] bg-sand/40 text-forest font-semibold px-2 py-0.5 rounded-xs border border-sand/60">
                      No SMS Dispatched
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xs border border-forest/15 shadow-2xs">
                    <span className="font-mono text-base font-bold tracking-widest text-forest">
                      {otpFlow.sandboxCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={otpFlow.autoFillSandboxCode}
                        className="px-2 py-1 text-[11px] font-semibold bg-forest/10 hover:bg-forest/20 text-forest rounded-xs transition-colors"
                      >
                        Auto-fill
                      </button>
                      <button
                        type="button"
                        onClick={otpFlow.copySandboxCode}
                        className="px-2 py-1 text-[11px] font-semibold bg-forest hover:bg-forest-600 text-ivory rounded-xs transition-colors flex items-center gap-1"
                      >
                        {otpFlow.copiedCode ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpFlow.otp}
                  onChange={(e) => otpFlow.setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="------"
                  autoFocus
                  className="w-full h-12 text-center tracking-widest text-lg font-mono font-bold rounded-xs border border-forest/20 bg-background focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <Button
                type="submit"
                disabled={otpFlow.isLoading || otpFlow.otp.length !== 6}
                className="w-full h-11 bg-forest hover:bg-forest-500 text-ivory font-bold text-xs shadow-sovereign-sm"
              >
                {otpFlow.isLoading ? "Verifying Credentials..." : "Verify & Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Live Ticking Resend Action */}
              <div className="text-center pt-1">
                {otpFlow.cooldownSeconds > 0 ? (
                  <div className="text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-forest" />
                    <span>Resend code in</span>
                    <span className="font-mono font-bold text-forest">{otpFlow.cooldownSeconds}s</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => otpFlow.requestOtp()}
                    disabled={otpFlow.isLoading}
                    className="text-xs text-forest underline hover:text-forest-600 font-semibold"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
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
