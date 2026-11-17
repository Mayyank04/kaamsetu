"use client";

import * as React from "react";
import {
  validateIndianMobile,
  INVALID_PHONE_MESSAGE,
} from "@/lib/utilities/phone";

export type OtpFlowState =
  | "idle"
  | "requesting"
  | "cooldown"
  | "code_sent"
  | "verifying"
  | "verified"
  | "rate_limited"
  | "expired"
  | "request_failed"
  | "configuration_failed"
  | "verification_failed";

export interface UseOtpFlowOptions {
  initialPhone?: string;
  role?: string;
  intent?: "registration" | "login";
  storageKey?: string;
  onSuccess?: (user: any) => void | Promise<void>;
}

interface StoredOtpSession {
  phone: string;
  targetTimestamp: number;
  isSandbox?: boolean;
  sandboxCode?: string;
  step: 1 | 2;
  hasActiveChallenge?: boolean;
}

export function useOtpFlow(options: UseOtpFlowOptions = {}) {
  const {
    initialPhone = "",
    role = "worker",
    intent = "login",
    storageKey = "kaamsetu_otp_session",
    onSuccess,
  } = options;

  const [state, setState] = React.useState<OtpFlowState>("idle");
  const [step, setStep] = React.useState<1 | 2>(1);
  const [phone, setPhoneState] = React.useState(initialPhone);
  const [otp, setOtp] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [isSandbox, setIsSandbox] = React.useState(false);
  const [sandboxCode, setSandboxCode] = React.useState<string | null>(null);
  const [hasActiveChallenge, setHasActiveChallenge] = React.useState(false);
  const [cooldownSeconds, setCooldownSeconds] = React.useState(0);
  const [nextAllowedAt, setNextAllowedAt] = React.useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Derived validation
  const phoneValidation = React.useMemo(() => validateIndianMobile(phone), [phone]);
  const isPhoneValid = phoneValidation.valid;
  const phoneDigits = phone.replace(/\D/g, "");

  // Update phone with immediate inline validation feedback
  const setPhone = React.useCallback((val: string) => {
    setPhoneState(val);
    const trimmed = val.trim();
    const digits = trimmed.replace(/\D/g, "");

    // Clear error if empty
    if (!trimmed) {
      setErrorMessage(null);
      return;
    }

    // If alphabets or special characters entered
    if (/[a-zA-Z]/.test(trimmed)) {
      setErrorMessage(INVALID_PHONE_MESSAGE);
      return;
    }

    // If 10 digits entered but invalid starting digit (e.g. 5456565656)
    if (digits.length === 10 && !/^[6-9]/.test(digits)) {
      setErrorMessage(INVALID_PHONE_MESSAGE);
      return;
    }

    // If starts with invalid digit early (0, 1, 2, 3, 4, 5) when length >= 1 and not country code
    if (digits.length > 0 && !digits.startsWith("91") && !/^[6-9]/.test(digits)) {
      setErrorMessage(INVALID_PHONE_MESSAGE);
      return;
    }

    // Clear validation error when valid
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      setErrorMessage(null);
    }
  }, []);

  // Synchronize state from sessionStorage on mount or phone change
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRaw = window.sessionStorage.getItem(storageKey);
      if (storedRaw) {
        const stored: StoredOtpSession = JSON.parse(storedRaw);
        const cleanCurrent = phone.replace(/\D/g, "");
        const cleanStored = (stored.phone || "").replace(/\D/g, "");

        if (!cleanCurrent || cleanCurrent === cleanStored) {
          if (!phone && stored.phone) {
            setPhoneState(stored.phone);
          }

          if (stored.isSandbox !== undefined) setIsSandbox(stored.isSandbox);
          if (stored.sandboxCode) setSandboxCode(stored.sandboxCode);
          if (stored.hasActiveChallenge !== undefined)
            setHasActiveChallenge(Boolean(stored.hasActiveChallenge));

          const now = Date.now();
          if (stored.targetTimestamp > now) {
            const remaining = Math.max(
              1,
              Math.ceil((stored.targetTimestamp - now) / 1000)
            );
            setCooldownSeconds(remaining);
            setNextAllowedAt(new Date(stored.targetTimestamp));
            setStep(stored.step || 2);
            setState(stored.hasActiveChallenge ? "code_sent" : "cooldown");
          }
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [storageKey, phone]);

  // Interval ticker for cooldown countdown
  const isCooldown = cooldownSeconds > 0;
  React.useEffect(() => {
    if (!isCooldown) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setState((curr) =>
            curr === "cooldown" || curr === "rate_limited" ? "idle" : curr
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCooldown]);

  // Persist session state to sessionStorage
  const saveSession = (data: Partial<StoredOtpSession>) => {
    if (typeof window === "undefined") return;
    try {
      const existingRaw = window.sessionStorage.getItem(storageKey);
      const existing: StoredOtpSession = existingRaw
        ? JSON.parse(existingRaw)
        : { phone: "", targetTimestamp: 0, step: 1 };
      const updated: StoredOtpSession = { ...existing, ...data };
      window.sessionStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const clearSession = () => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  /**
   * Request OTP code dispatch
   * Enforces client-side validation: reject invalid numbers without making network request
   */
  const requestOtp = async (
    overridePhone?: string,
    overrideFullName?: string
  ): Promise<boolean> => {
    const targetPhone = (overridePhone || phone).trim();
    const validation = validateIndianMobile(targetPhone);

    if (!validation.valid) {
      setErrorMessage(validation.error || INVALID_PHONE_MESSAGE);
      setState("idle");
      return false;
    }

    // Prevent duplicate requests while already in flight
    if (state === "requesting" || state === "verifying") {
      return false;
    }

    // If cooldown is actively running
    if (cooldownSeconds > 0) {
      setErrorMessage(`You can request another code in ${cooldownSeconds} seconds.`);
      setState("cooldown");
      return false;
    }

    setState("requesting");
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: validation.clean10,
          role,
          fullName: (overrideFullName || fullName).trim() || undefined,
          intent,
        }),
      });

      const data = await res.json();
      const retrySec =
        typeof data.retryAfterSeconds === "number" ? data.retryAfterSeconds : 60;
      const targetTime = Date.now() + retrySec * 1000;

      // Handle 400 Invalid Phone
      if (res.status === 400 && data.code === "INVALID_PHONE") {
        setState("idle");
        setErrorMessage(data.message || INVALID_PHONE_MESSAGE);
        return false;
      }

      // Handle 503 Database / Infrastructure Unavailable
      if (
        res.status === 503 ||
        data.code === "DATABASE_UNAVAILABLE" ||
        data.code === "AUTH_CONFIGURATION_ERROR" ||
        data.isInfrastructureError
      ) {
        setState("configuration_failed");
        setCooldownSeconds(0);
        setNextAllowedAt(null);
        setErrorMessage(
          data.message ||
            "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment."
        );
        return false;
      }

      // Handle 429 Cooldown / Rate Limit
      if (res.status === 429 || (!res.ok && res.status === 429)) {
        setCooldownSeconds(retrySec);
        setNextAllowedAt(
          data.nextAllowedAt ? new Date(data.nextAllowedAt) : new Date(targetTime)
        );

        if (data.isSandbox !== undefined) setIsSandbox(Boolean(data.isSandbox));
        if (data.sandboxCode) setSandboxCode(data.sandboxCode);

        // If an active challenge exists, transition to Step 2 so user can enter it
        if (data.hasActiveChallenge || data.sandboxCode) {
          setHasActiveChallenge(true);
          setStep(2);
          setState("code_sent");
          setInfoMessage(
            data.isSandbox
              ? `A verification code is active for +91 ${validation.clean10}. Enter test code below.`
              : `A verification code was already dispatched. Please check your SMS or resend in ${retrySec}s.`
          );
          saveSession({
            phone: targetPhone,
            targetTimestamp: targetTime,
            isSandbox: Boolean(data.isSandbox),
            sandboxCode: data.sandboxCode,
            step: 2,
            hasActiveChallenge: true,
          });
          return true;
        }

        // 429 Cooldown without active challenge
        setHasActiveChallenge(false);
        setState("rate_limited");
        setErrorMessage(`You can request another code in ${retrySec} seconds.`);
        saveSession({
          phone: targetPhone,
          targetTimestamp: targetTime,
          step: 1,
          hasActiveChallenge: false,
        });
        return false;
      }

      if (!res.ok || !data.success) {
        setState("request_failed");
        setErrorMessage(
          data.message ||
            "Failed to transmit verification code. Please check your connection and try again."
        );
        return false;
      }

      // Success (HTTP 200)
      setState("code_sent");
      setStep(2);
      setCooldownSeconds(retrySec);
      setNextAllowedAt(new Date(targetTime));
      setIsSandbox(Boolean(data.isSandbox));
      setHasActiveChallenge(true);
      if (data.sandboxCode) {
        setSandboxCode(data.sandboxCode);
      }

      saveSession({
        phone: targetPhone,
        targetTimestamp: targetTime,
        isSandbox: Boolean(data.isSandbox),
        sandboxCode: data.sandboxCode,
        step: 2,
        hasActiveChallenge: true,
      });

      return true;
    } catch {
      setState("request_failed");
      setErrorMessage(
        "Network connection error. Please verify your connection and try again."
      );
      return false;
    }
  };

  /**
   * Verify entered 6-digit OTP code
   */
  const verifyCode = async (overrideOtp?: string): Promise<boolean> => {
    const codeToVerify = (overrideOtp || otp).trim();

    if (!codeToVerify || codeToVerify.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return false;
    }

    if (state === "verifying") {
      return false;
    }

    setState("verifying");
    setErrorMessage(null);

    const validation = validateIndianMobile(phone);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: validation.clean10 || phone.replace(/\D/g, "").slice(-10),
          otp: codeToVerify,
          role,
          fullName: fullName.trim() || undefined,
          intent,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === "OTP_ATTEMPTS_EXCEEDED" || res.status === 429) {
          setState("rate_limited");
          setErrorMessage(
            data.message ||
              "Maximum verification attempts exceeded. Please request a new code."
          );
        } else if (data.code === "OTP_EXPIRED") {
          setState("expired");
          setErrorMessage(
            data.message || "Verification code has expired. Please request a new code."
          );
        } else {
          setState("verification_failed");
          setErrorMessage(
            data.message || "Invalid verification code. Please check and try again."
          );
        }
        return false;
      }

      // Successful verification
      setState("verified");
      clearSession();

      if (onSuccess && data.user) {
        await onSuccess(data.user);
      }

      return true;
    } catch {
      setState("verification_failed");
      setErrorMessage(
        "Network error verifying code. Please try again."
      );
      return false;
    }
  };

  const editPhone = () => {
    setStep(1);
    setOtp("");
    setErrorMessage(null);
    setInfoMessage(null);
    if (state !== "cooldown" && state !== "rate_limited") {
      setState("idle");
    }
  };

  const copySandboxCode = async () => {
    if (!sandboxCode) return;
    try {
      await navigator.clipboard.writeText(sandboxCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const autoFillSandboxCode = () => {
    if (sandboxCode) {
      setOtp(sandboxCode);
      setErrorMessage(null);
    }
  };

  const reset = () => {
    setState("idle");
    setStep(1);
    setPhoneState(initialPhone);
    setOtp("");
    setFullName("");
    setSandboxCode(null);
    setHasActiveChallenge(false);
    setCooldownSeconds(0);
    setNextAllowedAt(null);
    setErrorMessage(null);
    setInfoMessage(null);
    clearSession();
  };

  const isLoading = state === "requesting" || state === "verifying";
  const isVerified = state === "verified";

  const getPrimaryButtonText = (): string => {
    if (isLoading) {
      return step === 1 ? "Sending Code..." : "Verifying...";
    }

    if (step === 1) {
      if (isCooldown) {
        if (hasActiveChallenge) {
          return "Enter Existing Code";
        }
        return `Resend in ${cooldownSeconds}s`;
      }
      if (state === "configuration_failed" || state === "request_failed") {
        return "Try Again";
      }
      return "Send Verification Code";
    }

    // Step 2
    if (state === "verified") {
      return "Verified";
    }
    return "Verify & Mint Credential";
  };

  const handlePrimaryAction = async () => {
    if (step === 1) {
      if (isCooldown && hasActiveChallenge) {
        setStep(2);
        return;
      }
      if (!isCooldown) {
        await requestOtp();
      }
      return;
    }

    await verifyCode();
  };

  return {
    state,
    setState,
    step,
    setStep,
    phone,
    setPhone,
    isPhoneValid,
    phoneDigits,
    otp,
    setOtp,
    fullName,
    setFullName,
    isSandbox,
    sandboxCode,
    hasActiveChallenge,
    cooldownSeconds,
    nextAllowedAt,
    isCooldown,
    isLoading,
    isVerified,
    errorMessage,
    setErrorMessage,
    infoMessage,
    copiedCode,
    getPrimaryButtonText,
    handlePrimaryAction,
    requestOtp,
    verifyCode,
    editPhone,
    copySandboxCode,
    autoFillSandboxCode,
    reset,
  };
}
