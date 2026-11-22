export const SUPPORTED_LOCALES = [
  "en",
  "hi",
  "as",
  "bn",
  "or",
  "pa",
  "gu",
  "mr",
  "ur",
  "ta",
  "te",
  "kn",
  "ml",
  "ne",
  "brx",
  "mni",
  "ks",
  "sa",
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export type TextDirection = "ltr" | "rtl";

export interface LocaleMetadata {
  code: AppLocale;
  name: string;
  nativeName: string;
  greeting: string;
  direction: TextDirection;
  script: string;
  region: string;
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
  simplifiedTerms: SimplifiedTermsTranslations;
  accessibility: AccessibilityTranslations;
  actions: ActionTranslations;
}
