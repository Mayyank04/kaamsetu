/**
 * KAAMSETU — Universal Transliteration & Romanization Engine
 * 
 * Provides phonetically accurate Roman transliteration (Latin characters)
 * for Indian languages and scripts, giving users an immediate pronunciation guide.
 * 
 * Distinctive Linguistic Rules:
 * - Assamese (as): Inherent vowel 'o' ([ɔ]/[o]), 'ৰ' -> 'r', 'ৱ' -> 'w',
 *   'নমস্কাৰ' -> 'Nomoskar', 'ধন্যবাদ' -> 'Dhonyobad'.
 * - Bengali (bn): Inherent vowel 'o', 'নমস্কার' -> 'Nomoshkar', 'ধন্যবাদ' -> 'Dhonnobad'.
 * - Hindi (hi), Marathi (mr), Sanskrit (sa): Inherent vowel 'a',
 *   schwa deletion at word boundaries in Hindi/Marathi ('नमस्ते' -> 'Namaste', 'धन्यवाद' -> 'Dhanyavaad').
 * - Tamil (ta): Dravidian phonetic rules ('வணக்கம்' -> 'Vanakkam', 'நன்றி' -> 'Nandri').
 * - Telugu (te), Kannada (kn), Malayalam (ml), Gujarati (gu), Punjabi (pa), Odia (or), Urdu (ur).
 */

export interface TransliterationResult {
  text: string;
  transliteration: string;
  sourceLanguage: string;
  isAvailable: boolean;
  scriptDetected: string;
}

// ============================================================================
// 1. HIGH-FREQUENCY PHRASE & TRADE DICTIONARY (Learner-Friendly Gold Standard)
// ============================================================================
const PHRASE_DICTIONARY: Record<string, Record<string, string>> = {
  // Assamese (অসমীয়া)
  as: {
    "নমস্কাৰ": "Nomoskar",
    "নমস্কাৰ!": "Nomoskar!",
    "নমস্কাৰ।": "Nomoskar.",
    "ধন্যবাদ": "Dhonyobad",
    "ধন্যবাদ।": "Dhonyobad.",
    "কেনে আছে?": "Kene aase?",
    "আপোনাৰ নাম কি?": "Aapunar naam ki?",
    "মই ভাল আছো": "Moi bhal aasu",
    "মই ভাল আছোঁ।": "Moi bhal aasu.",
    "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।": "Moi Guwahatit eta xoru dorjir dukan solau.",
    "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাই আছোঁ।": "Moi Guwahatit eta xoru dorjir dukan solai aasu.",
    "নমস্কাৰ, আপোনাৰ কামটো কিমান দিনত সম্পূৰ্ণ হ'ব?": "Nomoskar, aapunar kaamto kiman dinot xompurno hobo?",
    "মই এজন প্ৰমাণিত ইলেক্ট্ৰিচিয়ান।": "Moi ejon promanit electrician.",
    "মোক ঘৰৰ ৱায়াৰিং আৰু চুইচ ব'ৰ্ড মেৰামতি কৰাব লাগে।": "Mok ghoror wiring aru switch board meramoti korabo lage.",
    "তাঁতশাল বোৱাত ১৫ বছৰৰ অভিজ্ঞতা থকা প্ৰত্যায়িত ওস্তাদ শিল্পী।": "Taatxaal bowat 15 bosoror obhigyota thoka protyayito ostad xilpi.",
    "দৰ্জী": "Dorji",
    "ইলেক্ট্ৰিচিয়ান": "Electrician",
    "বাঢ়ৈ": "Badhoi",
    "প্লাম্বাৰ": "Plumber",
    "দোকান": "Dukan",
    "টকা": "Toka",
    "কাম": "Kaam",
    "অসম": "Axom",
    "গুৱাহাটী": "Guwahati",
  },

  // Bengali (বাংলা)
  bn: {
    "নমস্কার": "Nomoshkar",
    "নমস্কার!": "Nomoshkar!",
    "নমস্কার।": "Nomoshkar.",
    "ধন্যবাদ": "Dhonnobad",
    "ধন্যবাদ।": "Dhonnobad.",
    "কেমন আছেন?": "Kemon aachen?",
    "আপনার নাম কি?": "Aapnar naam ki?",
    "আমি ভালো আছি": "Aami bhalo aachi",
    "আমি ভালো আছি।": "Aami bhalo aachi.",
    "আমি গুয়াহাটিতে একটি ছোট দর্জির দোকান চালাই।": "Aami Guwahatite ekti chhoto dorjir dokan chalai.",
    "নমস্কার, আপনার কাজটি কত দিনে সম্পূর্ণ হবে?": "Nomoshkar, aapnar kaajti koto dine shompurno hobe?",
    "আমি একজন প্রত্যয়িত ইলেকট্রিশিয়ান।": "Aami ekjon protyayito electrician.",
    "আমাকে বাড়ির ওয়্যারিং এবং সুইচ বোর্ড মেরামত করাতে হবে।": "Aamake barir wiring ebong switch board meramot korate hobe.",
    "দর্জি": "Dorji",
    "ইলেকট্রিশিয়ান": "Electrician",
    "ছুতোর": "Chhutor",
    "প্লাম্বার": "Plumber",
    "দোকান": "Dokan",
    "টাকা": "Taka",
    "কাজ": "Kaaj",
  },

  // Hindi (हिन्दी) & Sanskrit (संस्कृत) & Bhojpuri & Marathi
  hi: {
    "नमस्ते": "Namaste",
    "नमस्ते!": "Namaste!",
    "नमस्ते।": "Namaste.",
    "धन्यवाद": "Dhanyavaad",
    "धन्यवाद।": "Dhanyavaad.",
    "कृपया": "Kripya",
    "सुप्रभात": "Suprabhat",
    "शुभ रात्रि": "Shubh raatri",
    "आप कैसे हैं?": "Aap kaise hain?",
    "आपका नाम क्या है?": "Aapka naam kya hai?",
    "मैं ठीक हूँ": "Main theek hoon",
    "मैं ठीक हूँ।": "Main theek hoon.",
    "हाँ": "Haan",
    "नहीं": "Nahin",
    "अच्छा": "Achha",
    "ठीक है": "Theek hai",
    "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।": "Main Guwahati mein ek chhoti darzi ki dukaan chalata hoon.",
    "नमस्ते, मुझे घर की वायरिंग और स्विच बोर्ड ठीक करवाना है।": "Namaste, mujhe ghar ki wiring aur switch board theek karwana hai.",
    "मैं एक प्रमाणित इलेक्ट्रीशियन हूँ।": "Main ek pramaanit electrician hoon.",
    "हथकरघा बुनाई में 15 वर्षों के अनुभव के साथ सत्यापित कुशल कारीगर।": "Hathkargha bunayi mein 15 varshon ke anubhav ke saath satyapit kushal kaarigar.",
    "दर्जी": "Darzi",
    "इलेक्ट्रीशियन": "Electrician",
    "बढ़ई": "Badhai",
    "प्लम्बर": "Plumber",
    "दुकान": "Dukaan",
    "काम": "Kaam",
    "कारीगर": "Kaarigar",
    "रुपये": "Rupaye",
    "मदद": "Madad",
  },

  // Tamil (தமிழ்)
  ta: {
    "வணக்கம்": "Vanakkam",
    "வணக்கம்!": "Vanakkam!",
    "வணக்கம்.": "Vanakkam.",
    "நன்றி": "Nandri",
    "நன்றி.": "Nandri.",
    "காலை வணக்கம்": "Kaalai Vanakkam",
    "எப்படி இருக்கிறீர்கள்?": "Eppadi irukkireergal?",
    "உங்கள் பெயர் என்ன?": "Ungal peyar enna?",
    "நான் நலமாக இருக்கிறேன்": "Naan nalamaaga irukkiren",
    "நான் குவஹாத்தியில் ஒரு சிறிய தையல் கடை நடத்தி வருகிறேன்.": "Naan Guwahathiyil oru siriya thaiyal kadai nadathi varugiren.",
    "வணக்கம், எனக்கு வீட்டு வயரிங் மற்றும் சுவிட்ச் போர்டுகளை சரி செய்ய வேண்டும்.": "Vanakkam, enakku veettu wiring matrum switch boardugalai sari seyya vendum.",
    "நான் ஒரு சான்றளிக்கப்பட்ட எலக்ட்ரீஷியன்.": "Naan oru saandrallikkapatta electrician.",
    "தையல்காரர்": "Thaiyalkaaran",
    "மின்சார வல்லுநர்": "Minsaara vallunar",
    "தச்சர்": "Thachar",
    "கடை": "Kadai",
    "வேலை": "Vela",
    "பணம்": "Panam",
  },

  // Telugu (తెలుగు)
  te: {
    "నమస్కారం": "Namaskaram",
    "నమస్కారం!": "Namaskaram!",
    "ధన్యవాదాలు": "Dhanyavadalu",
    "ధన్యవాదాలు.": "Dhanyavadalu.",
    "బాగున్నారా?": "Bagunnara?",
    "మీ పేరు ఏమిటి?": "Mee peru emiti?",
    "నేను బాగున్నాను": "Nenu bagunnanu",
    "నేను గౌహతిలో ఒక చిన్న టైలరింగ్ దుకాణం నడుపుతున్నాను.": "Nenu Gauhatilo oka chinna tailoring dukanam naduputunnanu.",
    "నమస్కారం, నాకు ఇంటి వైరింగ్ మరియు స్విచ్ బోర్డులు బాగు చేయించాలి.": "Namaskaram, naaku inti wiring mariyu switch boardulu baagu cheyinchali.",
    "నేను సర్టిఫైడ్ ఎలక్ట్రీషియన్‌ని.": "Nenu certified electrician-ni.",
    "దర్జీ": "Darzi",
    "ఎలక్ట్రీషియన్": "Electrician",
    "వడ్రంగి": "Vadrangi",
    "దుకాణం": "Dukanam",
    "పని": "Pani",
  },

  // Marathi (मराठी)
  mr: {
    "नमस्कार": "Namaskar",
    "नमस्कार!": "Namaskar!",
    "धन्यवाद": "Dhanyavaad",
    "तुम्ही कसे आहात?": "Tumhi kase aahat?",
    "मी छान आहे": "Mee chhan aahe",
    "मी गुवाहाटीमध्ये एक लहान शिंप्याचे दुकान चालवतो.": "Mee Guwahatimadhye ek lahan shimpyache dukaan chalavto.",
    "शिंपी": "Shimpi",
    "सुतार": "Sutaar",
    "काम": "Kaam",
    "दुकान": "Dukaan",
  },

  // Gujarati (ગુજરાતી)
  gu: {
    "નમસ્તે": "Namaste",
    "નમસ્તે!": "Namaste!",
    "આભાર": "Aabhar",
    "કેમ છો?": "Kem chho?",
    "હું મજામાં છું": "Hun majama chhun",
    "હું ગુવાહાટીમાં એક નાની દરજીની દુકાન ચલાવું છું.": "Hun Guwahatima ek naani darjini dukaan chalaavu chhun.",
    "દરજી": "Darji",
    "સુથાર": "Suthaar",
    "કામ": "Kaam",
    "દુકાન": "Dukaan",
  },

  // Punjabi (ਪੰਜਾਬੀ)
  pa: {
    "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ": "Sat Shri Akaal",
    "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ!": "Sat Shri Akaal!",
    "ਧੰਨਵਾਦ": "Dhanvaad",
    "ਕਿਵੇਂ ਹੋ?": "Kiven ho?",
    "ਮੈਂ ਠੀਕ ਹਾਂ": "Main theek haan",
    "ਮੈਂ ਗੁਵਾਹਾਟੀ ਵਿੱਚ ਇੱਕ ਛੋਟੀ ਦਰਜ਼ੀ ਦੀ ਦੁਕਾਨ ਚਲਾਉਂਦਾ ਹਾਂ।": "Main Guwahatit vich ik chhoti darzi di dukaan chalaunda haan.",
    "ਦਰਜ਼ੀ": "Darzi",
    "ਤਰਖਾਣ": "Tarkhaan",
    "ਕੰਮ": "Kamm",
    "ਦੁਕਾਨ": "Dukaan",
  },

  // Kannada (ಕನ್ನಡ)
  kn: {
    "ನಮಸ್ಕಾರ": "Namaskara",
    "ನಮಸ್ಕಾರ!": "Namaskara!",
    "ಧನ್ಯವಾದಗಳು": "Dhanyavadagalu",
    "ಹೇಗಿದ್ದೀರಾ?": "Hegiddeera?",
    "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ": "Naanu chennagiddene",
    "ಕೆಲಸ": "Kelasa",
    "ಅಂಗಡಿ": "Angadi",
  },

  // Malayalam (മലയാളം)
  ml: {
    "നമസ്കാരം": "Namaskaram",
    "നമസ്കാരം!": "Namaskaram!",
    "നന്ദി": "Nandi",
    "സുഖമാണോ?": "Sukhamano?",
    "എനിക്ക് സുഖമാണ്": "Enikku sukhamanu",
    "ജോലി": "Joli",
    "കട": "Kada",
  },

  // Odia (ଓଡ଼ିଆ)
  or: {
    "ନମସ୍କାର": "Namaskara",
    "ନମସ୍କାର!": "Namaskara!",
    "ଧନ୍ୟବାଦ": "Dhanyabada",
    "କେମିତି ଅଛନ୍ତି?": "Kemiti achhanti?",
    "ମୁଁ ଭଲ ଅଛି": "Mun bhala achhi",
    "କାମ": "Kaama",
    "ଦୋକାନ": "Dokana",
  },

  // Urdu (اردو)
  ur: {
    "سلام": "Salam",
    "سلام!": "Salam!",
    "آداب": "Aadaab",
    "شکریہ": "Shukriya",
    "شکریہ!": "Shukriya!",
    "آپ کیسے ہیں؟": "Aap kaise hain?",
    "میں ٹھیک ہوں": "Main theek hoon",
    "خوش آمدید": "Khush Aamdeed",
    "کام": "Kaam",
    "دکان": "Dukaan",
  },
};

// ============================================================================
// 2. PHONETIC CHARACTER MAPS FOR INDIC & PERSO-ARABIC SCRIPTS
// ============================================================================

interface ScriptPhoneticMap {
  vowels: Record<string, string>;
  matras: Record<string, string>;
  consonants: Record<string, string>;
  virama: string;
  anusvara: Record<string, string>;
  inherentVowel: string;
}

// 2.1 DEVANAGARI (Hindi, Marathi, Sanskrit, Bhojpuri, Maithili, Nepali, etc.)
const DEVANAGARI_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u094D",
  vowels: {
    "\u0905": "a", "\u0906": "aa", "\u0907": "i", "\u0908": "ee",
    "\u0909": "u", "\u090A": "oo", "\u090B": "ri", "\u090F": "e",
    "\u0910": "ai", "\u0913": "o", "\u0914": "au",
  },
  matras: {
    "\u093E": "aa", "\u093F": "i", "\u0940": "ee", "\u0941": "u",
    "\u0942": "oo", "\u0943": "ri", "\u0947": "e", "\u0948": "ai",
    "\u094B": "o", "\u094C": "au",
  },
  anusvara: {
    "\u0902": "n", "\u0901": "n", "\u0903": "h",
  },
  consonants: {
    "\u0915": "k", "\u0916": "kh", "\u0917": "g", "\u0918": "gh", "\u0919": "ng",
    "\u091A": "ch", "\u091B": "chh", "\u091C": "j", "\u091D": "jh", "\u091E": "ny",
    "\u091F": "t", "\u0920": "th", "\u0921": "d", "\u0922": "dh", "\u0923": "n",
    "\u0924": "t", "\u0925": "th", "\u0926": "d", "\u0927": "dh", "\u0928": "n",
    "\u092A": "p", "\u092B": "ph", "\u092C": "b", "\u092D": "bh", "\u092E": "m",
    "\u092F": "y", "\u0930": "r", "\u0932": "l", "\u0935": "v",
    "\u0936": "sh", "\u0937": "sh", "\u0938": "s", "\u0939": "h",
    "\u0958": "q", "\u0959": "kh", "\u095A": "gh", "\u095B": "z",
    "\u095C": "r", "\u095D": "rh", "\u095E": "f", "\u095F": "y",
  },
};

// 2.2 BENGALI-ASSAMESE SCRIPT
// Assamese has distinctive inherent vowel 'o' and characters 'ৰ' (U+09F0) and 'ৱ' (U+09F1)
const BENGALI_ASSAMESE_MAP: ScriptPhoneticMap = {
  inherentVowel: "o", // default for Assamese and Bengali learner transliteration
  virama: "\u09CD",
  vowels: {
    "\u0985": "o", "\u0986": "aa", "\u0987": "i", "\u0988": "ee",
    "\u0989": "u", "\u098A": "oo", "\u098B": "ri", "\u098F": "e",
    "\u0990": "oi", "\u0993": "o", "\u0994": "ou",
  },
  matras: {
    "\u09BE": "aa", "\u09BF": "i", "\u09C0": "ee", "\u09C1": "u",
    "\u09C2": "oo", "\u09C3": "ri", "\u09C7": "e", "\u09C8": "oi",
    "\u09CB": "o", "\u09CC": "ou",
  },
  anusvara: {
    "\u0982": "ng", "\u0981": "n", "\u0983": "h",
  },
  consonants: {
    "\u0995": "k", "\u0996": "kh", "\u0997": "g", "\u0998": "gh", "\u0999": "ng",
    "\u099A": "ch", "\u099B": "chh", "\u099C": "j", "\u099D": "jh", "\u099E": "ny",
    "\u099F": "t", "\u09A0": "th", "\u09A1": "d", "\u09A2": "dh", "\u09A3": "n",
    "\u09A4": "t", "\u09A5": "th", "\u09A6": "d", "\u09A7": "dh", "\u09A8": "n",
    "\u09AA": "p", "\u09AB": "ph", "\u09AC": "b", "\u09AD": "bh", "\u09AE": "m",
    "\u09AF": "j", "\u09AF\u09BC": "y", "\u09DF": "y",
    "\u09B0": "r", "\u09F0": "r", "\u09F1": "w", // U+09F0 is Assamese Ra, U+09F1 is Assamese Wa
    "\u09B2": "l",
    "\u09B6": "sh", "\u09B7": "sh", "\u09B8": "s", "\u09B9": "h",
    "\u09DC": "r", "\u09DD": "rh", "\u09CE": "t",
  },
};

// 2.3 TAMIL SCRIPT
const TAMIL_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0BCD",
  vowels: {
    "\u0B85": "a", "\u0B86": "aa", "\u0B87": "i", "\u0B88": "ee",
    "\u0B89": "u", "\u0B8A": "oo", "\u0B8E": "e", "\u0B8F": "ae",
    "\u0B90": "ai", "\u0B92": "o", "\u0B93": "oo", "\u0B94": "au",
  },
  matras: {
    "\u0BBE": "aa", "\u0BBF": "i", "\u0BC0": "ee", "\u0BC1": "u",
    "\u0BC2": "oo", "\u0BC6": "e", "\u0BC7": "ae", "\u0BC8": "ai",
    "\u0BCA": "o", "\u0BCB": "oo", "\u0BCC": "au",
  },
  anusvara: {
    "\u0B82": "m", "\u0B83": "h",
  },
  consonants: {
    "\u0B95": "k", "\u0B99": "ng", "\u0B9A": "ch", "\u0B9E": "ny",
    "\u0B9F": "t", "\u0BA3": "n", "\u0BA4": "th", "\u0BA8": "n",
    "\u0BAA": "p", "\u0BAE": "m", "\u0BAF": "y", "\u0BB0": "r",
    "\u0BB2": "l", "\u0BB5": "v", "\u0BB4": "zh", "\u0BB3": "l",
    "\u0BB1": "r", "\u0BA9": "n", "\u0BB7": "sh", "\u0BB8": "s", "\u0BB9": "h",
  },
};

// 2.4 TELUGU SCRIPT
const TELUGU_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0C4D",
  vowels: {
    "\u0C05": "a", "\u0C06": "aa", "\u0C07": "i", "\u0C08": "ee",
    "\u0C09": "u", "\u0C0A": "oo", "\u0C0B": "ri", "\u0C0E": "e",
    "\u0C0F": "ae", "\u0C10": "ai", "\u0C12": "o", "\u0C13": "oo", "\u0C14": "au",
  },
  matras: {
    "\u0C3E": "aa", "\u0C3F": "i", "\u0C40": "ee", "\u0C41": "u",
    "\u0C42": "oo", "\u0C43": "ri", "\u0C46": "e", "\u0C47": "ae",
    "\u0C48": "ai", "\u0C4A": "o", "\u0C4B": "oo", "\u0C4C": "au",
  },
  anusvara: {
    "\u0C02": "m", "\u0C03": "h",
  },
  consonants: {
    "\u0C15": "k", "\u0C16": "kh", "\u0C17": "g", "\u0C18": "gh", "\u0C19": "ng",
    "\u0C1A": "ch", "\u0C1B": "chh", "\u0C1C": "j", "\u0C1D": "jh", "\u0C1E": "ny",
    "\u0C1F": "t", "\u0C20": "th", "\u0C21": "d", "\u0C22": "dh", "\u0C23": "n",
    "\u0C24": "t", "\u0C25": "th", "\u0C26": "d", "\u0C27": "dh", "\u0C28": "n",
    "\u0C2A": "p", "\u0C2B": "ph", "\u0C2C": "b", "\u0C2D": "bh", "\u0C2E": "m",
    "\u0C2F": "y", "\u0C30": "r", "\u0C31": "r", "\u0C32": "l", "\u0C33": "l",
    "\u0C35": "v", "\u0C36": "sh", "\u0C37": "sh", "\u0C38": "s", "\u0C39": "h",
  },
};

// 2.5 GUJARATI SCRIPT
const GUJARATI_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0ACD",
  vowels: {
    "\u0A85": "a", "\u0A86": "aa", "\u0A87": "i", "\u0A88": "ee",
    "\u0A89": "u", "\u0A8A": "oo", "\u0A8B": "ri", "\u0A8F": "e",
    "\u0A90": "ai", "\u0A93": "o", "\u0A94": "au",
  },
  matras: {
    "\u0ABE": "aa", "\u0ABF": "i", "\u0AC0": "ee", "\u0AC1": "u",
    "\u0AC2": "oo", "\u0AC3": "ri", "\u0AC7": "e", "\u0AC8": "ai",
    "\u0ACB": "o", "\u0ACC": "au",
  },
  anusvara: {
    "\u0A82": "n", "\u0A83": "h",
  },
  consonants: {
    "\u0A95": "k", "\u0A96": "kh", "\u0A97": "g", "\u0A98": "gh", "\u0A99": "ng",
    "\u0A9A": "ch", "\u0A9B": "chh", "\u0A9C": "j", "\u0A9D": "jh", "\u0A9E": "ny",
    "\u0A9F": "t", "\u0AA0": "th", "\u0AA1": "d", "\u0AA2": "dh", "\u0AA3": "n",
    "\u0AA4": "t", "\u0AA5": "th", "\u0AA6": "d", "\u0AA7": "dh", "\u0AA8": "n",
    "\u0AAA": "p", "\u0AAB": "ph", "\u0AAC": "b", "\u0AAD": "bh", "\u0AAE": "m",
    "\u0AAF": "y", "\u0AB0": "r", "\u0AB2": "l", "\u0AB5": "v",
    "\u0AB6": "sh", "\u0AB7": "sh", "\u0AB8": "s", "\u0AB9": "h",
  },
};

// 2.6 GURMUKHI (Punjabi)
const GURMUKHI_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0A4D",
  vowels: {
    "\u0A05": "a", "\u0A06": "aa", "\u0A07": "i", "\u0A08": "ee",
    "\u0A09": "u", "\u0A0A": "oo", "\u0A0F": "e", "\u0A10": "ai",
    "\u0A13": "o", "\u0A14": "au",
  },
  matras: {
    "\u0A3E": "aa", "\u0A3F": "i", "\u0A40": "ee", "\u0A41": "u",
    "\u0A42": "oo", "\u0A47": "e", "\u0A48": "ai", "\u0A4B": "o", "\u0A4C": "au",
  },
  anusvara: {
    "\u0A02": "n", "\u0A70": "n", "\u0A71": "",
  },
  consonants: {
    "\u0A15": "k", "\u0A16": "kh", "\u0A17": "g", "\u0A18": "gh", "\u0A19": "ng",
    "\u0A1A": "ch", "\u0A1B": "chh", "\u0A1C": "j", "\u0A1D": "jh", "\u0A1E": "ny",
    "\u0A1F": "t", "\u0A20": "th", "\u0A21": "d", "\u0A22": "dh", "\u0A23": "n",
    "\u0A24": "t", "\u0A25": "th", "\u0A26": "d", "\u0A27": "dh", "\u0A28": "n",
    "\u0A2A": "p", "\u0A2B": "ph", "\u0A2C": "b", "\u0A2D": "bh", "\u0A2E": "m",
    "\u0A2F": "y", "\u0A30": "r", "\u0A32": "l", "\u0A35": "v",
    "\u0A38": "s", "\u0A39": "h", "\u0A36": "sh", "\u0A5B": "z", "\u0A5E": "f",
  },
};

// 2.7 ODIA SCRIPT
const ODIA_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0B4D",
  vowels: {
    "\u0B05": "a", "\u0B06": "aa", "\u0B07": "i", "\u0B08": "ee",
    "\u0B09": "u", "\u0B0A": "oo", "\u0B0B": "ri", "\u0B0F": "e",
    "\u0B10": "ai", "\u0B13": "o", "\u0B14": "au",
  },
  matras: {
    "\u0B3E": "aa", "\u0B3F": "i", "\u0B40": "ee", "\u0B41": "u",
    "\u0B42": "oo", "\u0B43": "ri", "\u0B47": "e", "\u0B48": "ai",
    "\u0B4B": "o", "\u0B4C": "au",
  },
  anusvara: {
    "\u0B02": "n", "\u0B01": "n", "\u0B03": "h",
  },
  consonants: {
    "\u0B15": "k", "\u0B16": "kh", "\u0B17": "g", "\u0B18": "gh", "\u0B19": "ng",
    "\u0B1A": "ch", "\u0B1B": "chh", "\u0B1C": "j", "\u0B1D": "jh", "\u0B1E": "ny",
    "\u0B1F": "t", "\u0B20": "th", "\u0B21": "d", "\u0B22": "dh", "\u0B23": "n",
    "\u0B24": "t", "\u0B25": "th", "\u0B26": "d", "\u0B27": "dh", "\u0B28": "n",
    "\u0B2A": "p", "\u0B2B": "ph", "\u0B2C": "b", "\u0B2D": "bh", "\u0B2E": "m",
    "\u0B2F": "y", "\u0B30": "r", "\u0B32": "l", "\u0B35": "v",
    "\u0B36": "sh", "\u0B37": "sh", "\u0B38": "s", "\u0B39": "h",
  },
};

// 2.8 KANNADA SCRIPT
const KANNADA_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0CCD",
  vowels: {
    "\u0C85": "a", "\u0C86": "aa", "\u0C87": "i", "\u0C88": "ee",
    "\u0C89": "u", "\u0C8A": "oo", "\u0C8B": "ri", "\u0C8E": "e",
    "\u0C8F": "ae", "\u0C90": "ai", "\u0C92": "o", "\u0C93": "oo", "\u0C94": "au",
  },
  matras: {
    "\u0CBE": "aa", "\u0CBF": "i", "\u0CC0": "ee", "\u0CC1": "u",
    "\u0CC2": "oo", "\u0CC3": "ri", "\u0CC6": "e", "\u0CC7": "ae",
    "\u0CC8": "ai", "\u0CCA": "o", "\u0CCB": "oo", "\u0CCC": "au",
  },
  anusvara: {
    "\u0C82": "m", "\u0C83": "h",
  },
  consonants: {
    "\u0C95": "k", "\u0C96": "kh", "\u0C97": "g", "\u0C98": "gh", "\u0C99": "ng",
    "\u0C9A": "ch", "\u0C9B": "chh", "\u0C9C": "j", "\u0C9D": "jh", "\u0C9E": "ny",
    "\u0C9F": "t", "\u0CA0": "th", "\u0CA1": "d", "\u0CA2": "dh", "\u0CA3": "n",
    "\u0CA4": "t", "\u0CA5": "th", "\u0CA6": "d", "\u0CA7": "dh", "\u0CA8": "n",
    "\u0CAA": "p", "\u0CAB": "ph", "\u0CAC": "b", "\u0CAD": "bh", "\u0CAE": "m",
    "\u0CAF": "y", "\u0CB0": "r", "\u0CB2": "l", "\u0CB5": "v",
    "\u0CB6": "sh", "\u0CB7": "sh", "\u0CB8": "s", "\u0CB9": "h",
  },
};

// 2.9 MALAYALAM SCRIPT
const MALAYALAM_MAP: ScriptPhoneticMap = {
  inherentVowel: "a",
  virama: "\u0D4D",
  vowels: {
    "\u0D05": "a", "\u0D06": "aa", "\u0D07": "i", "\u0D08": "ee",
    "\u0D09": "u", "\u0D0A": "oo", "\u0D0B": "ri", "\u0D0E": "e",
    "\u0D0F": "ae", "\u0D10": "ai", "\u0D12": "o", "\u0D13": "oo", "\u0D14": "au",
  },
  matras: {
    "\u0D3E": "aa", "\u0D3F": "i", "\u0D40": "ee", "\u0D41": "u",
    "\u0D42": "oo", "\u0D43": "ri", "\u0D46": "e", "\u0D47": "ae",
    "\u0D48": "ai", "\u0D4A": "o", "\u0D4B": "oo", "\u0D4C": "au",
  },
  anusvara: {
    "\u0D02": "m", "\u0D03": "h",
  },
  consonants: {
    "\u0D15": "k", "\u0D16": "kh", "\u0D17": "g", "\u0D18": "gh", "\u0D19": "ng",
    "\u0D1A": "ch", "\u0D1B": "chh", "\u0D1C": "j", "\u0D1D": "jh", "\u0D1E": "ny",
    "\u0D1F": "t", "\u0D20": "th", "\u0D21": "d", "\u0D22": "dh", "\u0D23": "n",
    "\u0D24": "t", "\u0D25": "th", "\u0D26": "d", "\u0D27": "dh", "\u0D28": "n",
    "\u0D2A": "p", "\u0D2B": "ph", "\u0D2C": "b", "\u0D2D": "bh", "\u0D2E": "m",
    "\u0D2F": "y", "\u0D30": "r", "\u0D32": "l", "\u0D35": "v",
    "\u0D36": "sh", "\u0D37": "sh", "\u0D38": "s", "\u0D39": "h",
    "\u0D34": "zh", "\u0D33": "l", "\u0D31": "r",
  },
};

// ============================================================================
// 3. CORE TRANSLITERATION FUNCTIONS
// ============================================================================

/**
 * Resolves the appropriate phonetic map based on language code or character codes
 */
function resolveScriptMap(lang: string, sampleText: string): { map: ScriptPhoneticMap | null; script: string } {
  // Check Devanagari range (U+0900 - U+097F)
  if (/[\u0900-\u097F]/.test(sampleText)) {
    return { map: DEVANAGARI_MAP, script: "Devanagari" };
  }
  // Check Bengali-Assamese range (U+0980 - U+09FF)
  if (/[\u0980-\u09FF]/.test(sampleText)) {
    // If language is Assamese, inherent vowel is 'o' and distinctive characters apply
    const isAssamese = lang === "as" || /[\u09F0\u09F1]/.test(sampleText);
    return {
      map: {
        ...BENGALI_ASSAMESE_MAP,
        inherentVowel: isAssamese ? "o" : "o",
      },
      script: isAssamese ? "Assamese" : "Bengali",
    };
  }
  // Check Tamil range (U+0B80 - U+0BFF)
  if (/[\u0B80-\u0BFF]/.test(sampleText)) {
    return { map: TAMIL_MAP, script: "Tamil" };
  }
  // Check Telugu range (U+0C00 - U+0C7F)
  if (/[\u0C00-\u0C7F]/.test(sampleText)) {
    return { map: TELUGU_MAP, script: "Telugu" };
  }
  // Check Gujarati range (U+0A80 - U+0AFF)
  if (/[\u0A80-\u0AFF]/.test(sampleText)) {
    return { map: GUJARATI_MAP, script: "Gujarati" };
  }
  // Check Gurmukhi range (U+0A00 - U+0A7F)
  if (/[\u0A00-\u0A7F]/.test(sampleText)) {
    return { map: GURMUKHI_MAP, script: "Gurmukhi" };
  }
  // Check Odia range (U+0B00 - U+0B7F)
  if (/[\u0B00-\u0B7F]/.test(sampleText)) {
    return { map: ODIA_MAP, script: "Odia" };
  }
  // Check Kannada range (U+0C80 - U+0CFF)
  if (/[\u0C80-\u0CFF]/.test(sampleText)) {
    return { map: KANNADA_MAP, script: "Kannada" };
  }
  // Check Malayalam range (U+0D00 - U+0D7F)
  if (/[\u0D00-\u0D7F]/.test(sampleText)) {
    return { map: MALAYALAM_MAP, script: "Malayalam" };
  }

  return { map: null, script: "Unknown" };
}

/**
 * Transliterates an Indic word using character-by-character akshara parsing.
 */
function transliterateIndicWord(word: string, map: ScriptPhoneticMap, lang: string): string {
  let result = "";
  const chars = Array.from(word);
  const len = chars.length;

  for (let i = 0; i < len; i++) {
    const ch = chars[i];
    const nextCh = i + 1 < len ? chars[i + 1] : "";

    // 1. Independent Vowel
    if (map.vowels[ch]) {
      result += map.vowels[ch];
      continue;
    }

    // 2. Anusvara / Visarga / Chandrabindu
    if (map.anusvara[ch]) {
      result += map.anusvara[ch];
      continue;
    }

    // 3. Consonants
    if (map.consonants[ch]) {
      const cons = map.consonants[ch];
      result += cons;

      // Check next character:
      // If next is virama (halant), do NOT add inherent vowel
      if (nextCh === map.virama) {
        i++; // skip virama
        continue;
      }

      // If next is a dependent vowel sign (matra), apply the matra and skip it
      if (nextCh && map.matras[nextCh]) {
        result += map.matras[nextCh];
        i++; // skip matra
        continue;
      }

      // If next is an anusvara, inherent vowel is kept: e.g. കം -> kam
      // If this is the last character of a multi-syllable word in Hindi/Marathi:
      // apply schwa deletion rule (unless Sanskrit or single consonant)
      const isWordEnd = i === len - 1 || !/[\u0900-\u0D7F]/.test(nextCh);
      if (isWordEnd) {
        if (lang === "hi" || lang === "mr" || lang === "bho" || lang === "mai" || lang === "raj") {
          // In modern Hindi, final consonant without virama drops the 'a' if word length > 1
          if (len > 1 && chars[i - 1] && !map.matras[chars[i - 1]]) {
            // schwa dropped e.g. 'काम' -> 'Kaam'
            continue;
          }
        }
        if (lang === "as" || lang === "bn") {
          // In Assamese/Bengali, final consonants in multi-letter words often drop inherent 'o':
          // e.g., 'নমস্কাৰ' ends in pure 'r', 'টকা' ends in matra 'aa'.
          if (len > 2 && ch === "\u09F0" || ch === "\u09B0" || ch === "\u09A4" || ch === "\u09B2") {
            continue;
          }
        }
      }

      // Add inherent vowel (e.g. 'a' in Hindi/Tamil, 'o' in Assamese/Bengali)
      result += map.inherentVowel;
      continue;
    }

    // 4. Fallback for untranslated punctuation, digits, or foreign letters
    result += ch;
  }

  // Capitalize first letter of capitalized or standalone word
  if (result.length > 0) {
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}

/**
 * Transliterates Perso-Arabic text (Urdu, Kashmiri) using word patterns
 */
function transliteratePersoArabic(text: string): string {
  const urduWords: Record<string, string> = {
    "سلام": "Salam",
    "آداب": "Aadaab",
    "شکریہ": "Shukriya",
    "آپ": "Aap",
    "کیسے": "kaise",
    "ہیں": "hain",
    "میں": "Main",
    "ٹھیک": "theek",
    "ہوں": "hoon",
    "کام": "kaam",
    "دکان": "dukaan",
    "خوش": "khush",
    "آمدید": "aamdeed",
    "مہربانی": "meherbani",
    "الوداع": "alvida",
  };

  const tokens = text.split(/(\s+|[.,!?;:،۔])/);
  return tokens
    .map((token) => urduWords[token.trim()] || token)
    .join("");
}

/**
 * Main public transliteration entry point.
 * Converts native script text into English/Roman pronunciation.
 */
export function transliterateToLatin(text: string, language: string): string {
  if (!text || !text.trim()) return "";

  // English doesn't need transliteration
  if (language === "en") return text;

  // 1. Check phrase-level gold dictionary first
  const langDict = PHRASE_DICTIONARY[language];
  const trimmed = text.trim();
  if (langDict && langDict[trimmed]) {
    return langDict[trimmed];
  }

  // 2. Perso-Arabic script check
  if (/[\u0600-\u06FF]/.test(text)) {
    return transliteratePersoArabic(text);
  }

  // 3. Script Map Resolution for Indic scripts
  const { map, script } = resolveScriptMap(language, text);
  if (!map) {
    // If no Indic script detected (e.g. Roman/Latin already), return trimmed text
    return text;
  }

  // Tokenize preserving whitespace, punctuation, and entities
  const tokens = text.split(/(\[\[ENTITY_[A-Z0-9_]+\]\]|\s+|[।.,!?;:—"()]+)/g);

  const transliteratedTokens = tokens.map((token) => {
    if (!token || token.trim().length === 0) return token;
    // Keep entity placeholders like [[ENTITY_PHONE_0]] untouched
    if (/^\[\[ENTITY_[A-Z0-9_]+\]\]$/.test(token)) return token;
    // Keep numbers and punctuation untouched
    if (/^[0-9।.,!?;:—"()\-]+$/.test(token)) return token;

    // Check phrase/word dictionary for this single token
    if (langDict && langDict[token]) {
      return langDict[token];
    }

    // Algorithmic syllabic transliteration
    return transliterateIndicWord(token, map, language);
  });

  return transliteratedTokens.join("");
}

/**
 * Transliterates text and returns full structured diagnostic metadata.
 */
export function getTransliterationDetails(text: string, language: string): TransliterationResult {
  const transliteration = transliterateToLatin(text, language);
  const { script } = resolveScriptMap(language, text);
  const isAvailable = transliteration.length > 0 && transliteration !== text;

  return {
    text,
    transliteration,
    sourceLanguage: language,
    isAvailable: language === "en" ? true : isAvailable,
    scriptDetected: script,
  };
}
