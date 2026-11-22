/**
 * KAAMSETU — Cryptographic Translation Cache
 * Generates SHA-256 tokens and caches translations securely.
 * Enforces strict isolation: private messages and enquiries are NEVER stored in public cache.
 */

import crypto from "crypto";
import { TranslationResult, TranslationProviderType } from "./types";

interface CacheEntry {
  result: TranslationResult;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache with LRU eviction (max 1000 items, 24-hour TTL)
const MEMORY_CACHE = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 1000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateCacheKey(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  provider: TranslationProviderType,
  configVersion: string = "v1"
): string {
  const normalized = text.trim();
  const rawKey = `${normalized}::${sourceLanguage}::${targetLanguage}::${provider}::${configVersion}`;
  return crypto.createHash("sha256").update(rawKey, "utf8").digest("hex");
}

export async function getCachedTranslation(
  key: string,
  isPrivate?: boolean
): Promise<TranslationResult | null> {
  // Private content is never cached
  if (isPrivate) return null;

  const entry = MEMORY_CACHE.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    MEMORY_CACHE.delete(key);
    return null;
  }

  // Return copy with cached: true
  return {
    ...entry.result,
    cached: true,
  };
}

export async function setCachedTranslation(
  key: string,
  result: TranslationResult,
  isPrivate?: boolean,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  // Invariant: Never cache private communication in public or shared memory
  if (isPrivate) return;

  // Evict oldest if full
  if (MEMORY_CACHE.size >= MAX_CACHE_ENTRIES) {
    const firstKey = MEMORY_CACHE.keys().next().value;
    if (firstKey) MEMORY_CACHE.delete(firstKey);
  }

  MEMORY_CACHE.set(key, {
    result,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearTranslationCache(): void {
  MEMORY_CACHE.clear();
}

export function getCacheStats(): { size: number; max: number } {
  return {
    size: MEMORY_CACHE.size,
    max: MAX_CACHE_ENTRIES,
  };
}
