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
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [role, setRole] = React.useState<"worker" | "contractor" | "customer" | "institution">("worker");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side pre-validations
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }
    if (!email.trim() || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          phone: phone.trim() ? phone.trim() : undefined,
          role,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create account. Please try again.");
      }

      // Refresh client session state
      await refreshSession();

      // Navigate directly to onboarding or role dashboard
      const targetUrl = result.redirectUrl || (role === "worker" ? "/onboarding" : "/dashboard");
      router.push(targetUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      setErrorMessage(message);
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
            <div className="grid grid-cols-2 gap-2">
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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-medium text-charcoal block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className={`w-full h-11 px-3 text-sm bg-surface border rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors ${
                  fieldErrors.email ? "border-red-400" : "border-forest/20"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Mobile Number (Optional) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="reg-phone" className="text-xs font-medium text-charcoal">
                  Mobile Number (Optional contact detail)
                </label>
                <span className="text-[10px] text-charcoal-muted">No OTP required</span>
              </div>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="w-full h-11 px-3 text-sm font-mono bg-surface border border-forest/20 rounded-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
              />
              <p className="text-[10px] text-charcoal-muted">
                Saved as an unverified contact detail for work opportunities.
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
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
