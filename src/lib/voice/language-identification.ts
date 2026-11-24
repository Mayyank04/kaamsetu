/**
 * KAAMSETU — Precision Language Identification & Script Differentiation
 * 
 * Accurately distinguishes between:
 * 1. User-Selected Language (Highest Priority: never overridden by heuristics)
 * 2. Unicode Orthographic Script (Devanagari, Bengali-Assamese, Perso-Arabic, Latin, Dravidian scripts)
 * 3. Specific Linguistic Variant (e.g. Marathi vs. Hindi vs. Nepali vs. Sanskrit in Devanagari)
 * 4. Ambiguity Detection & Disambiguation Candidates
 */

export interface LanguageIdentificationResult {
  detectedLanguage: string; // ISO 639-1 / 639-3 code
  identifiedLanguage: string; // Backward & testing alias for detectedLanguage
  script: string; // Human-readable script name
  scriptCode: string; // ISO 15924 script code (e.g. 'Deva', 'Beng', 'Arab', 'Latn')
  confidence: number; // 0.0 to 1.0
  isAmbiguous: boolean;
  candidates: { code: string; name: string; nativeName: string; confidence: number }[];
  isUserSpecified: boolean;
  linguisticMarkersMatched: string[];
}

export interface ScriptAnalysis {
  primaryScript: string;
  scriptCode: string;
  charCount: number;
  totalChars: number;
  ratio: number;
  hasAssameseDistinctiveChars: boolean; // ৰ (\u09F0), ৱ (\u09F1)
  hasMarathiDistinctiveChars: boolean; // ळ (\u0933)
  hasSanskritVisarga: boolean; // ः (\u0903)
  hasPersoArabicKashmiriChars: boolean;
}

/**
 * Analyzes Unicode character distributions across Indian script blocks.
 */
export function analyzeUnicodeScript(text: string): ScriptAnalysis {
  if (!text || !text.trim()) {
    return {
      primaryScript: "Latin",
      scriptCode: "Latn",
      charCount: 0,
      totalChars: 0,
      ratio: 0,
      hasAssameseDistinctiveChars: false,
      hasMarathiDistinctiveChars: false,
      hasSanskritVisarga: false,
      hasPersoArabicKashmiriChars: false,
    };
  }

  const clean = text.trim();
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
  let latinCount = 0;

  let hasAssameseDistinctiveChars = false;
  let hasMarathiDistinctiveChars = false;
  let hasSanskritVisarga = false;
  let hasPersoArabicKashmiriChars = false;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);

    // Devanagari: \u0900-\u097F
    if (code >= 0x0900 && code <= 0x097f) {
      devanagariCount++;
      if (code === 0x0933) hasMarathiDistinctiveChars = true; // ळ
      if (code === 0x0903) hasSanskritVisarga = true; // ः
    }
    // Bengali-Assamese: \u0980-\u09FF
    else if (code >= 0x0980 && code <= 0x09ff) {
      bengaliAssameseCount++;
      if (code === 0x09f0 || code === 0x09f1) {
        hasAssameseDistinctiveChars = true; // ৰ, ৱ
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
    // Perso-Arabic: \u0600-\u06FF, \u0750-\u077F
    else if ((code >= 0x0600 && code <= 0x06ff) || (code >= 0x0750 && code <= 0x077f)) {
      persoArabicCount++;
      if (code === 0x0620 || code === 0x0657 || code === 0x065a) {
        hasPersoArabicKashmiriChars = true;
      }
    }
    // Latin: A-Z, a-z
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
    }
  }

  const scripts = [
    { name: "Devanagari", code: "Deva", count: devanagariCount },
    { name: "Bengali-Assamese", code: "Beng", count: bengaliAssameseCount },
    { name: "Gurmukhi", code: "Guru", count: gurmukhiCount },
    { name: "Gujarati", code: "Gujr", count: gujaratiCount },
    { name: "Odia", code: "Orya", count: odiaCount },
    { name: "Tamil", code: "Taml", count: tamilCount },
    { name: "Telugu", code: "Telu", count: teluguCount },
    { name: "Kannada", code: "Knda", count: kannadaCount },
    { name: "Malayalam", code: "Mlym", count: malayalamCount },
    { name: "Perso-Arabic", code: "Arab", count: persoArabicCount },
    { name: "Latin", code: "Latn", count: latinCount },
  ];

  scripts.sort((a, b) => b.count - a.count);
  const primary = scripts[0];
  const total = scripts.reduce((acc, s) => acc + s.count, 0) || 1;

  return {
    primaryScript: primary.count > 0 ? primary.name : "Latin",
    scriptCode: primary.count > 0 ? primary.code : "Latn",
    charCount: primary.count,
    totalChars: total,
    ratio: primary.count / total,
    hasAssameseDistinctiveChars,
    hasMarathiDistinctiveChars,
    hasSanskritVisarga,
    hasPersoArabicKashmiriChars,
  };
}

/**
 * Identifies the exact language of text, taking user-selected language as highest priority,
 * and performing rigorous linguistic analysis when source is 'auto' or unspecified.
 */
export function identifyTextLanguage(
  text: string,
  userSelectedLang?: string | null
): LanguageIdentificationResult {
  const clean = (text || "").trim();

  // 1. USER-SELECTED SOURCE LANGUAGE HAS HIGHEST PRIORITY
  if (userSelectedLang && userSelectedLang !== "auto") {
    const analysis = analyzeUnicodeScript(clean);
    return {
      detectedLanguage: userSelectedLang,
      identifiedLanguage: userSelectedLang,
      script: analysis.primaryScript,
      scriptCode: analysis.scriptCode,
      confidence: 1.0,
      isAmbiguous: false,
      candidates: [],
      isUserSpecified: true,
      linguisticMarkersMatched: ["user_explicit_selection"],
    };
  }

  // 2. EMPTY OR WHITESPACE-ONLY INPUT
  if (!clean) {
    return {
      detectedLanguage: "en",
      identifiedLanguage: "en",
      script: "Latin",
      scriptCode: "Latn",
      confidence: 0,
      isAmbiguous: false,
      candidates: [],
      isUserSpecified: false,
      linguisticMarkersMatched: [],
    };
  }

  const analysis = analyzeUnicodeScript(clean);
  const markers: string[] = [];

  // 3. DEVANAGARI SCRIPT FAMILY (Hindi, Marathi, Nepali, Sanskrit, Maithili, Bhojpuri)
  if (analysis.scriptCode === "Deva") {
    // 3A. Definite Marathi (distinctive letter ळ or strong Marathi morphemes)
    const marathiMorphemes = /(आहे|नाही|आहोत|केले|झाले|पाहिजे|कामाचा|दुकानदार|शेतकरी|नमस्कार|करतो|करते|करावे|कसे)/u;
    if (analysis.hasMarathiDistinctiveChars || marathiMorphemes.test(clean)) {
      if (analysis.hasMarathiDistinctiveChars) markers.push("letter_lla_U0933");
      const match = clean.match(marathiMorphemes);
      if (match) markers.push(`morpheme_${match[0]}`);

      return {
        detectedLanguage: "mr",
        identifiedLanguage: "mr",
        script: "Devanagari",
        scriptCode: "Deva",
        confidence: 0.96,
        isAmbiguous: false,
        candidates: [
          { code: "mr", name: "Marathi", nativeName: "मराठी", confidence: 0.96 },
          { code: "hi", name: "Hindi", nativeName: "हिन्दी", confidence: 0.04 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 3B. Definite Nepali (Nepali morphemes)
    const nepaliMorphemes = /(छ|छैन|भयो|गर्नुहोस्|कामदार|गर्छन्|हाम्रो|गर्छु|हुन्छ|नमस्ते|धन्यवाद)/u;
    if (nepaliMorphemes.test(clean) && !/(है|हैं|था|थी)/u.test(clean)) {
      const match = clean.match(nepaliMorphemes);
      if (match) markers.push(`nepali_morpheme_${match[0]}`);

      return {
        detectedLanguage: "ne",
        identifiedLanguage: "ne",
        script: "Devanagari",
        scriptCode: "Deva",
        confidence: 0.94,
        isAmbiguous: false,
        candidates: [
          { code: "ne", name: "Nepali", nativeName: "नेपाली", confidence: 0.94 },
          { code: "hi", name: "Hindi", nativeName: "हिन्दी", confidence: 0.06 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 3C. Definite Sanskrit (Visarga + Sanskrit verbal roots and sandhi)
    const sanskritMorphemes = /(अस्ति|भवति|करोति|नमस्करोमि|सर्वम्|नमः|शान्तिः|कुरुते|कार्यम्|शिल्पी|विद्या|गुरुः|देवाः)/u;
    if (analysis.hasSanskritVisarga || sanskritMorphemes.test(clean)) {
      if (analysis.hasSanskritVisarga) markers.push("visarga_U0903");
      const match = clean.match(sanskritMorphemes);
      if (match) markers.push(`sanskrit_morpheme_${match[0]}`);

      return {
        detectedLanguage: "sa",
        identifiedLanguage: "sa",
        script: "Devanagari",
        scriptCode: "Deva",
        confidence: 0.95,
        isAmbiguous: false,
        candidates: [
          { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", confidence: 0.95 },
          { code: "hi", name: "Hindi", nativeName: "हिन्दी", confidence: 0.05 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 3D. Definite Hindi (Hindi auxiliary verbs and grammatical postpositions)
    const hindiMorphemes = /(है|हैं|था|थी|थीं|थे|रहा|रही|रहे|करता|करती|करते|करना|होगा|होगी|होंगे|नमस्ते|धन्यवाद|आपका|मेरी|हमारा)/u;
    if (hindiMorphemes.test(clean)) {
      const match = clean.match(hindiMorphemes);
      if (match) markers.push(`hindi_morpheme_${match[0]}`);

      return {
        detectedLanguage: "hi",
        identifiedLanguage: "hi",
        script: "Devanagari",
        scriptCode: "Deva",
        confidence: 0.98,
        isAmbiguous: false,
        candidates: [
          { code: "hi", name: "Hindi", nativeName: "हिन्दी", confidence: 0.98 },
          { code: "mr", name: "Marathi", nativeName: "मराठी", confidence: 0.01 },
          { code: "ne", name: "Nepali", nativeName: "नेपाली", confidence: 0.01 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 3E. Ambiguous Devanagari (Shared vocabulary or single word like 'दुकान', 'कारीगर')
    return {
      detectedLanguage: "hi", // Default baseline in India, but explicitly marked ambiguous
      identifiedLanguage: "hi",
      script: "Devanagari",
      scriptCode: "Deva",
      confidence: 0.65,
      isAmbiguous: true,
      candidates: [
        { code: "hi", name: "Hindi", nativeName: "हिन्दी", confidence: 0.50 },
        { code: "mr", name: "Marathi", nativeName: "मराठी", confidence: 0.30 },
        { code: "ne", name: "Nepali", nativeName: "नेपाली", confidence: 0.15 },
        { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", confidence: 0.05 },
      ],
      isUserSpecified: false,
      linguisticMarkersMatched: ["devanagari_generic_shared_script"],
    };
  }

  // 4. BENGALI-ASSAMESE SCRIPT FAMILY
  if (analysis.scriptCode === "Beng") {
    // 4A. Distinctive Assamese letters Ra (ৰ) or Wa (ৱ)
    if (analysis.hasAssameseDistinctiveChars) {
      markers.push("assamese_letter_ra_wa");
      return {
        detectedLanguage: "as",
        identifiedLanguage: "as",
        script: "Bengali-Assamese",
        scriptCode: "Beng",
        confidence: 0.99,
        isAmbiguous: false,
        candidates: [
          { code: "as", name: "Assamese", nativeName: "অসমীয়া", confidence: 0.99 },
          { code: "bn", name: "Bengali", nativeName: "বাংলা", confidence: 0.01 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 4B. Assamese morphemes
    const assameseMorphemes = /(মই|আছো|আছোঁ|কৰোঁ|কৰিছোঁ|গুৱাহাটী|শ্বিলং|নমস্কাৰ|লাগে|হব|হ'ব|হৈছে|আপোনাৰ|কামটো)/u;
    if (assameseMorphemes.test(clean)) {
      const match = clean.match(assameseMorphemes);
      if (match) markers.push(`assamese_morpheme_${match[0]}`);
      return {
        detectedLanguage: "as",
        identifiedLanguage: "as",
        script: "Bengali-Assamese",
        scriptCode: "Beng",
        confidence: 0.97,
        isAmbiguous: false,
        candidates: [
          { code: "as", name: "Assamese", nativeName: "অসমীয়া", confidence: 0.97 },
          { code: "bn", name: "Bengali", nativeName: "বাংলা", confidence: 0.03 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 4C. Bengali morphemes
    const bengaliMorphemes = /(আমি|করছি|আছি|কলকাতা|নমস্কার|চালাই|ধন্যবাদ|হয়েছে|আপনার|কাজটি)/u;
    if (bengaliMorphemes.test(clean)) {
      const match = clean.match(bengaliMorphemes);
      if (match) markers.push(`bengali_morpheme_${match[0]}`);
      return {
        detectedLanguage: "bn",
        identifiedLanguage: "bn",
        script: "Bengali-Assamese",
        scriptCode: "Beng",
        confidence: 0.97,
        isAmbiguous: false,
        candidates: [
          { code: "bn", name: "Bengali", nativeName: "বাংলা", confidence: 0.97 },
          { code: "as", name: "Assamese", nativeName: "অসমীয়া", confidence: 0.03 },
        ],
        isUserSpecified: false,
        linguisticMarkersMatched: markers,
      };
    }

    // 4D. Ambiguous Bengali-Assamese
    return {
      detectedLanguage: "bn",
      identifiedLanguage: "bn",
      script: "Bengali-Assamese",
      scriptCode: "Beng",
      confidence: 0.70,
      isAmbiguous: true,
      candidates: [
        { code: "bn", name: "Bengali", nativeName: "বাংলা", confidence: 0.55 },
        { code: "as", name: "Assamese", nativeName: "অসমীয়া", confidence: 0.45 },
      ],
      isUserSpecified: false,
      linguisticMarkersMatched: ["bengali_assamese_shared_script"],
    };
  }

  // 5. UNAMBIGUOUS REGIONAL INDIC SCRIPTS
  if (analysis.scriptCode === "Taml") {
    return {
      detectedLanguage: "ta",
      identifiedLanguage: "ta",
      script: "Tamil",
      scriptCode: "Taml",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "ta", name: "Tamil", nativeName: "தமிழ்", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["tamil_script_unique"],
    };
  }

  if (analysis.scriptCode === "Telu") {
    return {
      detectedLanguage: "te",
      identifiedLanguage: "te",
      script: "Telugu",
      scriptCode: "Telu",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "te", name: "Telugu", nativeName: "తెలుగు", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["telugu_script_unique"],
    };
  }

  if (analysis.scriptCode === "Knda") {
    return {
      detectedLanguage: "kn",
      identifiedLanguage: "kn",
      script: "Kannada",
      scriptCode: "Knda",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["kannada_script_unique"],
    };
  }

  if (analysis.scriptCode === "Mlym") {
    return {
      detectedLanguage: "ml",
      identifiedLanguage: "ml",
      script: "Malayalam",
      scriptCode: "Mlym",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "ml", name: "Malayalam", nativeName: "മലയാളം", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["malayalam_script_unique"],
    };
  }

  if (analysis.scriptCode === "Gujr") {
    return {
      detectedLanguage: "gu",
      identifiedLanguage: "gu",
      script: "Gujarati",
      scriptCode: "Gujr",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["gujarati_script_unique"],
    };
  }

  if (analysis.scriptCode === "Guru") {
    return {
      detectedLanguage: "pa",
      identifiedLanguage: "pa",
      script: "Gurmukhi",
      scriptCode: "Guru",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["gurmukhi_script_unique"],
    };
  }

  if (analysis.scriptCode === "Orya") {
    return {
      detectedLanguage: "or",
      identifiedLanguage: "or",
      script: "Odia",
      scriptCode: "Orya",
      confidence: 0.99,
      isAmbiguous: false,
      candidates: [{ code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", confidence: 0.99 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["odia_script_unique"],
    };
  }

  // 6. PERSO-ARABIC SCRIPT FAMILY (Urdu, Kashmiri, Sindhi)
  if (analysis.scriptCode === "Arab") {
    const isKashmiri = analysis.hasPersoArabicKashmiriChars || /\b(چھ|چھُ|چھِ|گژھان|بۄزِو)\b/u.test(clean);
    const isSindhi = /\b(آهيان|ڪري|ٿو|ٿي|مون|آهي)\b/u.test(clean);
    const lang = isKashmiri ? "ks" : isSindhi ? "sd" : "ur";

    return {
      detectedLanguage: lang,
      identifiedLanguage: lang,
      script: isKashmiri ? "Kashmiri (Nastaliq)" : isSindhi ? "Sindhi (Arabic)" : "Urdu (Nastaliq)",
      scriptCode: "Arab",
      confidence: 0.95,
      isAmbiguous: !isKashmiri && !isSindhi,
      candidates: [
        { code: "ur", name: "Urdu", nativeName: "اردو", confidence: 0.85 },
        { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", confidence: 0.10 },
        { code: "sd", name: "Sindhi", nativeName: "سنڌي", confidence: 0.05 },
      ],
      isUserSpecified: false,
      linguisticMarkersMatched: isKashmiri ? ["kashmiri_markers"] : isSindhi ? ["sindhi_markers"] : ["perso_arabic_script"],
    };
  }

  // 7. LATIN SCRIPT FAMILY (English, Khasi, Garo, Mizo)
  if (analysis.scriptCode === "Latn") {
    if (/\b(khublei|shibun|nga|phi|bha|shnong|lynti|trei|bad phi)\b/i.test(clean)) {
      return {
        detectedLanguage: "kha",
        identifiedLanguage: "kha",
        script: "Latin",
        scriptCode: "Latn",
        confidence: 0.90,
        isAmbiguous: false,
        candidates: [{ code: "kha", name: "Khasi", nativeName: "Ka Ktien Khasi", confidence: 0.90 }],
        isUserSpecified: false,
        linguisticMarkersMatched: ["khasi_lexicon"],
      };
    }
    if (/\b(mittela|anga|naa|dong|ka·na|manderang|skie|song)\b/i.test(clean)) {
      return {
        detectedLanguage: "grt",
        identifiedLanguage: "grt",
        script: "Latin",
        scriptCode: "Latn",
        confidence: 0.88,
        isAmbiguous: false,
        candidates: [{ code: "grt", name: "Garo", nativeName: "A·chik", confidence: 0.88 }],
        isUserSpecified: false,
        linguisticMarkersMatched: ["garo_lexicon"],
      };
    }
    if (/\b(ka|ni|chu|hna|tur|kan|ti)\b/i.test(clean)) {
      return {
        detectedLanguage: "lus",
        identifiedLanguage: "lus",
        script: "Latin",
        scriptCode: "Latn",
        confidence: 0.88,
        isAmbiguous: false,
        candidates: [{ code: "lus", name: "Mizo", nativeName: "Mizo ṭawng", confidence: 0.88 }],
        isUserSpecified: false,
        linguisticMarkersMatched: ["mizo_lexicon"],
      };
    }

    return {
      detectedLanguage: "en",
      identifiedLanguage: "en",
      script: "Latin",
      scriptCode: "Latn",
      confidence: 0.98,
      isAmbiguous: false,
      candidates: [{ code: "en", name: "English", nativeName: "English", confidence: 0.98 }],
      isUserSpecified: false,
      linguisticMarkersMatched: ["latin_standard_english"],
    };
  }

  return {
    detectedLanguage: "en",
    identifiedLanguage: "en",
    script: "Mixed",
    scriptCode: "Zyyy",
    confidence: 0.5,
    isAmbiguous: true,
    candidates: [{ code: "en", name: "English", nativeName: "English", confidence: 0.5 }],
    isUserSpecified: false,
    linguisticMarkersMatched: ["mixed_symbols"],
  };
}
