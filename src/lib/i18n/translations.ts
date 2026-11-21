export type AppLocale = "en" | "hi" | "as" | "bn";

export interface TranslationDictionary {
  locale: AppLocale;
  languageName: string;
  nativeName: string;
  header: {
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
  };
  home: {
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
  };
  explore: {
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
  };
  vendor: {
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
  };
  actions: {
    save: string;
    cancel: string;
    submit: string;
    viewProfile: string;
    contact: string;
    bookService: string;
    loading: string;
  };
}

export const APP_TRANSLATIONS: Record<AppLocale, TranslationDictionary> = {
  en: {
    locale: "en",
    languageName: "English",
    nativeName: "English",
    header: {
      bannerTitle: "Direct Worker Recognition Platform",
      bannerSub: "Permanent Zero Commission on Artisan Earnings",
      controlledNotice: "Controlled Rollout: Guwahati & Shillong",
      home: "Home",
      findProfessionals: "Find Professionals",
      howItWorks: "How It Works",
      contractorPro: "Contractor Pro",
      institutions: "Institutions",
      about: "About",
      signIn: "Sign In",
      register: "Create Profile",
      myWorkspace: "My Workspace",
      logout: "Sign Out",
    },
    home: {
      heroPill: "Nationwide Digital Craft Registry",
      heroTitle: "Every skill deserves to be seen, even without a degree.",
      heroSubtitle: "KAAMSETU connects India's skilled informal artisans, master craftspeople, and local vendors directly with customers, contractors, and national institutions with zero commission.",
      findCraftspersonBtn: "Find Verified Professionals",
      createProfileBtn: "Register Your Craft",
      zeroCommissionHeading: "Permanent 0% Platform Commission",
      zeroCommissionDesc: "Every rupee earned for labor belongs 100% to the craftsperson or vendor. KAAMSETU charges 0.00 platform fees on artisan wages.",
      fivePillarsTitle: "How KAAMSETU Works Across India",
      operatingRegionsTitle: "Nationwide Identity & Controlled Dispatch",
      operatingRegionsDesc: "Account registration and public discovery are open across all 36 States and Union Territories. Commercial on-demand dispatch is currently verified in Guwahati and Shillong urban pilot zones.",
    },
    explore: {
      pageTitle: "Find Verified Professionals & Local Vendors",
      pageSubtitle: "Browse master craftspeople, licensed technicians, and neighborhood vendors across India.",
      searchPlaceholder: "Search by trade, skill, vendor name, or location...",
      allListings: "All Listings",
      serviceProfessionals: "Service Professionals",
      vendorsAndArtisans: "Local Vendors & Goods",
      stateFilter: "All States",
      districtFilter: "All Districts",
      filterResults: "Filter Results",
      resetFilters: "Reset Filters",
      verifiedArtisansFound: "verified professionals found",
      noResults: "No professionals or vendors match your selected criteria.",
    },
    vendor: {
      businessName: "Business / Stall Name",
      stallType: "Stall Setup",
      mobileCart: "Mobile Cart",
      fixedStall: "Fixed Market Stall",
      homeWorkshop: "Home Workshop",
      kiosk: "Street Kiosk",
      operatingHours: "Operating Hours",
      deliveryAvailable: "Local Delivery Available",
      productsOffered: "Products & Goods",
      contactStall: "Contact Vendor",
      inStock: "In Stock",
    },
    actions: {
      save: "Save Changes",
      cancel: "Cancel",
      submit: "Submit",
      viewProfile: "View Credential",
      contact: "Contact",
      bookService: "Request Booking",
      loading: "Processing...",
    },
  },

  hi: {
    locale: "hi",
    languageName: "Hindi",
    nativeName: "हिन्दी",
    header: {
      bannerTitle: "प्रत्यक्ष कामगार पहचान मंच",
      bannerSub: "कारीगर की कमाई पर हमेशा 0% कमीशन",
      controlledNotice: "नियंत्रित संचालन: गुवाहाटी एवं शिलांग",
      home: "होम",
      findProfessionals: "कारीगर खोजें",
      howItWorks: "यह कैसे काम करता है",
      contractorPro: "ठेकेदार प्रो",
      institutions: "संस्थान",
      about: "परिचय",
      signIn: "लॉग इन",
      register: "पहचान पत्र बनाएं",
      myWorkspace: "मेरा कार्यस्थल",
      logout: "लॉग आउट",
    },
    home: {
      heroPill: "राष्ट्रव्यापी डिजिटल कारीगर रजिस्ट्री",
      heroTitle: "हर हुनर की कद्र है, बिना डिग्री के भी।",
      heroSubtitle: "कामसेतु भारत के कुशल अनौपचारिक कारीगरों, तकनीशियनों और छोटे विक्रेताओं को सीधे ग्राहकों और ठेकेदारों से जोड़ता है — बिना किसी बिचौलिए या कमीशन के।",
      findCraftspersonBtn: "सत्यापित कारीगर खोजें",
      createProfileBtn: "अपना हुनर दर्ज करें",
      zeroCommissionHeading: "स्थायी 0% मंच कमीशन",
      zeroCommissionDesc: "मजदूरी का एक-एक रुपया शत-प्रतिशत कारीगर या विक्रेता का है। कामसेतु मजदूरी पर शून्य कमीशन लेता है।",
      fivePillarsTitle: "कामसेतु कैसे काम करता है",
      operatingRegionsTitle: "देशव्यापी पहचान एवं स्थानीय संचालन",
      operatingRegionsDesc: "पहचान पत्र और खोज सभी 36 राज्यों व केंद्र शासित प्रदेशों में उपलब्ध है। तत्काल बुकिंग वर्तमान में गुवाहाटी और शिलांग में प्रमाणित है।",
    },
    explore: {
      pageTitle: "सत्यापित कारीगर एवं स्थानीय विक्रेता खोजें",
      pageSubtitle: "भारत भर के हुनरमंद कारीगरों, तकनीशियनों और स्थानीय विक्रेताओं की सूची देखें।",
      searchPlaceholder: "काम, हुनर, विक्रेता या शहर से खोजें...",
      allListings: "सभी सूचियां",
      serviceProfessionals: "सेवा कारीगर",
      vendorsAndArtisans: "स्थानीय विक्रेता एवं सामान",
      stateFilter: "सभी राज्य",
      districtFilter: "सभी जिले",
      filterResults: "फिल्टर करें",
      resetFilters: "रीसेट करें",
      verifiedArtisansFound: "सत्यापित पेशेवर उपलब्ध",
      noResults: "आपकी खोज के अनुसार कोई कारीगर या विक्रेता नहीं मिला।",
    },
    vendor: {
      businessName: "दुकान / स्टॉल का नाम",
      stallType: "स्टॉल का प्रकार",
      mobileCart: "सचल ठेला",
      fixedStall: "स्थायी दुकान / स्टॉल",
      homeWorkshop: "घरेलू कार्यशाला",
      kiosk: "कियोस्क",
      operatingHours: "दुकान का समय",
      deliveryAvailable: "स्थानीय डिलीवरी उपलब्ध",
      productsOffered: "उपलब्ध सामान एवं उत्पाद",
      contactStall: "विक्रेता से संपर्क करें",
      inStock: "उपलब्ध है",
    },
    actions: {
      save: "सुरक्षित करें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      viewProfile: "पहचान पत्र देखें",
      contact: "संपर्क करें",
      bookService: "काम बुक करें",
      loading: "प्रक्रिया जारी है...",
    },
  },

  as: {
    locale: "as",
    languageName: "Assamese",
    nativeName: "অসমীয়া",
    header: {
      bannerTitle: "প্ৰত্যক্ষ শ্ৰমিক স্বীকৃতি মঞ্চ",
      bannerSub: "কাৰিকৰৰ উপাৰ্জনত সদায় ০% কমিছন",
      controlledNotice: "নিয়ন্ত্ৰিত কাৰ্যসূচী: গুৱাহাটী আৰু শ্বিলং",
      home: "গৃহপৃষ্ঠা",
      findProfessionals: "কাৰিকৰ বিচাৰক",
      howItWorks: "ই কেনেকৈ কাম কৰে",
      contractorPro: "ঠিকাদাৰ প্ৰ'ভ",
      institutions: "অনুষ্ঠানসমূহ",
      about: "পৰিচিতি",
      signIn: "লগ ইন",
      register: "পৰিচয় সৃষ্টি কৰক",
      myWorkspace: "মোৰ কাৰ্যালয়",
      logout: "লগ আউট",
    },
    home: {
      heroPill: "দেশজোৰা ডিজিটেল কাৰিকৰ পঞ্জীয়ন",
      heroTitle: "প্ৰতিটো দক্ষতাই স্বীকৃতিৰ যোগ্য, ডিগ্ৰী অবিহনেও।",
      heroSubtitle: "কামসেতুৱে অসম আৰু সমগ্ৰ ভাৰতবৰ্ষৰ অভিজ্ঞ কাৰিকৰ, মেকানিক আৰু ক্ষুদ্ৰ ব্যৱসায়ীক পোনপটীয়াকৈ গ্ৰাহকৰ সৈতে সংযোগ কৰায় — ০% কমিছনৰ সৈতে।",
      findCraftspersonBtn: "প্ৰত্যায়িত কাৰিকৰ বিচাৰক",
      createProfileBtn: "আপোনাৰ দক্ষতা পঞ্জীয়ন কৰক",
      zeroCommissionHeading: "স্থায়ী ০% মঞ্চ কমিছন",
      zeroCommissionDesc: "শ্ৰমৰ উপাৰ্জনৰ প্ৰতিটো টকা সম্পূৰ্ণৰূপে কাৰিকৰ আৰু বিক্ৰেতাৰ। কামসেতুৱে কোনো কমিছন নকৰ্তে।",
      fivePillarsTitle: "কামসেতু কেনেকৈ কাম কৰে",
      operatingRegionsTitle: "দেশজোৰা পৰিচয় আৰু পাইলট অঞ্চল",
      operatingRegionsDesc: "পৰিচয় পঞ্জীয়ন সমগ্ৰ দেশতে উপলব্ধ। বাণিজ্যিক বুকিং বৰ্তমান গুৱাহাটী আৰু শ্বিলং চহৰাঞ্চলত প্ৰত্যায়িত।",
    },
    explore: {
      pageTitle: "প্ৰত্যায়িত কাৰিকৰ আৰু থলুৱা বিক্ৰেতা বিচাৰক",
      pageSubtitle: "গুৱাহাটী তথা সমগ্ৰ দেশৰ দক্ষ কাৰিকৰ আৰু বজাৰৰ বিক্ৰেতাসকলক সন্ধান কৰক।",
      searchPlaceholder: "বৃত্তি, দক্ষতা, বিক্ৰেতা বা স্থান অনুসৰি বিচাৰক...",
      allListings: "সকলো তালিকা",
      serviceProfessionals: "সেৱা কাৰিকৰ",
      vendorsAndArtisans: "থলুৱা বিক্ৰেতা আৰু সামগ্ৰী",
      stateFilter: "সকলো ৰাজ্য",
      districtFilter: "সকলো জিলা",
      filterResults: "ফিল্টাৰ কৰক",
      resetFilters: "পুনৰ নিৰ্ধাৰণ কৰক",
      verifiedArtisansFound: "প্ৰত্যায়িত কাৰিকৰ পোৱা গৈছে",
      noResults: "কোনো কাৰিকৰ বা বিক্ৰেতা পোৱা নগ'ল।",
    },
    vendor: {
      businessName: "দোকান বা ষ্টলৰ নাম",
      stallType: "ষ্টলৰ ধৰণ",
      mobileCart: "ভ্ৰাম্যমাণ ঠেলা",
      fixedStall: "স্থায়ী বজাৰ ষ্টল",
      homeWorkshop: "ঘৰুৱা কৰ্মশালা",
      kiosk: "কিঅ'স্ক",
      operatingHours: "খোলা থকাৰ সময়",
      deliveryAvailable: "থলুৱা ডেলিভাৰী উপলব্ধ",
      productsOffered: "উপলব্ধ সামগ্ৰী",
      contactStall: "বিক্ৰেতাৰ সৈতে যোগাযোগ কৰক",
      inStock: "মজুত আছে",
    },
    actions: {
      save: "সংৰক্ষণ কৰক",
      cancel: "বাতিল কৰক",
      submit: "দাখিল কৰক",
      viewProfile: "প্ৰমাণপত্ৰ চাওক",
      contact: "যোগাযোগ কৰক",
      bookService: "সেৱা বুক কৰক",
      loading: "প্ৰক্ৰিয়া চলি আছে...",
    },
  },

  bn: {
    locale: "bn",
    languageName: "Bengali",
    nativeName: "বাংলা",
    header: {
      bannerTitle: "প্রত্যক্ষ কর্মী স্বীকৃতি প্ল্যাটফর্ম",
      bannerSub: "কারিগরদের আয়ে স্থায়ী ০% কমিশন",
      controlledNotice: "নিয়ন্ত্রিত কার্যক্রম: গুয়াহাটি ও শিলং",
      home: "হোম",
      findProfessionals: "কারিগর খুঁজুন",
      howItWorks: "কীভাবে কাজ করে",
      contractorPro: "ঠিকাদার প্রো",
      institutions: "প্রতিষ্ঠান",
      about: "পরিচিতি",
      signIn: "সাইন ইন",
      register: "প্রোফাইল তৈরি করুন",
      myWorkspace: "আমার কর্মক্ষেত্র",
      logout: "লগ আউট",
    },
    home: {
      heroPill: "দেশব্যাপী ডিজিটাল কারিগর রেজিস্ট্রি",
      heroTitle: "প্রতিটি দক্ষতাই মূল্যায়নের যোগ্য, ডিগ্রি ছাড়াও।",
      heroSubtitle: "কামসেতু ভারতের দক্ষ কারিগর, টেকনিশিয়ান এবং স্থানীয় বিক্রেতাদের সরাসরি গ্রাহক ও ঠিকাদারদের সাথে যুক্ত করে — কোনো কমিশন ছাড়াই।",
      findCraftspersonBtn: "যাচাইকৃত কারিগর খুঁজুন",
      createProfileBtn: "আপনার দক্ষতা নথিভুক্ত করুন",
      zeroCommissionHeading: "স্থায়ী ০% প্ল্যাটফর্ম কমিশন",
      zeroCommissionDesc: "শ্রমের প্রতিটি পয়সা সম্পূর্ণভাবে কারিগর বা বিক্রেতার। কামসেতু কোনো কমিশন কাটে না।",
      fivePillarsTitle: "কামসেতু কীভাবে কাজ করে",
      operatingRegionsTitle: "দেশব্যাপী পরিচয় ও নিয়ন্ত্রিত পাইলট",
      operatingRegionsDesc: "ডিজিটাল পরিচয় সব ৩৬টি রাজ্য ও কেন্দ্রশাসিত অঞ্চলে সক্রিয়। বাণিজ্যিক বুকিং বর্তমানে গুয়াহাটি ও শিলংয়ে যাচাইকৃত।",
    },
    explore: {
      pageTitle: "যাচাইকৃত কারিগর ও স্থানীয় বিক্রেতা খুঁজুন",
      pageSubtitle: "ভারতের অভিজ্ঞ পেশাজীবী ও স্থানীয় বিক্রেতাদের তালিকা দেখুন।",
      searchPlaceholder: "পেশা, দক্ষতা, বিক্রেতা বা এলাকা দিয়ে খুঁজুন...",
      allListings: "সকল তালিকা",
      serviceProfessionals: "সেবা কারিগর",
      vendorsAndArtisans: "স্থানীয় বিক্রেতা ও পণ্য",
      stateFilter: "সকল রাজ্য",
      districtFilter: "সকল জেলা",
      filterResults: "ফিল্টার করুন",
      resetFilters: "রিসেট করুন",
      verifiedArtisansFound: "যাচাইকৃত পেশাজীবী উপলব্ধ",
      noResults: "কোনো কারিগর বা বিক্রেতা খুঁজে পাওয়া যায়নি।",
    },
    vendor: {
      businessName: "দোকান বা স্টলের নাম",
      stallType: "স্টলের ধরন",
      mobileCart: "ভ্রাম্যমাণ ঠেলাগাড়ি",
      fixedStall: "স্থায়ী বাজার স্টল",
      homeWorkshop: "গৃহভিত্তিক কারখানা",
      kiosk: "কিয়স্ক",
      operatingHours: "সময়সূচী",
      deliveryAvailable: "হোম ডেলিভারি উপলব্ধ",
      productsOffered: "পণ্য সামগ্রী",
      contactStall: "বিক্রেতার সাথে যোগাযোগ",
      inStock: "মজুত আছে",
    },
    actions: {
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      submit: "জমা দিন",
      viewProfile: "পরিচয়পত্র দেখুন",
      contact: "যোগাযোগ করুন",
      bookService: "বুকিং অনুরোধ",
      loading: "প্রক্রিয়াকরণ হচ্ছে...",
    },
  },
};
