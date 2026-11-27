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
  RefreshCw,
  FlaskConical,
  Check,
  Copy,
  Lock,
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

  // Primary Form State
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

  // Phone Verification Workflow State
  // "idle" -> "sending_otp" -> "otp_sent" -> "verifying_otp" -> "verified"
  const [phoneState, setPhoneState] = React.useState<"idle" | "sending_otp" | "otp_sent" | "verifying_otp" | "verified">("idle");
  const [verificationProof, setVerificationProof] = React.useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState<string | null>(null);
  const [isSandbox, setIsSandbox] = React.useState(true);
  const [sandboxCode, setSandboxCode] = React.useState<string | null>("123456");
  const [otp, setOtp] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [copiedOtp, setCopiedOtp] = React.useState(false);

  // Loading & Error States
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Copy testing OTP to clipboard and pre-fill input
  const handleCopyOtp = () => {
    const code = sandboxCode || "123456";
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setOtp(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  // Step 2: User clicks "Send verification code" / "Verify phone number"
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setPhoneError(null);
    setOtpError(null);

    const rawPhoneInput = phone.trim().startsWith("+") ? phone.trim() : `${countryCode}${phone.trim()}`;
    const phoneCheck = normalizePhoneNumber(rawPhoneInput, countryCode);

    if (!phone.trim() || !phoneCheck.valid) {
      setPhoneError(phoneCheck.error || "Please enter a valid mobile number.");
      return;
    }

    setPhoneState("sending_otp");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneCheck.e164,
          role,
          fullName: fullName.trim() || "Prospective User",
          intent: "registration",
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.retryAfterSeconds && data.retryAfterSeconds > 0) {
          setResendCooldown(data.retryAfterSeconds);
        }
        throw new Error(data.message || "Failed to send verification code. Please check your number.");
      }

      setNormalizedPhone(phoneCheck.e164);
      setIsSandbox(data.isSandbox !== false);
      setSandboxCode(data.sandboxCode || "123456");
      setResendCooldown(data.retryAfterSeconds || 45);
      setPhoneState("otp_sent");
      setOtp("");
    } catch (err: unknown) {
      setPhoneState("idle");
      setPhoneError(err instanceof Error ? err.message : "Failed to initiate phone verification.");
    }
  };

  // Step 3: User submits OTP code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setOtpError(null);

    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setPhoneState("verifying_otp");
    try {
      const res = await fetch("/api/auth/otp/verify", {
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

      const data = await res.json();
      if (!res.ok || !data.success || !data.verificationProof) {
        throw new Error(data.message || "Invalid verification code. Please check and try again.");
      }

      setVerificationProof(data.verificationProof);
      setVerificationStatus(data.phoneVerificationStatus || (data.isSandbox ? "sandbox_verified" : "sms_verified"));
      setPhoneState("verified");
    } catch (err: unknown) {
      setPhoneState("otp_sent");
      setOtpError(err instanceof Error ? err.message : "Verification failed. Please check the code.");
    }
  };

  // Change phone number action: unlocks phone input and clears OTP challenge
  const handleChangePhone = () => {
    setPhoneState("idle");
    setVerificationProof(null);
    setVerificationStatus(null);
    setOtp("");
    setOtpError(null);
    setPhoneError(null);
  };

  // Final Registration Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (phoneState !== "verified" || !verificationProof) {
      errors.phone = "Please verify your mobile number before creating your account.";
    }

    const cleanOptionalEmail = email.trim().toLowerCase();
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
      setErrorMessage(errors.phone || errors.termsAccepted || "Please correct the highlighted errors in the form.");
      return;
    }

    setIsRegistering(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: normalizedPhone,
          verificationProof,
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
      setErrorMessage(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
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
            Create Your Account
          </h1>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto leading-relaxed">
            Every skill deserves to be seen, even without a degree. Join the national digital craft registry.
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

          <form onSubmit={handleFinalSubmit} className="space-y-4">
            {/* Full Legal Name */}
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

            {/* Mandatory Mobile Number with Country Code & Verification Workflow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="reg-phone" className="text-xs font-medium text-charcoal block">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                {phoneState === "verified" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  aria-label="Country calling code"
                  disabled={phoneState === "verified"}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-11 px-2 text-xs font-mono bg-surface border border-forest/20 rounded-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest shrink-0 disabled:opacity-75 disabled:bg-surface/50"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    disabled={phoneState === "verified"}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder={countryCode === "+91" ? "9876543210" : "Mobile number"}
                    maxLength={16}
                    className={`w-full h-11 px-3 text-sm font-mono bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors disabled:opacity-75 disabled:bg-surface/50 ${
                      phoneError || fieldErrors.phone ? "border-red-400" : "border-forest/20"
                    }`}
                  />
                  {phoneState === "verified" && (
                    <Lock className="w-3.5 h-3.5 text-forest absolute right-3 top-3.5 pointer-events-none" />
                  )}
                </div>

                {/* Primary Action Button: Send verification code */}
                {phoneState === "idle" && (
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    className="h-11 px-3.5 text-xs font-semibold bg-forest hover:bg-forest-600 text-ivory rounded-xs shrink-0 transition-colors shadow-xs"
                  >
                    Verify phone number
                  </Button>
                )}

                {phoneState === "sending_otp" && (
                  <Button
                    type="button"
                    disabled
                    className="h-11 px-3.5 text-xs font-semibold bg-forest/80 text-ivory rounded-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </Button>
                )}

                {phoneState === "verified" && (
                  <button
                    type="button"
                    onClick={handleChangePhone}
                    className="h-11 px-3 text-xs font-medium text-forest hover:underline shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>

              {phoneError && (
                <p className="text-[11px] text-red-600 font-medium">{phoneError}</p>
              )}
              {fieldErrors.phone && !phoneError && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.phone}</p>
              )}

              {/* Verified Status Banner */}
              {phoneState === "verified" && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium">
                      Phone verified in sandbox mode
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase tracking-wider">
                    {verificationStatus || "sandbox_verified"}
                  </span>
                </div>
              )}

              {/* IN-PLACE OTP VERIFICATION SECTION (Rendered when code sent) */}
              {(phoneState === "otp_sent" || phoneState === "verifying_otp") && (
                <div className="mt-3 p-4 bg-forest/5 border border-forest/20 rounded-xs space-y-3.5 animate-in fade-in">
                  {/* Top Bar: Testing Mode Badge & Change Number */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-medium">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Sandbox verification — testing mode</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleChangePhone}
                      className="text-[11px] text-forest font-medium hover:underline"
                    >
                      Change phone number
                    </button>
                  </div>

                  <p className="text-xs text-charcoal">
                    We sent a verification code to <span className="font-mono font-semibold">{normalizedPhone}</span>.
                  </p>

                  {/* Sandbox OTP Callout with Copy Button */}
                  {isSandbox && (
                    <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xs flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-amber-950">Testing OTP:</span>
                        <span className="font-mono text-sm tracking-wider font-bold bg-white px-2 py-0.5 border border-amber-300 rounded-xs text-forest">
                          {sandboxCode || "123456"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-forest text-ivory rounded-xs hover:bg-forest-600 transition-colors flex items-center gap-1"
                      >
                        {copiedOtp ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 6-Digit OTP Entry */}
                  <div className="space-y-1">
                    <label htmlFor="signup-otp" className="text-xs font-semibold text-forest block">
                      Verify your phone number
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="signup-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        autoFocus
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                          if (otpError) setOtpError(null);
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 h-11 px-3 text-center text-base tracking-[0.35em] font-mono bg-surface border border-forest/25 rounded-xs text-charcoal placeholder:text-charcoal-muted placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
                      />
                      <Button
                        type="button"
                        disabled={otp.length !== 6 || phoneState === "verifying_otp"}
                        onClick={() => handleVerifyOtp()}
                        className="h-11 px-4 text-xs font-semibold bg-forest hover:bg-forest-600 text-ivory rounded-xs shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        {phoneState === "verifying_otp" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {otpError && (
                    <p className="text-[11px] text-red-600 font-medium">{otpError}</p>
                  )}

                  {/* Resend Cooldown & Helper Row */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-forest/10">
                    <span className="text-[11px] text-charcoal-muted">Didn&apos;t receive the code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || phoneState === "verifying_otp"}
                      onClick={handleSendOtp}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-forest disabled:text-charcoal-muted hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-charcoal-muted">
                One account per verified mobile number. Testing mode uses code <span className="font-mono font-bold">123456</span>.
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
                placeholder="Enter your email address"
                className={`w-full h-11 px-3 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                  fieldErrors.email ? "border-red-400" : "border-forest/20"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.email}</p>
              )}
              <p className="text-[10px] text-charcoal-muted">
                Optional — add an email for account recovery and important updates.
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

            {/* Account Creation Button: Unlocked strictly when phoneState === "verified" */}
            <div className="pt-2 space-y-1.5">
              <Button
                type="submit"
                disabled={isRegistering || phoneState !== "verified"}
                className="w-full h-11 bg-forest hover:bg-forest-600 text-ivory text-sm font-semibold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              {phoneState !== "verified" && (
                <p className="text-[11px] text-center text-charcoal-muted">
                  * Please verify your mobile number above before creating your account.
                </p>
              )}
            </div>
          </form>

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
