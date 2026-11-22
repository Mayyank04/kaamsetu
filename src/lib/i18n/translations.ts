/**
 * KAAMSETU — Centralized Translation Repository for 39 Languages
 * 22 Eighth Schedule Languages + 16 Regional Varieties + English Fallback.
 * Built with full dictionary completeness, fallback safety, and RTL support.
 */

import { AppLocale, TranslationDictionary } from "./types";
import { ALL_LOCALES_METADATA, SUPPORTED_LOCALES_METADATA } from "./registry";
import { createLocaleDictionary } from "./dictionary-factory";
import { en } from "./locales/en";
import { hi } from "./locales/hi";

// Existing locale objects
import { as as rawAs } from "./locales/as";
import { bn as rawBn } from "./locales/bn";
import { or as rawOr } from "./locales/or";
import { pa as rawPa } from "./locales/pa";
import { gu as rawGu } from "./locales/gu";
import { mr as rawMr } from "./locales/mr";
import { ur as rawUr } from "./locales/ur";
import { ta as rawTa } from "./locales/ta";
import { te as rawTe } from "./locales/te";
import { kn as rawKn } from "./locales/kn";
import { ml as rawMl } from "./locales/ml";
import { ne as rawNe } from "./locales/ne";
import { brx as rawBrx } from "./locales/brx";
import { mni as rawMni } from "./locales/mni";
import { ks as rawKs } from "./locales/ks";
import { sa as rawSa } from "./locales/sa";

export * from "./types";
export * from "./registry";

export const DEFAULT_LOCALE: AppLocale = "en";

// Upgrade existing locales with full dictionary completeness
const asDict = createLocaleDictionary("as", rawAs as any, "hi");
const bnDict = createLocaleDictionary("bn", rawBn as any, "hi");
const orDict = createLocaleDictionary("or", rawOr as any, "hi");
const paDict = createLocaleDictionary("pa", rawPa as any, "hi");
const guDict = createLocaleDictionary("gu", rawGu as any, "hi");
const mrDict = createLocaleDictionary("mr", rawMr as any, "hi");
const urDict = createLocaleDictionary("ur", { ...(rawUr as any), direction: "rtl" }, "hi");
const taDict = createLocaleDictionary("ta", rawTa as any, "en");
const teDict = createLocaleDictionary("te", rawTe as any, "en");
const knDict = createLocaleDictionary("kn", rawKn as any, "en");
const mlDict = createLocaleDictionary("ml", rawMl as any, "en");
const neDict = createLocaleDictionary("ne", rawNe as any, "hi");
const brxDict = createLocaleDictionary("brx", rawBrx as any, "hi");
const mniDict = createLocaleDictionary("mni", rawMni as any, "hi");
const ksDict = createLocaleDictionary("ks", { ...(rawKs as any), direction: "rtl" }, "hi");
const saDict = createLocaleDictionary("sa", rawSa as any, "hi");

// Construct remaining 8th Schedule Languages (doi, kok, mai, sat, sd)
const doiDict = createLocaleDictionary("doi", {
  header: {
    bannerTitle: "प्रत्यक्ष कामगार पन्छान मंच",
    bannerSub: "कारीगर दी कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर लब्भो",
    register: "प्रोफ़ाइल बनाओ",
    logout: "लॉग आउट",
  },
  home: {
    heroTitle: "हर हुनर गी सम्मान मिलना चाहिदा, डिग्री दे बिना बी।",
    findCraftspersonBtn: "सत्यापित कामगार लब्भो",
  },
}, "hi");

const kokDict = createLocaleDictionary("kok", {
  header: {
    bannerTitle: "थेट कामगार वळख माची",
    bannerSub: "कारीगरांच्या कमाईचेर 0% कमिशन",
    home: "घर",
    findProfessionals: "कारीगर सोदा",
    register: "प्रोफायल तयार करात",
  },
  home: {
    heroTitle: "दर एका हुशारक मान मेळंक जाय, पदवी नासतना लेगीत।",
    findCraftspersonBtn: "सत्यापित कामगार सोदा",
  },
}, "hi");

const maiDict = createLocaleDictionary("mai", {
  header: {
    bannerTitle: "प्रत्यक्ष कामगार पहचान मंच",
    bannerSub: "कारीगर के कमाई पर शून्य कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजू",
    register: "प्रोफ़ाइल बनाऊ",
  },
  home: {
    heroTitle: "हर हुनर के सम्मान भेटबाक चाही, डिग्री के बिना सेहो।",
    findCraftspersonBtn: "प्रमाणित कामगार खोजू",
  },
}, "hi");

const satDict = createLocaleDictionary("sat", {
  header: {
    bannerTitle: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱩᱯᱨᱩᱢ ᱢᱟᱰᱮᱨ",
    bannerSub: "᱐% ᱠᱚᱢᱤᱥᱚᱱ",
    home: "ᱚᱲᱟᱜ",
    findProfessionals: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱯᱟᱱᱛᱮ",
    register: "ᱯᱨᱳᱯᱷᱟᱭᱤᱞ ᱵᱮᱱᱟᱣ",
  },
  home: {
    heroTitle: "ᱡᱚᱛᱚ ᱦᱩᱱᱟᱹᱨ ᱢᱟᱱ ᱧᱟᱢ ᱞᱟᱹᱠᱛᱤ, ᱰᱤᱜᱽᱨᱤ ᱵᱮᱜᱚᱨ ᱦᱚᱸ᱾",
    findCraftspersonBtn: "ᱯᱟᱹᱨᱛᱩᱲ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱯᱟᱱᱛᱮ",
  },
}, "hi");

const sdDict = createLocaleDictionary("sd", {
  direction: "rtl",
  header: {
    bannerTitle: "ڪارگر سڃاڻپ پليٽ فارم",
    bannerSub: "مفت رجسٽريشن ۽ 0% ڪميشن",
    home: "گھر",
    findProfessionals: "ڪاريگر ڳوليو",
    register: "پروفائل ٺاهيو",
  },
  home: {
    heroTitle: "هر هنر کي عزت ملڻ گهرجي، بغير ڪنهن ڊگري جي.",
  },
}, "hi");

// Construct 16 Regional Varieties
const bhoDict = createLocaleDictionary("bho", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर के कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजीं",
    register: "प्रोफ़ाइल बनाईं",
    logout: "लॉग आउट",
  },
  home: {
    heroTitle: "हर हुनर के सम्मान मिले के चाहीं, डिग्री के बिना भी।",
    findCraftspersonBtn: "सत्यापित कामगार खोजीं",
  },
}, "hi");

const rajDict = createLocaleDictionary("raj", {
  header: {
    bannerTitle: "सीधो कामगार पहचान मंच",
    bannerSub: "कारीगर री कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर ढूँढो",
    register: "प्रोफ़ाइल बणाओ",
  },
  home: {
    heroTitle: "हर हुनर ने मान मिलणो चाहिजे, डिग्री रे बिना भी।",
    findCraftspersonBtn: "सत्यापित कारीगर ढूँढो",
  },
}, "hi");

const hneDict = createLocaleDictionary("hne", {
  header: {
    bannerTitle: "सोज्झो कामगार पहिचान मंच",
    bannerSub: "कारीगर के कमाई म 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजव",
    register: "प्रोफ़ाइल बनावव",
  },
  home: {
    heroTitle: "हर हुनर ला सम्मान मिलना चाही, डिग्री के बिना घलो।",
    findCraftspersonBtn: "सत्यापित कामगार खोजव",
  },
}, "hi");

const bgcDict = createLocaleDictionary("bgc", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर की कमाई पे 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर टोहवो",
    register: "प्रोफ़ाइल बणाओ",
  },
  home: {
    heroTitle: "हर हुनर नै आदर मिलणा चाहिए, डिग्री बिना भी।",
    findCraftspersonBtn: "सत्यापित कामगार टोहवो",
  },
}, "hi");

const tcyDict = createLocaleDictionary("tcy", {
  header: {
    bannerTitle: "ನೇರ ಬೇಲೆದಾರೆರೆ ಗುರ್ತ",
    bannerSub: "0% ಕಮಿಷನ್",
    home: "ಇಲ್ಲ",
    findProfessionals: "ಬೇಲೆದಾರೆರೆನ್ ನಾಡಲೆ",
    register: "ಪ್ರೊಫೈಲ್ ಮಲ್ಪುಲೆ",
  },
  home: {
    heroTitle: "ಪ್ರತಿ ಪ್ರತಿಭೆಗ್ ಗೌರವ ತಿಕ್ಕೊಡು, ಪದವಿ ಇದ್ಯಾಂಡಲಾ.",
  },
}, "en");

const khaDict = createLocaleDictionary("kha", {
  header: {
    bannerTitle: "Ka Rynsan Jingithuh Nongtrei",
    bannerSub: "Kcommission 0% na ka kamai ki nongtrei",
    controlledNotice: "Shillong & Guwahati Urban Pilot",
    home: "Ing",
    findProfessionals: "Wad ki nongtrei ba tbit",
    register: "Pynrung kyrteng",
    myWorkspace: "Ka kam jong nga",
    logout: "Mih noh",
  },
  home: {
    heroTitle: "Man ka sap ka dei ban ioh jingithuh, wat lada ym don degree.",
    heroSubtitle: "KAAMSETU ka pyniasoh ia ki nongshna tiar, ki nongtrei kti bad ki nongdie dukan ha Shillong bad kylleng ka ri khlem kano kano ka commission.",
    findCraftspersonBtn: "Wad ki nongtrei ba la dep pynskhem",
    createProfileBtn: "Pynrung ia ka sap jong me",
  },
  actions: {
    save: "Kynshew",
    cancel: "Pynsangeh",
    submit: "Phah",
    viewProfile: "Peit ia ka profile",
    contact: "Iakren",
    bookService: "Khnium kam",
    loading: "Dang trei...",
    retry: "Pyrshang biang",
    back: "Sha dien",
    edit: "Pynkylla",
  },
}, "en");

const grtDict = createLocaleDictionary("grt", {
  header: {
    bannerTitle: "Kam Ka·giparangko U·iani Platform",
    bannerSub: "0% Commission",
    home: "Nok",
    findProfessionals: "Kam changgiparangko sandibo",
    register: "Profile bikotbo",
  },
  home: {
    heroTitle: "Pilak changa-sapan bakskanko mande ra·na nanga, degree grioba.",
    findCraftspersonBtn: "Kam changgiparangko sandibo",
  },
}, "en");

const lusDict = createLocaleDictionary("lus", {
  header: {
    bannerTitle: "Hnathawktute Hriatpuina",
    bannerSub: "0% Commission",
    home: "In",
    findProfessionals: "Hnathawk thiam zawng rawh",
    register: "Profile siam rawh",
  },
  home: {
    heroTitle: "Thiamna zawng zawng hian chawimawi an phu, lehkha thiamna sang awm lo pawhin.",
  },
}, "en");

const trpDict = createLocaleDictionary("trp", {
  header: {
    bannerTitle: "Samung Tangnai Rog Sinimung",
    bannerSub: "0% Commission",
    home: "Nok",
    findProfessionals: "Tangnai rog nai di",
    register: "Profile khulai di",
  },
  home: {
    heroTitle: "Joto gwnang mung no man rwmano nanggo, degree kiphla bo.",
  },
}, "en");

const anpDict = createLocaleDictionary("anp", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर के कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजो",
    register: "प्रोफ़ाइल बनाबो",
  },
  home: {
    heroTitle: "सब हुनर के सम्मान मिलना चाही, बिना डिग्री के भी।",
  },
}, "hi");

const magDict = createLocaleDictionary("mag", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर के कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजी",
    register: "प्रोफ़ाइल बनावी",
  },
  home: {
    heroTitle: "हर हुनर के सम्मान मिले के चाही, डिग्री के बिना भी।",
  },
}, "hi");

const gbmDict = createLocaleDictionary("gbm", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर की कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजा",
    register: "प्रोफ़ाइल बणावा",
  },
  home: {
    heroTitle: "हर हुनर तैं मान मिलण चैंद, बिना डिग्री का भी।",
  },
}, "hi");

const kfyDict = createLocaleDictionary("kfy", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर की कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर खोजो",
    register: "प्रोफ़ाइल बणाओ",
  },
  home: {
    heroTitle: "हर हुनर कें मान मिलण चै, डिग्री बिना भी।",
  },
}, "hi");

const bhbDict = createLocaleDictionary("bhb", {
  header: {
    bannerTitle: "सीधा कामगार पहचान मंच",
    bannerSub: "कारीगर री कमाई पर 0% कमीशन",
    home: "घर",
    findProfessionals: "कारीगर ढूंढो",
    register: "प्रोफ़ाइल बणावो",
  },
  home: {
    heroTitle: "हरेक हुनर ने आदर मळवो जोयजे, डिग्री वगर पण।",
  },
}, "hi");

const hocDict = createLocaleDictionary("hoc", {
  header: {
    bannerTitle: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱩᱯᱨᱩᱢ ᱢᱟᱰᱮᱨ",
    bannerSub: "᱐% ᱠᱚᱢᱤᱥᱚᱱ",
    home: "ᱚᱲᱟᱜ",
    findProfessionals: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱯᱟᱱᱛᱮ",
    register: "ᱯᱨᱳᱯᱷᱟᱭᱤᱞ ᱵᱮᱱᱟᱣ",
  },
  home: {
    heroTitle: "ᱥᱟᱱᱟᱢ ᱦᱩᱱᱟᱹᱨ ᱢᱟᱱ ᱧᱟᱢ ᱞᱟᱹᱠᱛᱤ, ᱰᱤᱜᱽᱨᱤ ᱵᱮᱜᱚᱨ ᱦᱚᱸ᱾",
  },
}, "hi");

const unrDict = createLocaleDictionary("unr", {
  header: {
    bannerTitle: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱩᱯᱨᱩᱢ ᱢᱟᱰᱮᱨ",
    bannerSub: "᱐% ᱠᱚᱢᱤᱥᱚᱱ",
    home: "ᱚᱲᱟᱜ",
    findProfessionals: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱯᱟᱱᱛᱮ",
    register: "ᱯᱨᱳᱯᱷᱟᱭᱤᱞ ᱵᱮᱱᱟᱣ",
  },
  home: {
    heroTitle: "ᱡᱚᱛᱚ ᱦᱩᱱᱟᱹᱨ ᱢᱟᱱ ᱧᱟᱢ ᱞᱟᱹᱠᱛᱤ, ᱰᱤᱜᱽᱨᱤ ᱵᱮᱜᱚᱨ ᱦᱚᱸ᱾",
  },
}, "hi");

// Comprehensive Registry of all 39 Languages
export const APP_TRANSLATIONS: Record<AppLocale, TranslationDictionary> = {
  // 1. Federal Fallback
  en,

  // 2. 22 Eighth Schedule
  as: asDict,
  bn: bnDict,
  brx: brxDict,
  doi: doiDict,
  gu: guDict,
  hi,
  kn: knDict,
  ks: ksDict,
  kok: kokDict,
  mai: maiDict,
  ml: mlDict,
  mni: mniDict,
  mr: mrDict,
  ne: neDict,
  or: orDict,
  pa: paDict,
  sa: saDict,
  sat: satDict,
  sd: sdDict,
  ta: taDict,
  te: teDict,
  ur: urDict,

  // 3. 16 Regional Varieties
  bho: bhoDict,
  raj: rajDict,
  hne: hneDict,
  bgc: bgcDict,
  tcy: tcyDict,
  kha: khaDict,
  grt: grtDict,
  lus: lusDict,
  trp: trpDict,
  anp: anpDict,
  mag: magDict,
  gbm: gbmDict,
  kfy: kfyDict,
  bhb: bhbDict,
  hoc: hocDict,
  unr: unrDict,
};

export function getTranslation(locale: AppLocale): TranslationDictionary {
  return APP_TRANSLATIONS[locale] || APP_TRANSLATIONS[DEFAULT_LOCALE];
}
