"use client";

import * as React from "react";

export type OtpFlowState =
  | "idle"
  | "requesting"
  | "cooldown"
  | "code_sent"
  | "verifying"
  | "verified"
  | "request_failed"
  | "rate_limited"
  | "expired"
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
  const [phone, setPhone] = React.useState(initialPhone);
  const [otp, setOtp] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [isSandbox, setIsSandbox] = React.useState(false);
  const [sandboxCode, setSandboxCode] = React.useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = React.useState(0);
  const [nextAllowedAt, setNextAllowedAt] = React.useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Synchronize state from sessionStorage on mount or phone change
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRaw = window.sessionStorage.getItem(storageKey);
      if (storedRaw) {
        const stored: StoredOtpSession = JSON.parse(storedRaw);
        const cleanCurrent = phone.replace(/\D/g, "");
        const cleanStored = (stored.phone || "").replace(/\D/g, "");

        // If stored session belongs to this phone (or initial phone was empty)
        if (!cleanCurrent || cleanCurrent === cleanStored) {
          if (!phone && stored.phone) {
            setPhone(stored.phone);
          }

          if (stored.isSandbox !== undefined) setIsSandbox(stored.isSandbox);
          if (stored.sandboxCode) setSandboxCode(stored.sandboxCode);

          const now = Date.now();
          if (stored.targetTimestamp > now) {
            const remaining = Math.max(1, Math.ceil((stored.targetTimestamp - now) / 1000));
            setCooldownSeconds(remaining);
            setNextAllowedAt(new Date(stored.targetTimestamp));
            setStep(stored.step || 2);
            setState("code_sent");
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
      const existing: StoredOtpSession = existingRaw ? JSON.parse(existingRaw) : { phone: "", targetTimestamp: 0, step: 1 };
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
   */
  const requestOtp = async (overridePhone?: string, overrideFullName?: string): Promise<boolean> => {
    const targetPhone = (overridePhone || phone).trim();
    const cleanDigits = targetPhone.replace(/\D/g, "");

    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      setState("idle");
      return false;
    }

    // Prevent duplicate requests while already in flight
    if (state === "requesting" || state === "verifying") {
      return false;
    }

    // If cooldown is actively running
    if (cooldownSeconds > 0) {
      setErrorMessage(`Please wait ${cooldownSeconds} seconds before requesting a new code.`);
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
          phone: targetPhone,
          role,
          fullName: (overrideFullName || fullName).trim() || undefined,
          intent,
        }),
      });

      const data = await res.json();
      const retrySec = typeof data.retryAfterSeconds === "number" ? data.retryAfterSeconds : 60;
      const targetTime = Date.now() + retrySec * 1000;

      // Handle 429 Cooldown / Rate Limit
      if (res.status === 429 || (!res.ok && res.status === 429)) {
        setCooldownSeconds(retrySec);
        setNextAllowedAt(data.nextAllowedAt ? new Date(data.nextAllowedAt) : new Date(targetTime));

        if (data.isSandbox !== undefined) setIsSandbox(Boolean(data.isSandbox));
        if (data.sandboxCode) setSandboxCode(data.sandboxCode);

        // If an active challenge already exists for this number, transition to Step 2 so user can enter it
        if (data.hasActiveChallenge || data.sandboxCode) {
          setStep(2);
          setState("code_sent");
          setInfoMessage(
            data.isSandbox
              ? `A verification code is active for +91 ${cleanDigits.slice(-10)}. Enter test code below.`
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

        // Exhaustive rate limit on phone or IP
        setState("rate_limited");
        setErrorMessage(data.message || `Please wait ${retrySec} seconds before requesting a new code.`);
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
        setErrorMessage(data.message || "Failed to transmit verification code. Please check your connection and try again.");
        return false;
      }

      // Success (HTTP 200)
      setState("code_sent");
      setStep(2);
      setCooldownSeconds(retrySec);
      setNextAllowedAt(new Date(targetTime));
      setIsSandbox(Boolean(data.isSandbox));
      if (data.sandboxCode) {
        setSandboxCode(data.sandboxCode);
      }

      setInfoMessage(
        data.isSandbox
          ? "Sandbox mode enabled. Use the test code displayed below to complete verification."
          : `Verification code sent via SMS to +91 ${cleanDigits.slice(-10)}.`
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
    } catch (err) {
      setState("request_failed");
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(msg);
      return false;
    }
  };

  /**
   * Verify entered 6-digit OTP code
   */
  const verifyCode = async (overrideOtp?: string): Promise<boolean> => {
    const code = (overrideOtp || otp).trim();

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      setState("verification_failed");
      return false;
    }

    if (state === "verifying") return false;

    setState("verifying");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: code,
          role,
          fullName: fullName.trim() || undefined,
          intent,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || "Invalid verification code.";
        if (msg.toLowerCase().includes("expired")) {
          setState("expired");
        } else if (res.status === 429 || msg.toLowerCase().includes("maximum")) {
          setState("rate_limited");
        } else {
          setState("verification_failed");
        }
        setErrorMessage(msg);
        return false;
      }

      // Success
      setState("verified");
      clearSession();

      if (onSuccess) {
        await onSuccess(data.user);
      }

      return true;
    } catch (err) {
      setState("verification_failed");
      const msg = err instanceof Error ? err.message : "Verification request failed.";
      setErrorMessage(msg);
      return false;
    }
  };

  /**
   * Return to Step 1 to edit phone number while preserving draft & cooldown
   */
  const editPhone = () => {
    setStep(1);
    setErrorMessage(null);
    setInfoMessage(null);
    // Keep cooldown timer running
  };

  /**
   * Helper to copy sandbox test code
   */
  const copySandboxCode = async (): Promise<boolean> => {
    if (!sandboxCode) return false;
    try {
      await navigator.clipboard.writeText(sandboxCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Helper to auto-fill sandbox code into the input
   */
  const autoFillSandboxCode = () => {
    if (sandboxCode) {
      setOtp(sandboxCode);
      setErrorMessage(null);
    }
  };

  /**
   * Reset all state to idle
   */
  const reset = () => {
    setState("idle");
    setStep(1);
    setOtp("");
    setErrorMessage(null);
    setInfoMessage(null);
    setCooldownSeconds(0);
    clearSession();
  };

  return {
    state,
    step,
    setStep,
    phone,
    setPhone,
    otp,
    setOtp,
    fullName,
    setFullName,
    isSandbox,
    sandboxCode,
    cooldownSeconds,
    nextAllowedAt,
    errorMessage,
    setErrorMessage,
    infoMessage,
    setInfoMessage,
    copiedCode,
    isLoading: state === "requesting" || state === "verifying",
    isCooldown: cooldownSeconds > 0,
    requestOtp,
    verifyCode,
    editPhone,
    copySandboxCode,
    autoFillSandboxCode,
    reset,
  };
}
