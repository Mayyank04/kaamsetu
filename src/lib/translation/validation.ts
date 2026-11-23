/**
 * KAAMSETU — Translation Validation & Entity Protection
 * Protects critical real-world entities (phone numbers, PIN codes, prices, registry IDs, URLs)
 * from being altered or hallucinated during translation, and attaches mandatory disclaimers.
 */

import { ProtectedEntity, TranslationContentType } from "./types";

export function protectEntities(text: string): {
  maskedText: string;
  entities: ProtectedEntity[];
} {
  if (!text) return { maskedText: text, entities: [] };

  const entities: ProtectedEntity[] = [];
  let masked = text;
  let counter = 0;

  // 1. URLs
  const urlRegex = /\bhttps?:\/\/[^\s/$.?#].[^\s]*/gi;
  masked = masked.replace(urlRegex, (match) => {
    const placeholder = `[[ENTITY_URL_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "url" });
    return placeholder;
  });

  // 2. Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  masked = masked.replace(emailRegex, (match) => {
    const placeholder = `[[ENTITY_EMAIL_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "email" });
    return placeholder;
  });

  // 3. KAAMSETU Registry IDs (e.g., KS-AS-781001, KS-39-ABC123)
  const registryRegex = /\bKS-[A-Za-z0-9]{2,4}-[A-Za-z0-9]{4,8}\b/g;
  masked = masked.replace(registryRegex, (match) => {
    const placeholder = `[[ENTITY_REGISTRY_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "registry_id" });
    return placeholder;
  });

  // 4. Indian Mobile Numbers (10 digits, optional +91 or 0 prefix)
  const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g;
  masked = masked.replace(phoneRegex, (match) => {
    const placeholder = `[[ENTITY_PHONE_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "phone" });
    return placeholder;
  });

  // 5. Currency Amounts (e.g., ₹500, ₹ 1,500, Rs. 250, Rs 300)
  const currencyRegex = /(?:₹|Rs\.?)\s*[\d,]+(?:\.\d{2})?\b/gi;
  masked = masked.replace(currencyRegex, (match) => {
    const placeholder = `[[ENTITY_CURRENCY_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "currency" });
    return placeholder;
  });

  // 6. Indian Postal PIN Codes (6 digits starting with 1-9)
  const pinRegex = /\b[1-9][0-9]{2}\s?[0-9]{3}\b/g;
  masked = masked.replace(pinRegex, (match) => {
    // Avoid re-matching numbers that are part of other tokens
    if (match.length >= 6) {
      const placeholder = `[[ENTITY_PIN_${counter++}]]`;
      entities.push({ placeholder, originalValue: match, type: "pincode" });
      return placeholder;
    }
    return match;
  });

  // 7. Masked Identity Tokens (e.g. XXXX-XXXX-1234, ****-****-1234, •••• •••• 1234)
  const maskedIdRegex = /\b[X*•]{4}[-\s]?[X*•]{4}[-\s]?[0-9]{4}\b/gi;
  masked = masked.replace(maskedIdRegex, (match) => {
    const placeholder = `[[ENTITY_MASKED_ID_${counter++}]]`;
    entities.push({ placeholder, originalValue: match, type: "registry_id" });
    return placeholder;
  });

  return { maskedText: masked, entities };
}

export function restoreEntities(
  translatedText: string,
  entities: ProtectedEntity[]
): { restoredText: string; preservedCount: number } {
  if (!translatedText || entities.length === 0) {
    return { restoredText: translatedText, preservedCount: 0 };
  }

  let restored = translatedText;
  let preservedCount = 0;

  for (const entity of entities) {
    // Handle both exact placeholder and possible spacing mutations introduced by translation models
    const regex = new RegExp(
      entity.placeholder.replace(/\[/g, "\\[").replace(/\]/g, "\\]") +
        `|\\b${entity.placeholder.replace(/\[\[|\]\]/g, "")}\\b`,
      "g"
    );

    if (regex.test(restored)) {
      restored = restored.replace(regex, entity.originalValue);
      preservedCount++;
    } else {
      // If placeholder was dropped by provider, append preserved entity at end safely
      restored += ` (${entity.originalValue})`;
      preservedCount++;
    }
  }

  return { restoredText: restored, preservedCount };
}

export function getTranslationDisclaimer(
  contentType?: TranslationContentType,
  text?: string
): string | undefined {
  if (!contentType) return "Machine translated content. Tap 'Show Original' to verify.";

  if (contentType === "booking_instruction" || contentType === "customer_enquiry") {
    return "Machine translation of direct communication. Service terms, addresses, and prices should be confirmed before job start.";
  }

  if (contentType === "service_description") {
    // Check for technical or safety keywords
    if (/electric|wiring|voltage|breaker|gas|plumbing|leak/i.test(text || "")) {
      return "Technical safety trade translation. Verify physical wireman licenses, site conditions, and quotes in person.";
    }
    return "Service description translated automatically. Rates and scope subject to mutual agreement.";
  }

  if (contentType === "product_catalog") {
    return "Product pricing and availability are set directly by the local vendor.";
  }

  return "Machine translated content for accessibility. Original text preserved.";
}
