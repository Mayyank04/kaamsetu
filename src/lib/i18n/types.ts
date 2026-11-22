/**
 * KAAMSETU — Multilingual Architecture & Localization Types
 * Supports 39 Languages: 22 Eighth Schedule + 16 Regional Indian Varieties + English Fallback.
 * Conforms to Official Linguistic Classifications, ISO 639-1 / 639-3, and BCP 47 standards.
 */

export const EIGHTH_SCHEDULE_LOCALES = [
  "as",  // Assamese (অসমীয়া)
  "bn",  // Bengali (বাংলা)
  "brx", // Bodo (बड़ो)
  "doi", // Dogri (डोगरी)
  "gu",  // Gujarati (ગુજરાતી)
  "hi",  // Hindi (हिन्दी)
  "kn",  // Kannada (ಕನ್ನಡ)
  "ks",  // Kashmiri (کٲشُر) - RTL
  "kok", // Konkani (कोंकणी)
  "mai", // Maithili (मैथिली)
  "ml",  // Malayalam (മലയാളം)
  "mni", // Manipuri / Meitei (মৈতৈলোন্)
  "mr",  // Marathi (मराठी)
  "ne",  // Nepali (नेपाली)
  "or",  // Odia (ଓଡ଼ିଆ)
  "pa",  // Punjabi (ਪੰਜਾਬੀ)
  "sa",  // Sanskrit (संस्कृतम्)
  "sat", // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  "sd",  // Sindhi (سنڌي) - RTL
  "ta",  // Tamil (தமிழ்)
  "te",  // Telugu (తెలుగు)
  "ur",  // Urdu (اردو) - RTL
] as const;

export const REGIONAL_LOCALES = [
  "bho", // Bhojpuri (भोजपुरी)
  "raj", // Rajasthani (राजस्थानी)
  "hne", // Chhattisgarhi (छत्तीसगढ़ी)
  "bgc", // Haryanvi (हरियाणवी)
  "tcy", // Tulu (ತುಳು)
  "kha", // Khasi (Ka Ktien Khasi)
  "grt", // Garo (A·chik)
  "lus", // Mizo (Mizo ṭawng)
  "trp", // Kokborok (Kokborok)
  "anp", // Angika (अंगिका)
  "mag", // Magahi (मगही)
  "gbm", // Garhwali (गढ़वळि)
  "kfy", // Kumaoni (कुमाऊँनी)
  "bhb", // Bhili (भीली)
  "hoc", // Ho (ᱦᱳ)
  "unr", // Mundari (ᱢᱩᱱᱰᱟᱨᱤ)
] as const;

export const SUPPORTED_LOCALES = [
  "en", // English (Global / Federal Fallback)
  ...EIGHTH_SCHEDULE_LOCALES,
  ...REGIONAL_LOCALES,
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export type TextDirection = "ltr" | "rtl";

export type LocaleSchedule = "eighth_schedule" | "regional" | "federal_fallback";

export interface LocaleMetadata {
  code: AppLocale;
  name: string;
  nativeName: string;
  greeting: string;
  direction: TextDirection;
  script: string;
  region: string;
  schedule: LocaleSchedule;
  isOfficial8thSchedule: boolean;
  coveragePercent: number;
}

export interface HeaderTranslations {
  bannerTitle: string;
  bannerSub: string;
  controlledNotice: string;
  home: string;
  findProfessionals: string;
  howItWorks: string;
  contractorPro: string;
  institutions: string;
  about: string;
  signIn: string;
  register: string;
  myWorkspace: string;
  logout: string;
  vendorHub?: string;
}

export interface HomeTranslations {
  heroPill: string;
  heroTitle: string;
  heroSubtitle: string;
  findCraftspersonBtn: string;
  createProfileBtn: string;
  zeroCommissionHeading: string;
  zeroCommissionDesc: string;
  fivePillarsTitle: string;
  operatingRegionsTitle: string;
  operatingRegionsDesc: string;
}

export interface ExploreTranslations {
  pageTitle: string;
  pageSubtitle: string;
  searchPlaceholder: string;
  allListings: string;
  serviceProfessionals: string;
  vendorsAndArtisans: string;
  stateFilter: string;
  districtFilter: string;
  filterResults: string;
  resetFilters: string;
  verifiedArtisansFound: string;
  noResults: string;
}

export interface VendorTranslations {
  businessName: string;
  stallType: string;
  mobileCart: string;
  fixedStall: string;
  homeWorkshop: string;
  kiosk: string;
  operatingHours: string;
  deliveryAvailable: string;
  productsOffered: string;
  contactStall: string;
  inStock: string;
}

export interface OnboardingTranslations {
  title: string;
  subtitle: string;
  stepIndicator: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  step7: string;
  step8: string;
  step9: string;
  step10: string;
  step11: string;
  step12: string;
  nameLabel: string;
  namePlaceholder: string;
  stateLabel: string;
  stateSelectPlaceholder: string;
  districtLabel: string;
  districtSelectPlaceholder: string;
  cityVillageLabel: string;
  cityVillagePlaceholder: string;
  workTypeLabel: string;
  tradeLabel: string;
  skillsLabel: string;
  skillsPlaceholder: string;
  experienceLabel: string;
  experienceYears: string;
  contactLabel: string;
  phoneHint: string;
  photoLabel: string;
  photoOptional: string;
  reviewTitle: string;
  saveProfileBtn: string;
  nextBtn: string;
  backBtn: string;
  saveDraftBtn: string;
  draftSavedNotice: string;
  voiceModeToggle: string;
  guidedModeToggle: string;
  successTitle: string;
  successDesc: string;
  viewProfileBtn: string;
}

export interface ProfileTranslations {
  trustProtocol: string;
  activeVerified: string;
  scanQr: string;
  shareProfile: string;
  copied: string;
  yearsExperience: string;
  verifiedSkills: string;
  selfDeclared: string;
  institutionalAssessment: string;
  dailyRate: string;
  sendEnquiry: string;
  bookService: string;
  workHistory: string;
  customerReviews: string;
  portfolio: string;
  noWorkHistory: string;
  noReviews: string;
  noPortfolio: string;
  sovereignTrustCard: string;
  w3cCredential: string;
  kaamScoreTrust: string;
  privacyNotice: string;
  backToExplore: string;
}

export interface DashboardTranslations {
  title: string;
  welcome: string;
  completion: string;
  publicVisibility: string;
  visible: string;
  hidden: string;
  tabDashboard: string;
  tabProfile: string;
  tabSkills: string;
  tabOpportunities: string;
  tabBookings: string;
  tabPortfolio: string;
  tabCredentials: string;
  tabEarnings: string;
  tabNotifications: string;
  tabSettings: string;
  editProfile: string;
  viewPublicProfile: string;
  zeroCommissionNote: string;
  pendingInvitations: string;
  upcomingBookings: string;
  recentReviews: string;
  emptyOpportunities: string;
  emptyBookings: string;
  emptyNotifications: string;
}

export interface VoiceTranslations {
  assistantTitle: string;
  assistantSubtitle: string;
  startListening: string;
  listening: string;
  processing: string;
  detectedLanguage: string;
  transcription: string;
  extractedFields: string;
  confirmToApply: string;
  applyToForm: string;
  tryAgain: string;
  cancel: string;
  unsupportedNotice: string;
  permissionDenied: string;
  examplePrompt: string;
}

export interface VendorDashboardTranslations {
  dashboardTitle: string;
  businessOverview: string;
  storeDetails: string;
  productCatalog: string;
  operatingHours: string;
  deliveryRadius: string;
  inquiries: string;
  addProduct: string;
  emptyCatalog: string;
  emptyInquiries: string;
  managePricing: string;
}

export interface CategoriesTranslations {
  homeRepair: string;
  construction: string;
  clothing: string;
  foodHospitality: string;
  transport: string;
  retailShops: string;
  agriculture: string;
  education: string;
  artisanTradition: string;
  healthWellness: string;
  eventsServices: string;
}

export interface LocationTranslations {
  country: string;
  state: string;
  district: string;
  subdistrict: string;
  cityTownVillage: string;
  locality: string;
  pincode: string;
  selectState: string;
  selectDistrict: string;
  selectSubdistrict: string;
  enterLocality: string;
  enterPincode: string;
  pincodeValid: string;
  pincodeInvalid: string;
  controlledRolloutNote: string;
}

export interface SimplifiedTermsTranslations {
  createProfile: string;
  chooseWork: string;
  verifySkills: string;
  findWorker: string;
  registerWorker: string;
  paymentHistory: string;
  chooseArea: string;
}

export interface AccessibilityTranslations {
  languageSelector: string;
  textSizeNormal: string;
  textSizeLarge: string;
  contrastHigh: string;
  switchLanguage: string;
}

export interface ActionTranslations {
  save: string;
  cancel: string;
  submit: string;
  viewProfile: string;
  contact: string;
  bookService: string;
  loading: string;
  retry: string;
  back: string;
  edit: string;
}

export interface TranslationDictionary {
  locale: AppLocale;
  languageName: string;
  nativeName: string;
  greeting: string;
  direction: TextDirection;
  header: HeaderTranslations;
  home: HomeTranslations;
  explore: ExploreTranslations;
  vendor: VendorTranslations;
  onboarding: OnboardingTranslations;
  profile?: ProfileTranslations;
  dashboard?: DashboardTranslations;
  voice?: VoiceTranslations;
  vendorDashboard?: VendorDashboardTranslations;
  categories?: CategoriesTranslations;
  location?: LocationTranslations;
  simplifiedTerms: SimplifiedTermsTranslations;
  accessibility: AccessibilityTranslations;
  actions: ActionTranslations;
}
