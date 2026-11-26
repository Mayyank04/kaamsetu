"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  HardHat,
  Building2,
  Users,
  GraduationCap,
  Store,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";
import { sanitizeRedirectUrl } from "@/lib/security/redirect";
import { normalizePhoneNumber } from "@/lib/utilities/phone";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+1", label: "US/Canada (+1)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [step, setStep] = React.useState<"details" | "verify">("details");
  const [role, setRole] = React.useState<"worker" | "contractor" | "customer" | "institution" | "vendor">("worker");
  const [fullName, setFullName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+91");
  const [phone, setPhone] = React.useState("");
  const [normalizedPhone, setNormalizedPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const [otp, setOtp] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [deliveryNotice, setDeliveryNotice] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendVerificationOtp = async (targetE164: string) => {
    const otpRes = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: targetE164,
        role,
        fullName: fullName.trim(),
        intent: "registration",
        termsAccepted: true,
        privacyAccepted: true,
      }),
    });

    const otpJson = await otpRes.json();
    if (!otpRes.ok || !otpJson.success) {
      if (otpJson.retryAfterSeconds && otpJson.retryAfterSeconds > 0) {
        setResendCooldown(otpJson.retryAfterSeconds);
      }
      throw new Error(otpJson.message || "Unable to send verification code. Please try again.");
    }

    setDeliveryNotice(otpJson.message || `Verification code sent to ${targetE164}.`);
    setResendCooldown(otpJson.retryAfterSeconds || 45);
  };

  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    const rawPhoneInput = phone.trim().startsWith("+") ? phone.trim() : `${countryCode}${phone.trim()}`;
    const phoneCheck = normalizePhoneNumber(rawPhoneInput, countryCode);
    if (!phone.trim() || !phoneCheck.valid) {
      errors.phone = phoneCheck.error || "Enter a valid mobile number.";
    }

    const cleanOptionalEmail = email.trim();
    if (cleanOptionalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanOptionalEmail)) {
      errors.email = "Please enter a valid email address, or leave this blank.";
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!termsAccepted) {
      errors.termsAccepted = "Please accept the Terms of Service and Privacy Policy to continue.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(errors.termsAccepted || "Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      setNormalizedPhone(phoneCheck.e164);
      await sendVerificationOtp(phoneCheck.e164);
      setOtp("");
      setStep("verify");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("Please enter the 6-digit verification code sent to your mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP with server and obtain single-use HMAC verification proof
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          otp: cleanOtp,
          role,
          fullName: fullName.trim(),
          intent: "registration",
          deferAccountCreation: true,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.success || !verifyJson.verificationProof) {
        throw new Error(verifyJson.message || "Invalid or expired verification code.");
      }

      // 2. Complete atomic account creation with verified proof & optional email
      const cleanOptionalEmail = email.trim().toLowerCase();
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: normalizedPhone,
          verificationProof: verifyJson.verificationProof,
          email: cleanOptionalEmail || undefined,
          password,
          confirmPassword,
          role,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      const regJson = await regRes.json();
      if (!regRes.ok || !regJson.success) {
        throw new Error(regJson.message || "Failed to create account. Please try again.");
      }

      await refreshSession();

      const fallbackUrl =
        role === "worker"
          ? "/onboarding"
          : role === "vendor"
          ? "/vendor/dashboard"
          : role === "contractor"
          ? "/contractor/dashboard"
          : role === "customer"
          ? "/customer/bookings"
          : "/institution/dashboard";
      const targetUrl = sanitizeRedirectUrl(regJson.redirectUrl, fallbackUrl);
      router.push(targetUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Verification or registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await sendVerificationOtp(normalizedPhone);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-forest/5 border border-forest/15 text-forest text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>Digital Workforce Identity</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-forest">
            {step === "details" ? "Create Your Account" : "Verify Your Mobile Number"}
          </h1>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto leading-relaxed">
            {step === "details"
              ? "Every skill deserves to be seen, even without a degree. Join the national digital craft registry."
              : `Enter the 6-digit verification code sent to ${normalizedPhone}.`}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 text-[13px] leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-card rounded-md border border-forest/15 p-4 sm:p-7 shadow-sovereign-sm space-y-5">
          {step === "details" ? (
            <>
              {/* Role Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-forest block">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("worker")}
                    className={`p-2.5 rounded-xs border text-left flex items-center gap-2 transition-colors ${
                      role === "worker"
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-surface border-forest/15 text-charcoal hover:border-forest/40"
                    }`}
                  >
                    <HardHat className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Artisan / Worker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("vendor")}
                    className={`p-2.5 rounded-xs border text-left flex items-center gap-2 transition-colors ${
                      role === "vendor"
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-surface border-forest/15 text-charcoal hover:border-forest/40"
                    }`}
                  >
                    <Store className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Local Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("contractor")}
                    className={`p-2.5 rounded-xs border text-left flex items-center gap-2 transition-colors ${
                      role === "contractor"
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-surface border-forest/15 text-charcoal hover:border-forest/40"
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Contractor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`p-2.5 rounded-xs border text-left flex items-center gap-2 transition-colors ${
                      role === "customer"
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-surface border-forest/15 text-charcoal hover:border-forest/40"
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("institution")}
                    className={`p-2.5 rounded-xs border text-left flex items-center gap-2 transition-colors ${
                      role === "institution"
                        ? "bg-forest text-ivory border-forest font-semibold"
                        : "bg-surface border-forest/15 text-charcoal hover:border-forest/40"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="text-xs">Institution</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="text-xs font-medium text-charcoal block">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className={`w-full h-11 px-3 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                      fieldErrors.fullName ? "border-red-400" : "border-forest/20"
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Mandatory Mobile Number with Country Code Selector */}
                <div className="space-y-1">
                  <label htmlFor="reg-phone" className="text-xs font-medium text-charcoal block">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      aria-label="Country calling code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-11 px-2 text-xs font-mono bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={countryCode === "+91" ? "9876543210" : "Mobile number"}
                      maxLength={16}
                      className={`w-full h-11 px-3 text-sm font-mono bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                        fieldErrors.phone ? "border-red-400" : "border-forest/20"
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.phone}</p>
                  )}
                  <p className="text-[10px] text-charcoal-muted">
                    One account per verified mobile number. We will send an OTP to verify.
                  </p>
                </div>

                {/* Email Address (Optional) */}
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-medium text-charcoal block">
                    Email address (optional)
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@gmail.com"
                    className={`w-full h-11 px-3 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                      fieldErrors.email ? "border-red-400" : "border-forest/20"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.email}</p>
                  )}
                  <p className="text-[10px] text-charcoal-muted">
                    Add your email for account recovery and important updates. You can skip this.
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="text-xs font-medium text-charcoal block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={`w-full h-11 px-3 pr-10 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                        fieldErrors.password ? "border-red-400" : "border-forest/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-charcoal-muted hover:text-forest"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label htmlFor="reg-confirm" className="text-xs font-medium text-charcoal block">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full h-11 px-3 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                      fieldErrors.confirmPassword ? "border-red-400" : "border-forest/20"
                    }`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Consent Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded-xs border-forest/30 text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="text-xs text-charcoal-muted leading-relaxed">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-medium text-forest hover:text-forest-600 underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="font-medium text-forest hover:text-forest-600 underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {fieldErrors.termsAccepted && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.termsAccepted}</p>
                  )}
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
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              {deliveryNotice && (
                <div className="p-3 rounded-xs bg-forest/5 border border-forest/15 text-xs text-forest">
                  {deliveryNotice}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="reg-otp" className="text-xs font-medium text-charcoal">
                    6-Digit Verification Code <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setErrorMessage(null);
                      setOtp("");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-forest hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Edit phone number
                  </button>
                </div>
                <input
                  id="reg-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full h-11 px-3 text-center text-base tracking-[0.35em] font-mono bg-surface border border-forest/20 rounded-xs text-charcoal placeholder:text-charcoal-muted placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-11 bg-forest hover:bg-forest-600 text-ivory text-sm font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-charcoal-muted">Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 font-medium text-forest disabled:text-charcoal-muted hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="pt-2 text-center border-t border-forest/10">
            <p className="text-xs text-charcoal-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-forest hover:text-forest-600 underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
