/**
 * KAAMSETU — PHASE 54: STRUCTURED MARKETPLACE CATEGORY SYSTEM
 *
 * 12 Canonical Professional Service Categories & Subcategories.
 * Centralized single source of truth for discovery, search filtering,
 * vernacular indexing, and category navigation.
 *
 * Operational Rollout Classification: CLASS_B_CONTROLLED_ROLLOUT (Guwahati Urban & Shillong Urban).
 * Permanent Constitutional Invariant: platform_commission_amount = 0.00 on artisan wages.
 */

export interface MarketplaceSubcategory {
  id: string;
  name: string;
  hindiName: string;
  assameseName?: string;
  bengaliName?: string;
  keywords: string[];
}

export interface MarketplaceCategory {
  id: string;
  slug: string;
  title: string;
  hindiTitle: string;
  assameseTitle: string;
  bengaliTitle: string;
  description: string;
  hindiDescription: string;
  iconName: string; // Lucide icon component name
  subcategories: MarketplaceSubcategory[];
  popularSearchTerms: string[];
  serviceKeywords: string[];
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  // 1. ELECTRICAL
  {
    id: "cat-electrical",
    slug: "electrical",
    title: "Electrical",
    hindiTitle: "विद्युत सेवाएं (इलेक्ट्रिकल)",
    assameseTitle: "বৈদ্যুতিক সেৱা",
    bengaliTitle: "বৈদ্যুতিক পরিষেবা",
    description: "Home wiring, 3-phase distribution, inverter & battery, solar installation, and safety earthing.",
    hindiDescription: "घरेलू वायरिंग, ३-फेज लोड, इन्वर्टर-बैटरी, सोलर पैनल और अर्थिंग सुरक्षा।",
    iconName: "Zap",
    subcategories: [
      {
        id: "sub-elec-1",
        name: "Electrician",
        hindiName: "इलेक्ट्रीशियन",
        keywords: ["electrician", "bijli", "line", "power", "switch", "short circuit"],
      },
      {
        id: "sub-elec-2",
        name: "Wiring Technician",
        hindiName: "वायरिंग तकनीशियन",
        keywords: ["wiring", "conduit", "house wiring", "industrial wiring", "cabling"],
      },
      {
        id: "sub-elec-3",
        name: "Electrical Repair",
        hindiName: "इलेक्ट्रिकल रिपेयर",
        keywords: ["fuse", "mcb", "spark", "breaker", "tripping", "socket"],
      },
      {
        id: "sub-elec-4",
        name: "Inverter & UPS Technician",
        hindiName: "इन्वर्टर एवं यूपीएस",
        keywords: ["inverter", "battery", "ups", "backup", "acid", "charging"],
      },
      {
        id: "sub-elec-5",
        name: "Fan & Lighting Installation",
        hindiName: "पंखा एवं लाइटिंग फिटिंग",
        keywords: ["ceiling fan", "chandelier", "led", "cove lights", "exhaust fan"],
      },
      {
        id: "sub-elec-6",
        name: "Solar & Safety Earthing",
        hindiName: "सोलर पैनल एवं अर्थिंग",
        keywords: ["solar", "rooftop solar", "mnre", "earthing", "chemical earthing", "discom"],
      },
    ],
    popularSearchTerms: ["Electrician", "House wiring", "Inverter repair", "Solar panel", "MCB replacement"],
    serviceKeywords: ["electric", "wiring", "mcb", "fuse", "light", "fan", "inverter", "solar", "earthing", "bijli"],
  },

  // 2. PLUMBING
  {
    id: "cat-plumbing",
    slug: "plumbing",
    title: "Plumbing",
    hindiTitle: "प्लंबिंग एवं स्वच्छता",
    assameseTitle: "নল সংস্থাপন (প্লাম্বিং)",
    bengaliTitle: "নল মেরামতের কাজ (প্লাম্বিং)",
    description: "Concealed piping, water tank cleaning, tap & fixture fitting, leak repairs, and drainage.",
    hindiDescription: "कंसील्ड पाइपिंग, पानी की टंकी, नल एवं शावर फिटिंग, लीकेज रिपेयर और जल निकासी।",
    iconName: "Wrench",
    subcategories: [
      {
        id: "sub-plumb-1",
        name: "Plumber",
        hindiName: "प्लंबर (नलसाज)",
        keywords: ["plumber", "pipe", "tap", "nal", "leak", "valve"],
      },
      {
        id: "sub-plumb-2",
        name: "Pipe Repair & Fitting",
        hindiName: "पाइप फिटिंग एवं रिपेयर",
        keywords: ["cpvc", "upvc", "gi pipe", "pipe bursting", "joint leak"],
      },
      {
        id: "sub-plumb-3",
        name: "Water Leakage Repair",
        hindiName: "पानी का रिसाव समाधान",
        keywords: ["leakage", "seepage", "dampness", "drip", "moisture"],
      },
      {
        id: "sub-plumb-4",
        name: "Bathroom & Sanitary Fitting",
        hindiName: "बाथरूम फिटिंग्स",
        keywords: ["commode", "cistern", "flush", "shower", "washbasin", "sanitary"],
      },
      {
        id: "sub-plumb-5",
        name: "Water Tank Repair & Cleaning",
        hindiName: "पानी की टंकी सफाई व मरम्मत",
        keywords: ["sintex", "water tank", "tank cleaning", "overflow", "float valve"],
      },
      {
        id: "sub-plumb-6",
        name: "Pump & Motor Repair",
        hindiName: "पानी की मोटर व पंप मरम्मत",
        keywords: ["submersible", "motor", "borewell", "water pump", "pressure pump"],
      },
    ],
    popularSearchTerms: ["Plumber near me", "Water leak fix", "Tap repair", "Water tank cleaning", "Motor repair"],
    serviceKeywords: ["plumber", "pipe", "tap", "shower", "tank", "drainage", "leak", "pump", "flush", "commode"],
  },

  // 3. CARPENTRY & FURNITURE
  {
    id: "cat-carpentry-furniture",
    slug: "carpentry-furniture",
    title: "Carpentry & Furniture",
    hindiTitle: "बढ़ईगीरी एवं फर्नीचर",
    assameseTitle: "কাঠমিস্ত্ৰী আৰু আচবাব",
    bengaliTitle: "ছুতোর ও আসবাবপত্র",
    description: "Custom teak & cane woodwork, modular kitchens, furniture assembly, doors, windows, and polishing.",
    hindiDescription: "कस्टम लकड़ी का काम, मॉड्यूलर किचन, फर्नीचर असेंबली, दरवाजे-खिड़कियां और पॉलिशिंग।",
    iconName: "Hammer",
    subcategories: [
      {
        id: "sub-carp-1",
        name: "Carpenter",
        hindiName: "बढ़ई (कारपेंटर)",
        keywords: ["carpenter", "wood", "lakdi", "furniture", "table", "chair"],
      },
      {
        id: "sub-carp-2",
        name: "Furniture Repair & Polish",
        hindiName: "फर्नीचर रिपेयर एवं पॉलिश",
        keywords: ["varnish", "french polish", "melamine", "wood polish", "refinish"],
      },
      {
        id: "sub-carp-3",
        name: "Modular Kitchen & Cabinetry",
        hindiName: "मॉड्यूलर किचन एवं कैबिनेटरी",
        keywords: ["modular kitchen", "cupboard", "almirah", "wardrobe", "drawers", "hinges"],
      },
      {
        id: "sub-carp-4",
        name: "Door & Window Framing",
        hindiName: "दरवाजे एवं खिड़की चौखट",
        keywords: ["door frame", "chaukhat", "window sash", "sliding door", "mesh door"],
      },
      {
        id: "sub-carp-5",
        name: "Lock & Handle Installation",
        hindiName: "लॉक एवं हैंडल फिटिंग",
        keywords: ["godrej lock", "mortise lock", "door latch", "handle", "padlock"],
      },
      {
        id: "sub-carp-6",
        name: "Cane & Bamboo Joinery",
        hindiName: "बेंत एवं बांस कारीगरी",
        keywords: ["assam cane", "bamboo", "woven furniture", "traditional joinery"],
      },
    ],
    popularSearchTerms: ["Carpenter", "Door lock repair", "Wardrobe maker", "Modular kitchen", "Wood polish"],
    serviceKeywords: ["carpenter", "wood", "furniture", "bed", "sofa", "door", "window", "kitchen", "wardrobe", "polish"],
  },

  // 4. HOME REPAIR & MAINTENANCE
  {
    id: "cat-home-repair-maintenance",
    slug: "home-repair-maintenance",
    title: "Home Repair & Maintenance",
    hindiTitle: "गृह मरम्मत एवं रखरखाव",
    assameseTitle: "ঘৰৰ মেৰামতি আৰু ৰক্ষণাবেক্ষণ",
    bengaliTitle: "বাড়ি মেরামত ও রক্ষণাবেক্ষণ",
    description: "Masonry, tile setting, crack repair, structural waterproofing, welding, and general handyman.",
    hindiDescription: "राजमिस्त्री, टाइल लगाना, दरार मरम्मत, वॉटरप्रूफिंग, वेल्डिंग और हैंडीमैन कार्य।",
    iconName: "Home",
    subcategories: [
      {
        id: "sub-home-1",
        name: "General Handyman",
        hindiName: "हैंडीमैन (विविध मरम्मत)",
        keywords: ["handyman", "drilling", "curtain rod", "tv mounting", "mirror hanging"],
      },
      {
        id: "sub-home-2",
        name: "Masonry & Plastering",
        hindiName: "राजमिस्त्री व प्लास्टर",
        keywords: ["mason", "brickwork", "plaster", "cement", "mortar", "crack"],
      },
      {
        id: "sub-home-3",
        name: "Tiling & Flooring",
        hindiName: "टाइल एवं फर्श कारीगर",
        keywords: ["tiles", "vitrified", "granite", "marble", "grouting", "flooring"],
      },
      {
        id: "sub-home-4",
        name: "Waterproofing & Seepage",
        hindiName: "वॉटरप्रूफिंग समाधान",
        keywords: ["waterproofing", "roof seepage", "dampness", "dr fixit", "membrane"],
      },
      {
        id: "sub-home-5",
        name: "Welding & Grill Fabrication",
        hindiName: "वेल्डिंग एवं ग्रिल कार्य",
        keywords: ["welder", "grill", "gate", "railing", "iron work", "fabrication"],
      },
      {
        id: "sub-home-6",
        name: "Ceiling & Gypsum Repair",
        hindiName: "सीलिंग एवं फॉल्स सीलिंग",
        keywords: ["pop", "gypsum", "false ceiling", "grid ceiling", "cornice"],
      },
    ],
    popularSearchTerms: ["Handyman", "Mason near me", "Tile fixing", "Roof waterproofing", "Gate welding"],
    serviceKeywords: ["mason", "tiles", "repair", "handyman", "waterproofing", "welding", "plaster", "ceiling", "grill"],
  },

  // 5. CLEANING & HOUSEKEEPING
  {
    id: "cat-cleaning-housekeeping",
    slug: "cleaning-housekeeping",
    title: "Cleaning & Housekeeping",
    hindiTitle: "सफाई एवं गृह स्वच्छता",
    assameseTitle: "পৰিষ্কাৰ আৰু ঘৰুৱা পৰিচৰ্যা",
    bengaliTitle: "বাড়ি ও ঘর পরিষ্কার",
    description: "Full residential deep cleaning, kitchen degreasing, bathroom sanitation, sofa & mattress care.",
    hindiDescription: "आवासीय डीप क्लीनिंग, किचन डीग्रीसिंग, बाथरूम सैनिटाइजेशन, सोफा व गद्दे की सफाई।",
    iconName: "Brush",
    subcategories: [
      {
        id: "sub-clean-1",
        name: "Home Deep Cleaner",
        hindiName: "घर की डीप क्लीनिंग",
        keywords: ["deep cleaning", "house cleaning", "move-in cleaning", "dusting", "vacuum"],
      },
      {
        id: "sub-clean-2",
        name: "Bathroom Sanitization",
        hindiName: "बाथरूम सैनिटाइजेशन",
        keywords: ["bathroom clean", "tile scrubbing", "acid wash", "limescale", "stain removal"],
      },
      {
        id: "sub-clean-3",
        name: "Kitchen Degreasing & Chimney",
        hindiName: "रसोई एवं चिमनी सफाई",
        keywords: ["kitchen cleaning", "chimney cleaning", "oil stains", "exhaust cleaning"],
      },
      {
        id: "sub-clean-4",
        name: "Sofa & Carpet Shampooing",
        hindiName: "सोफा एवं कालीन शैंपू",
        keywords: ["sofa cleaning", "carpet wash", "upholstery", "mattress sanitization"],
      },
      {
        id: "sub-clean-5",
        name: "Water Tank Disinfection",
        hindiName: "वॉटर टैंक कीटाणुशोधन",
        keywords: ["tank cleaning", "sludge removal", "uv treatment", "chlorination"],
      },
      {
        id: "sub-clean-6",
        name: "Office & Commercial Cleaning",
        hindiName: "दफ्तर एवं वाणिज्यिक सफाई",
        keywords: ["office cleaning", "commercial cleaning", "floor scrubbing", "glass facade"],
      },
    ],
    popularSearchTerms: ["Deep home cleaning", "Bathroom cleaning", "Sofa shampoo", "Kitchen cleaning", "Tank cleaning"],
    serviceKeywords: ["cleaning", "safai", "bathroom", "kitchen", "sofa", "carpet", "deep clean", "sanitization"],
  },

  // 6. AC & APPLIANCE REPAIR
  {
    id: "cat-ac-appliance-repair",
    slug: "ac-appliance-repair",
    title: "AC & Appliance Repair",
    hindiTitle: "एसी एवं घरेलू उपकरण मरम्मत",
    assameseTitle: "এচি আৰু গৃহ সঁজুলি মেৰামতি",
    bengaliTitle: "এসি ও গৃহস্থালির যন্ত্রপাতি মেরামত",
    description: "AC servicing & gas charging, refrigerators, washing machines, microwaves, RO water purifiers, and geysers.",
    hindiDescription: "एसी सर्विसिंग व गैस चार्जिंग, फ्रिज, वाशिंग मशीन, माइक्रोवेव, आरओ वाटर प्यूरीफायर और गीजर।",
    iconName: "Fan",
    subcategories: [
      {
        id: "sub-app-1",
        name: "AC Service & Gas Charging",
        hindiName: "एसी सर्विस एवं गैस रिफिल",
        keywords: ["ac service", "split ac", "window ac", "cooling", "gas leak", "jet wash"],
      },
      {
        id: "sub-app-2",
        name: "Refrigerator Repair",
        hindiName: "फ्रिज मरम्मत",
        keywords: ["fridge", "refrigerator", "freezer", "compressor", "defrost", "thermostat"],
      },
      {
        id: "sub-app-3",
        name: "Washing Machine Repair",
        hindiName: "वाशिंग मशीन तकनीशियन",
        keywords: ["washing machine", "front load", "top load", "spin cycle", "drain pump"],
      },
      {
        id: "sub-app-4",
        name: "Water Purifier (RO) Service",
        hindiName: "आरओ वाटर प्यूरीफायर सर्विस",
        keywords: ["ro service", "water purifier", "membrane", "filter change", "tds"],
      },
      {
        id: "sub-app-5",
        name: "Geyser & Water Heater",
        hindiName: "गीजर एवं हीटर मरम्मत",
        keywords: ["geyser", "water heater", "thermostat", "heating coil", "water leak"],
      },
      {
        id: "sub-app-6",
        name: "Microwave & Oven Repair",
        hindiName: "माइक्रोवेव एवं ओवन",
        keywords: ["microwave", "otg", "magnetron", "turntable", "heating issue"],
      },
    ],
    popularSearchTerms: ["AC repair near me", "Fridge mechanic", "Washing machine repair", "RO filter change", "Geyser fix"],
    serviceKeywords: ["ac", "fridge", "refrigerator", "washing machine", "ro", "water purifier", "geyser", "microwave", "appliance"],
  },

  // 7. AUTOMOTIVE
  {
    id: "cat-automotive",
    slug: "automotive",
    title: "Automotive",
    hindiTitle: "ऑटोमोबाइल एवं मैकेनिक",
    assameseTitle: "মটৰ বাহন আৰু মেকানিক",
    bengaliTitle: "মোটরযান ও মেকানিক পরিষেবা",
    description: "Two-wheeler tuning, four-wheeler diagnostic, puncture repair, mobile mechanics, and auto electricians.",
    hindiDescription: "दोपहिया व चारपहिया वाहन मरम्मत, पंचर, मोबाइल मैकेनिक, वायरिंग और आपातकालीन सहायता।",
    iconName: "Car",
    subcategories: [
      {
        id: "sub-auto-1",
        name: "Two-Wheeler Mechanic",
        hindiName: "दोपहिया मैकेनिक (बाइक/स्कूटर)",
        keywords: ["bike mechanic", "scooter repair", "carburetor", "brake shoes", "oil change", "chain"],
      },
      {
        id: "sub-auto-2",
        name: "Car & Four-Wheeler Mechanic",
        hindiName: "कार एवं चौपहिया मैकेनिक",
        keywords: ["car mechanic", "engine tuning", "suspension", "clutch plate", "brake pad", "radiator"],
      },
      {
        id: "sub-auto-3",
        name: "Auto Electrician & Battery Jumpstart",
        hindiName: "ऑटो इलेक्ट्रीशियन एवं बैटरी",
        keywords: ["battery dead", "jumpstart", "alternator", "starter motor", "car wiring", "headlight"],
      },
      {
        id: "sub-auto-4",
        name: "Tyre Service & Puncture",
        hindiName: "टायर एवं पंचर रिपेयर",
        keywords: ["puncture", "tubeless", "tyre change", "wheel alignment", "nitrogen"],
      },
      {
        id: "sub-auto-5",
        name: "Car Wash & Detailing",
        hindiName: "कार वॉश एवं डिटेलिंग",
        keywords: ["car wash", "foam wash", "interior cleaning", "rubbing polish", "ceramic"],
      },
      {
        id: "sub-auto-6",
        name: "Mobile On-Road Mechanic",
        hindiName: "ऑन-रोड इमरजेंसी मैकेनिक",
        keywords: ["breakdown", "towing", "roadside assistance", "emergency repair", "highway"],
      },
    ],
    popularSearchTerms: ["Bike mechanic", "Car service", "Battery jumpstart", "Tyre puncture repair", "Mobile mechanic"],
    serviceKeywords: ["car", "bike", "mechanic", "puncture", "battery", "oil change", "breakdown", "vehicle", "auto"],
  },

  // 8. BEAUTY & PERSONAL CARE
  {
    id: "cat-beauty-personal-care",
    slug: "beauty-personal-care",
    title: "Beauty & Personal Care",
    hindiTitle: "सौंदर्य एवं व्यक्तिगत देखभाल",
    assameseTitle: "সৌন্দৰ্য্য আৰু ব্যক্তিগত যত্ন",
    bengaliTitle: "সৌন্দর্য ও ব্যক্তিগত পরিচর্যা",
    description: "Doorstep grooming for men & women, bridal styling, hair care, massage, skincare, and mehndi art.",
    hindiDescription: "घर पर पुरुषों एवं महिलाओं की ग्रूमिंग, ब्राइडल मेकअप, हेयर स्टाइलिंग, फेशियल और मेहंदी।",
    iconName: "Scissors",
    subcategories: [
      {
        id: "sub-beauty-1",
        name: "Men's Grooming & Haircut",
        hindiName: "पुरुष ग्रूमिंग व हेयरकट",
        keywords: ["barber", "haircut", "beard trim", "shave", "head massage"],
      },
      {
        id: "sub-beauty-2",
        name: "Women's Salon at Home",
        hindiName: "महिला सैलून सेवा",
        keywords: ["salon at home", "waxing", "threading", "manicure", "pedicure", "hair spa"],
      },
      {
        id: "sub-beauty-3",
        name: "Bridal Makeup & Styling",
        hindiName: "ब्राइडल मेकअप व सजावट",
        keywords: ["bridal makeup", "hd makeup", "saree draping", "hair do", "engagement"],
      },
      {
        id: "sub-beauty-4",
        name: "Mehndi Artist",
        hindiName: "मेहंदी आर्टिस्ट",
        keywords: ["mehndi", "bridal mehndi", "arabic mehndi", "henna art"],
      },
      {
        id: "sub-beauty-5",
        name: "Skincare & Facial Specialist",
        hindiName: "स्किनकेयर एवं फेशियल",
        keywords: ["facial", "bleach", "d-tan", "skin cleanup", "anti-aging"],
      },
      {
        id: "sub-beauty-6",
        name: "Therapeutic Massage & Wellness",
        hindiName: "मसाज एवं वेलनेस",
        keywords: ["body massage", "ayurvedic massage", "pain relief", "head massage"],
      },
    ],
    popularSearchTerms: ["Home salon", "Barber at home", "Bridal makeup", "Mehndi artist", "Facial and cleanup"],
    serviceKeywords: ["salon", "haircut", "makeup", "grooming", "mehndi", "facial", "massage", "waxing", "beauty"],
  },

  // 9. TAILORING & FASHION
  {
    id: "cat-tailoring-fashion",
    slug: "tailoring-fashion",
    title: "Tailoring & Fashion",
    hindiTitle: "सिलाई, दर्जी एवं वस्त्र परिधान",
    assameseTitle: "দৰ্জী আৰু পোছাক প্ৰস্তুতি",
    bengaliTitle: "দর্জি ও পোশাক তৈরি",
    description: "Bespoke tailoring, traditional attire, alterations, blouse & suit stitching, curtains, and embroidery.",
    hindiDescription: "कस्टम टेलरिंग, पारंपरिक पोशाकें, फिटिंग ऑल्टरेशन, ब्लाउज व सूट सिलाई और कढ़ाई कार्य।",
    iconName: "Shirt",
    subcategories: [
      {
        id: "sub-tailor-1",
        name: "Custom Tailor",
        hindiName: "कस्टम दर्जी (टेलर)",
        keywords: ["tailor", "darji", "custom stitching", "blouse", "kurta", "pant"],
      },
      {
        id: "sub-tailor-2",
        name: "Alterations & Fitting",
        hindiName: "फिटिंग एवं ऑल्टरेशन",
        keywords: ["alteration", "fitting", "hem", "tightening", "zipper replacement"],
      },
      {
        id: "sub-tailor-3",
        name: "Traditional & Wedding Attire",
        hindiName: "पारंपरिक व वैवाहिक परिधान",
        keywords: ["lehenga", "sherwani", "mekhela chador", "saree fall pico", "anarkali"],
      },
      {
        id: "sub-tailor-4",
        name: "Embroidery & Zari Craft",
        hindiName: "कढ़ाई एवं जरी कारीगरी",
        keywords: ["zari", "zardozi", "thread work", "chikankari", "applique"],
      },
      {
        id: "sub-tailor-5",
        name: "Curtain & Upholstery Stitching",
        hindiName: "पर्दा एवं अपहोल्स्ट्री सिलाई",
        keywords: ["curtain stitching", "sofa cover", "cushion cover", "valance"],
      },
      {
        id: "sub-tailor-6",
        name: "Uniform & Bulk Stitching",
        hindiName: "वर्दी एवं बल्क सिलाई",
        keywords: ["school uniform", "corporate uniform", "hospitality wear", "apron"],
      },
    ],
    popularSearchTerms: ["Tailor near me", "Blouse stitching", "Pant alteration", "Traditional wear tailor", "Curtain stitching"],
    serviceKeywords: ["tailor", "darji", "stitching", "blouse", "kurta", "alteration", "lehenga", "suit", "embroidery"],
  },

  // 10. CONSTRUCTION & LABOUR
  {
    id: "cat-construction-labour",
    slug: "construction-labour",
    title: "Construction & Labour",
    hindiTitle: "निर्माण एवं दैनिक श्रम",
    assameseTitle: "নিৰ্মাণ আৰু শ্ৰমিক",
    bengaliTitle: "নির্মাণ ও দৈনিক শ্রম",
    description: "Civil construction artisans, helpers, painters, shuttering carpenters, bar benders, and demolition.",
    hindiDescription: "सिविल निर्माण कारीगर, सहायक मजदूर, पेंटर, शटरिंग, सरिया बाइंडिंग और मलबा निस्तारण।",
    iconName: "HardHat",
    subcategories: [
      {
        id: "sub-const-1",
        name: "Civil Construction Artisan",
        hindiName: "सिविल निर्माण कारीगर",
        keywords: ["construction", "rcc", "beam", "slab", "concrete", "foundation"],
      },
      {
        id: "sub-const-2",
        name: "Helper & Daily Labour",
        hindiName: "दैनिक सहायक एवं मजदूर",
        keywords: ["helper", "daily wage", "mazdoor", "loading", "unloading", "excavation"],
      },
      {
        id: "sub-const-3",
        name: "House Painting & Distemper",
        hindiName: "पेंटर (सफेदी व पुट्टी)",
        keywords: ["painter", "putty", "primer", "emulsion", "waterproof paint", "texture"],
      },
      {
        id: "sub-const-4",
        name: "Shuttering & Bar Bending",
        hindiName: "शटरिंग एवं सरिया बाइंडिंग",
        keywords: ["shuttering", "ply formwork", "bar bending", "steel reinforcement"],
      },
      {
        id: "sub-const-5",
        name: "Demolition & Debris Clearing",
        hindiName: "ध्वस्तीकरण एवं मलबा निस्तारण",
        keywords: ["demolition", "debris", "malba removal", "jackhammer", "concrete breaking"],
      },
      {
        id: "sub-const-6",
        name: "Scaffolding Setup",
        hindiName: "मचान एवं पाड़ बांधना",
        keywords: ["scaffolding", "cuplock", "bamboo scaffolding", "staging"],
      },
    ],
    popularSearchTerms: ["Construction labour", "House painter", "Daily wage helper", "Brick mason", "RCC shuttering"],
    serviceKeywords: ["construction", "labour", "mazdoor", "painter", "putty", "cement", "rcc", "shuttering", "debris"],
  },

  // 11. TRANSPORT & DELIVERY
  {
    id: "cat-transport-delivery",
    slug: "transport-delivery",
    title: "Transport & Delivery",
    hindiTitle: "परिवहन एवं लॉजिस्टिक्स",
    assameseTitle: "পৰিবহণ আৰু বিতৰণ",
    bengaliTitle: "পরিবহন ও বিতরণ",
    description: "Mini truck cargo transit, parcel runners, house shifting helpers, on-demand drivers, and tempo hire.",
    hindiDescription: "मिनी ट्रक मालवाहक, पार्सल डिलीवरी, घर शिफ्टिंग सहायक, ऑन-डिमांड ड्राइवर और टेम्पो सेवा।",
    iconName: "Truck",
    subcategories: [
      {
        id: "sub-trans-1",
        name: "Mini Truck & Goods Transport",
        hindiName: "मिनी ट्रक एवं मालवाहक",
        keywords: ["mini truck", "tata ace", "chhota hathi", "pickup", "goods transport", "tempo"],
      },
      {
        id: "sub-trans-2",
        name: "Packers & Shifting Helpers",
        hindiName: "पैकर्स एवं शिफ्टिंग सहायक",
        keywords: ["packers and movers", "house shifting", "furniture moving", "bubble wrap"],
      },
      {
        id: "sub-trans-3",
        name: "Commercial & Private Driver",
        hindiName: "निजी व व्यावसायिक ड्राइवर",
        keywords: ["driver on demand", "car driver", "chauffeur", "outstation driver", "heavy vehicle"],
      },
      {
        id: "sub-trans-4",
        name: "Two-Wheeler Parcel Courier",
        hindiName: "दोपहिया पार्सल डिलीवरी",
        keywords: ["courier", "parcel delivery", "urgent document", "delivery boy", "intra-city"],
      },
      {
        id: "sub-trans-5",
        name: "Auto-Rickshaw & Tempo Cargo",
        hindiName: "ऑटो रिक्शा एवं कार्गो टेम्पो",
        keywords: ["cargo auto", "tempo", "market haulage", "produce transit"],
      },
      {
        id: "sub-trans-6",
        name: "Farm & Produce Transit",
        hindiName: "कृषि उपज परिवहन",
        keywords: ["mandi transit", "vegetable haulage", "grain transit", "rural logistics"],
      },
    ],
    popularSearchTerms: ["Tata Ace for shifting", "Driver on call", "Packers and movers", "Parcel delivery", "Tempo hire"],
    serviceKeywords: ["transport", "driver", "tempo", "shifting", "truck", "delivery", "packers", "cargo", "logistics"],
  },

  // 12. OTHER SKILLED SERVICES
  {
    id: "cat-other-skilled-services",
    slug: "other-skilled-services",
    title: "Other Skilled Services",
    hindiTitle: "अन्य विशेषज्ञ एवं कुशल सेवाएं",
    assameseTitle: "অন্যান্য দক্ষ সেৱা",
    bengaliTitle: "অন্যান্য দক্ষ পরিষেবা",
    description: "CCTV security, sound & event setup, garden care, home cooking, photography, and traditional artisans.",
    hindiDescription: "सीसीटीवी सुरक्षा, साउंड व इवेंट, बागवानी, घरेलू कुक, फोटोग्राफी और पारंपरिक शिल्पकार।",
    iconName: "Briefcase",
    subcategories: [
      {
        id: "sub-other-1",
        name: "CCTV & Security Installation",
        hindiName: "सीसीटीवी एवं सुरक्षा प्रणाली",
        keywords: ["cctv", "security camera", "dvr", "ip camera", "biometric", "video door phone"],
      },
      {
        id: "sub-other-2",
        name: "Sound, Lighting & Event Setup",
        hindiName: "साउंड, लाइटिंग एवं इवेंट व्यवस्था",
        keywords: ["sound system", "dj setup", "tent house", "event lighting", "generator"],
      },
      {
        id: "sub-other-3",
        name: "Gardening & Landscaping",
        hindiName: "बागवानी एवं माली",
        keywords: ["gardener", "mali", "lawn mowing", "pruning", "potting soil", "nursery"],
      },
      {
        id: "sub-other-4",
        name: "Home Cook & Catering Helper",
        hindiName: "घरेलू रसोइया (कुक) एवं हलवाई",
        keywords: ["cook", "chef", "halwai", "catering helper", "roti maker", "veg non-veg"],
      },
      {
        id: "sub-other-5",
        name: "Photography & Videography",
        hindiName: "फोटोग्राफी एवं वीडियोग्राफी",
        keywords: ["photographer", "event photography", "videographer", "drone shoot", "album"],
      },
      {
        id: "sub-other-6",
        name: "Traditional Craft & Artisan",
        hindiName: "पारंपरिक हस्तशिल्प एवं कारीगरी",
        keywords: ["pottery", "bamboo weaving", "metal craft", "sculpture", "terracotta"],
      },
    ],
    popularSearchTerms: ["CCTV installation", "Home cook near me", "Gardener for hire", "Event sound setup", "Photographer"],
    serviceKeywords: ["cctv", "security", "event", "sound", "gardener", "mali", "cook", "chef", "photography", "artisan"],
  },
];

/**
 * Returns all 12 categories
 */
export function getAllCategories(): MarketplaceCategory[] {
  return MARKETPLACE_CATEGORIES;
}

/**
 * Find category by slug
 */
export function getCategoryBySlug(slug: string): MarketplaceCategory | undefined {
  const normalized = slug.toLowerCase().trim();
  return MARKETPLACE_CATEGORIES.find((cat) => cat.slug === normalized);
}

/**
 * Search categories and subcategories by query string
 */
export function searchCategories(query: string): MarketplaceCategory[] {
  const q = query.toLowerCase().trim();
  if (!q) return MARKETPLACE_CATEGORIES;

  return MARKETPLACE_CATEGORIES.filter((cat) => {
    if (cat.title.toLowerCase().includes(q)) return true;
    if (cat.hindiTitle.toLowerCase().includes(q)) return true;
    if (cat.slug.toLowerCase().includes(q)) return true;
    if (cat.description.toLowerCase().includes(q)) return true;
    if (cat.serviceKeywords.some((k) => k.toLowerCase().includes(q))) return true;
    if (cat.popularSearchTerms.some((t) => t.toLowerCase().includes(q))) return true;
    if (
      cat.subcategories.some(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.hindiName.toLowerCase().includes(q) ||
          (sub.assameseName && sub.assameseName.toLowerCase().includes(q)) ||
          (sub.bengaliName && sub.bengaliName.toLowerCase().includes(q)) ||
          sub.keywords.some((k) => k.toLowerCase().includes(q))
      )
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Returns a flat list of all subcategories with parent category slug
 */
export function getAllSubcategories(): Array<MarketplaceSubcategory & { parentCategorySlug: string; parentCategoryTitle: string }> {
  return MARKETPLACE_CATEGORIES.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      ...sub,
      parentCategorySlug: cat.slug,
      parentCategoryTitle: cat.title,
    }))
  );
}
