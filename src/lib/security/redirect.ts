/**
 * KAAMSETU — Open Redirect Prevention Utility
 * Ensures all redirection targets are strictly relative URLs on the same origin.
 * Prevents phishing and external redirect abuse via URL parameters or server responses.
 */

export function sanitizeRedirectUrl(
  target: string | null | undefined,
  fallback: string = "/dashboard"
): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must begin with a single forward slash.
  // Rejects protocol-relative URLs (//evil.com), backslash variants (/\evil.com or \evil.com).
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.startsWith("\\")
  ) {
    return fallback;
  }

  // Reject CR/LF control characters or null bytes that can trigger HTTP header injection or parser bypasses.
  if (/[\r\n\0]/.test(trimmed)) {
    return fallback;
  }

  // Multi-level decode to prevent percent-encoded bypasses (e.g. /%2f%2fevil.com, /%5cevil.com)
  try {
    let decoded = decodeURIComponent(trimmed);
    if (decoded.includes("%")) {
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        // Ignore second decode error
      }
    }
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.startsWith("/\\") ||
      decoded.startsWith("\\")
    ) {
      return fallback;
    }
    const decodedLower = decoded.toLowerCase();
    if (
      decodedLower.includes("javascript:") ||
      decodedLower.includes("data:") ||
      decodedLower.includes("vbscript:")
    ) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  // Disallow javascript:, data:, vbscript: pseudo-protocols anywhere in the path.
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    lower.includes("vbscript:")
  ) {
    return fallback;
  }

  // Parse against a dummy base origin to verify domain cannot be manipulated.
  try {
    const dummyBase = "http://localhost";
    const parsed = new URL(trimmed, dummyBase);

    // Origin must remain dummyBase
    if (parsed.origin !== dummyBase) {
      return fallback;
    }

    // Pathname must still be relative and not contain double slashes
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
      return fallback;
    }

    // Redirections from authentication and navigation flows must point to application pages, not API endpoints
    if (parsed.pathname.startsWith("/api/") || parsed.pathname === "/api") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
