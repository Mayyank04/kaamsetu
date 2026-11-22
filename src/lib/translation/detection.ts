/**
 * KAAMSETU — Multilingual Script and Language Detection Engine
 * Uses deterministic Unicode block frequency analysis and distinctive
 * morpheme/lexicon markers to identify Indian source languages accurately.
 */

import { LanguageDetectionResult } from "./types";

export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      detectedLanguage: "en",
      confidence: 0,
      isReliable: false,
      scriptDetected: "Empty",
    };
  }

  const clean = text.trim();

  // Character count by script block
  let devanagariCount = 0;
  let bengaliAssameseCount = 0;
  let gurmukhiCount = 0;
  let gujaratiCount = 0;
  let odiaCount = 0;
  let tamilCount = 0;
  let teluguCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let persoArabicCount = 0;
  let olChikiCount = 0;
  let latinCount = 0;

  let hasAssameseSpecificChars = false; // ৰ (\u09F0), ৱ (\u09F1)
  let hasKashmiriUrduMarkers = false;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);

    // Devanagari: \u0900-\u097F
    if (code >= 0x0900 && code <= 0x097f) {
      devanagariCount++;
    }
    // Bengali-Assamese: \u0980-\u09FF
    else if (code >= 0x0980 && code <= 0x09ff) {
      bengaliAssameseCount++;
      if (code === 0x09f0 || code === 0x09f1) {
        hasAssameseSpecificChars = true;
      }
    }
    // Gurmukhi: \u0A00-\u0A7F
    else if (code >= 0x0a00 && code <= 0x0a7f) {
      gurmukhiCount++;
    }
    // Gujarati: \u0A80-\u0AFF
    else if (code >= 0x0a80 && code <= 0x0aff) {
      gujaratiCount++;
    }
    // Odia: \u0B00-\u0B7F
    else if (code >= 0x0b00 && code <= 0x0b7f) {
      odiaCount++;
    }
    // Tamil: \u0B80-\u0BFF
    else if (code >= 0x0b80 && code <= 0x0bff) {
      tamilCount++;
    }
    // Telugu: \u0C00-\u0C7F
    else if (code >= 0x0c00 && code <= 0x0c7f) {
      teluguCount++;
    }
    // Kannada: \u0C80-\u0CFF
    else if (code >= 0x0c80 && code <= 0x0cff) {
      kannadaCount++;
    }
    // Malayalam: \u0D00-\u0D7F
    else if (code >= 0x0d00 && code <= 0x0d7f) {
      malayalamCount++;
    }
    // Perso-Arabic (Urdu, Kashmiri, Sindhi): \u0600-\u06FF, \u0750-\u077F
    else if ((code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f)) {
      persoArabicCount++;
      // Kashmiri specific vowels or letters
      if (code === 0x0620 || code === 0x0657 || code === 0x065a) {
        hasKashmiriUrduMarkers = true;
      }
    }
    // Ol Chiki: \u1C50-\u1C7F
    else if (code >= 0x1c50 && code <= 0x1c7f) {
      olChikiCount++;
    }
    // Latin: A-Z, a-z
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    }
  }

  const totalAnalyzed =
    devanagariCount +
    bengaliAssameseCount +
    gurmukhiCount +
    gujaratiCount +
    odiaCount +
    tamilCount +
    teluguCount +
    kannadaCount +
    malayalamCount +
    persoArabicCount +
    olChikiCount +
    latinCount;

  if (totalAnalyzed === 0) {
    return {
      detectedLanguage: "en",
      confidence: 0.5,
      isReliable: false,
      scriptDetected: "Punctuation/Numeric",
    };
  }

  // 1. Bengali-Assamese
  if (bengaliAssameseCount / totalAnalyzed > 0.4) {
    const isAssamese =
      hasAssameseSpecificChars ||
      /\b(মই|আছো|কৰোঁ|দোকান|গুৱাহাটী|শ্বিলং|নমস্কাৰ|লাগে|হব|হ'ব)\b/i.test(clean);
    return {
      detectedLanguage: isAssamese ? "as" : "bn",
      confidence: Math.min(0.98, bengaliAssameseCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: isAssamese ? "Assamese" : "Bengali",
    };
  }

  // 2. Tamil
  if (tamilCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "ta",
      confidence: Math.min(0.99, tamilCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Tamil",
    };
  }

  // 3. Telugu
  if (teluguCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "te",
      confidence: Math.min(0.99, teluguCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Telugu",
    };
  }

  // 4. Kannada
  if (kannadaCount / totalAnalyzed > 0.4) {
    // Check if Tulu vocabulary present
    const isTulu = /\b(ಯಾನ್|ಎಂಕ್|ಇರೆಗ್|ಪಿರ|ಇತ್ತೆ|ಬರ್ಪೆ)\b/i.test(clean);
    return {
      detectedLanguage: isTulu ? "tcy" : "kn",
      confidence: Math.min(0.98, kannadaCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Kannada",
    };
  }

  // 5. Malayalam
  if (malayalamCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "ml",
      confidence: Math.min(0.99, malayalamCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Malayalam",
    };
  }

  // 6. Gujarati
  if (gujaratiCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "gu",
      confidence: Math.min(0.99, gujaratiCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Gujarati",
    };
  }

  // 7. Gurmukhi (Punjabi)
  if (gurmukhiCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "pa",
      confidence: Math.min(0.99, gurmukhiCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Gurmukhi",
    };
  }

  // 8. Odia
  if (odiaCount / totalAnalyzed > 0.4) {
    return {
      detectedLanguage: "or",
      confidence: Math.min(0.99, odiaCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: "Odia",
    };
  }

  // 9. Perso-Arabic (Urdu, Kashmiri, Sindhi)
  if (persoArabicCount / totalAnalyzed > 0.4) {
    const isKashmiri = hasKashmiriUrduMarkers || /\b(چھ|چھُ|چھِ|گژھان|بۄزِو|پوز)\b/i.test(clean);
    const isSindhi = /\b(آهيان|ڪري|ٿو|ٿي|مون|آهي)\b/i.test(clean);
    return {
      detectedLanguage: isKashmiri ? "ks" : isSindhi ? "sd" : "ur",
      confidence: Math.min(0.95, persoArabicCount / totalAnalyzed + 0.1),
      isReliable: true,
      scriptDetected: isKashmiri ? "Kashmiri (Nastaliq)" : isSindhi ? "Sindhi" : "Urdu",
    };
  }

  // 10. Ol Chiki (Santali)
  if (olChikiCount / totalAnalyzed > 0.3) {
    return {
      detectedLanguage: "sat",
      confidence: 0.95,
      isReliable: true,
      scriptDetected: "Ol Chiki",
    };
  }

  // 11. Devanagari Differentiation (Hindi, Marathi, Maithili, Nepali, Bhojpuri, Rajasthani, Sanskrit)
  if (devanagariCount / totalAnalyzed > 0.3) {
    // Marathi markers
    if (/(आहे|नाही|आहोत|केले|झाले|पाहिजे|कामाचा|दुकानदार|शेतकरी)/u.test(clean)) {
      return {
        detectedLanguage: "mr",
        confidence: 0.94,
        isReliable: true,
        scriptDetected: "Devanagari (Marathi)",
      };
    }
    // Nepali markers
    if (/(छ|छैन|भयो|गर्नुहोस्|कामदार|गर्छन्|हाम्रो)/u.test(clean)) {
      return {
        detectedLanguage: "ne",
        confidence: 0.93,
        isReliable: true,
        scriptDetected: "Devanagari (Nepali)",
      };
    }
    // Bhojpuri markers
    if (/(बा|बानी|बाड़ें|रउआ|कइल|हमार|तोहार|होई)/u.test(clean)) {
      return {
        detectedLanguage: "bho",
        confidence: 0.92,
        isReliable: true,
        scriptDetected: "Devanagari (Bhojpuri)",
      };
    }
    // Maithili markers
    if (/(अछि|छथि|अहाँ|कएल|हमार|कहलनि|दुकानक)/u.test(clean)) {
      return {
        detectedLanguage: "mai",
        confidence: 0.91,
        isReliable: true,
        scriptDetected: "Devanagari (Maithili)",
      };
    }
    // Sanskrit markers
    if (/(अस्ति|भवति|करोति|नमः|मञ्चम्|कार्यम्|शिल्पी)/u.test(clean)) {
      return {
        detectedLanguage: "sa",
        confidence: 0.95,
        isReliable: true,
        scriptDetected: "Devanagari (Sanskrit)",
      };
    }
    // Default Devanagari to Hindi
    return {
      detectedLanguage: "hi",
      confidence: 0.96,
      isReliable: true,
      scriptDetected: "Devanagari (Hindi)",
    };
  }

  // 12. Latin Differentiation (English, Khasi, Garo, Mizo)
  if (latinCount / totalAnalyzed > 0.4) {
    if (/\b(nga|phi|bha|kam|shnong|lynti)\b/i.test(clean)) {
      return {
        detectedLanguage: "kha",
        confidence: 0.88,
        isReliable: true,
        scriptDetected: "Latin (Khasi)",
      };
    }
    if (/\b(anga|naa|dong|kam|song)\b/i.test(clean)) {
      return {
        detectedLanguage: "grt",
        confidence: 0.85,
        isReliable: true,
        scriptDetected: "Latin (Garo)",
      };
    }
    if (/\b(ka|ni|chu|hna|tur|kan|ti)\b/i.test(clean)) {
      return {
        detectedLanguage: "lus",
        confidence: 0.86,
        isReliable: true,
        scriptDetected: "Latin (Mizo)",
      };
    }
    return {
      detectedLanguage: "en",
      confidence: 0.98,
      isReliable: true,
      scriptDetected: "Latin (English)",
    };
  }

  return {
    detectedLanguage: "en",
    confidence: 0.6,
    isReliable: false,
    scriptDetected: "Mixed",
  };
}
