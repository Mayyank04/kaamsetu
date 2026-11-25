/**
 * KAAMSETU — Shared Cross-Platform Runtime Bridge
 * Detects active execution shell (Web, PWA Standalone, Capacitor Android/iOS, Electron Desktop)
 * and provides safe native integrations (hardware back navigation, native sharing, offline detection).
 */

export type KaamsetuPlatform = "web" | "pwa" | "android" | "ios" | "desktop";

export interface PlatformCapabilities {
  platform: KaamsetuPlatform;
  isNativeMobile: boolean;
  isDesktopApp: boolean;
  isInstalledPwa: boolean;
  supportsSpeechSynthesis: boolean;
  supportsSpeechRecognition: boolean;
  supportsNativeShare: boolean;
}

export function detectRuntimePlatform(): KaamsetuPlatform {
  if (typeof window === "undefined") return "web";

  // 1. Electron desktop wrapper bridge
  if ((window as unknown as { kaamsetuDesktop?: { isElectron?: boolean } }).kaamsetuDesktop?.isElectron) {
    return "desktop";
  }

  // 2. Capacitor native runtime (Android / iOS)
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  if (cap?.isNativePlatform?.()) {
    const p = cap.getPlatform?.();
    if (p === "android") return "android";
    if (p === "ios") return "ios";
  }

  // 3. Installed Standalone PWA
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return "pwa";

  return "web";
}

export function getPlatformCapabilities(): PlatformCapabilities {
  const platform = detectRuntimePlatform();
  const hasWindow = typeof window !== "undefined";

  return {
    platform,
    isNativeMobile: platform === "android" || platform === "ios",
    isDesktopApp: platform === "desktop",
    isInstalledPwa: platform === "pwa",
    supportsSpeechSynthesis: hasWindow && "speechSynthesis" in window,
    supportsSpeechRecognition:
      hasWindow &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    supportsNativeShare: hasWindow && typeof navigator !== "undefined" && "share" in navigator,
  };
}

/**
 * Registers Android hardware back-button navigation when running inside Capacitor.
 * Navigates browser history back cleanly unless on root path, avoiding sudden exit.
 */
export function registerAndroidBackButtonHandler(onRootExitAttempt?: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const cap = (window as unknown as {
    Capacitor?: {
      Plugins?: {
        App?: {
          addListener?: (
            event: string,
            cb: (state: { canGoBack: boolean }) => void
          ) => { remove: () => void };
        };
      };
    };
  }).Capacitor;

  const appPlugin = cap?.Plugins?.App;
  if (!appPlugin?.addListener) return () => {};

  const listener = appPlugin.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== "/") {
      window.history.back();
    } else if (onRootExitAttempt) {
      onRootExitAttempt();
    }
  });

  return () => {
    try {
      listener?.remove?.();
    } catch {
      // ignore cleanup error
    }
  };
}

/**
 * Cross-platform share helper using Web Share API / native sheet, falling back to clipboard.
 */
export async function shareProfileOrUrl(payload: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "unsupported"> {
  if (typeof navigator === "undefined") return "unsupported";
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch {
      // User cancelled or share unavailable; fall through to clipboard
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload.url);
      return "copied";
    } catch {
      return "unsupported";
    }
  }
  return "unsupported";
}
