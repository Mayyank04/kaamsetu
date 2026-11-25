/**
 * KAAMSETU — Hierarchical Business & Vendor Taxonomy System
 * Covers 11 primary economic sectors across India with dedicated category-specific schemas,
 * licensing rules, and dynamic field specifications for informal trade workers and local merchants.
 */

export interface DynamicFieldDefinition {
  id: string;
  labelKey: string;
  defaultLabel: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean" | "textarea";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
}

export interface BusinessSubcategory {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  description: string;
  requiresLicense?: boolean;
  licenseName?: string;
  fields: DynamicFieldDefinition[];
}

export interface BusinessCategory {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  translationKey: string;
  iconName: string;
  description: string;
  subcategories: BusinessSubcategory[];
}

export const INDIAN_BUSINESS_CATEGORIES: BusinessCategory[] = [
  // ================= 1. HOME & REPAIR SERVICES =================
  {
    id: "cat-home-repair",
    code: "home_repair",
    name: "Home and Repair Services",
    hindiName: "घर और मरम्मत सेवाएं",
    translationKey: "homeRepair",
    iconName: "Wrench",
    description: "Electricians, plumbers, carpenters, appliance technicians, and home maintenance.",
    subcategories: [
      {
        id: "sub-electrician",
        code: "electrician",
        name: "Electrician & Wireman",
        hindiName: "बिजली मिस्त्री",
        description: "Residential, commercial, and industrial electrical installations and fault repair.",
        requiresLicense: true,
        licenseName: "Wireman License / CEA Electrical Supervisor Certificate",
        fields: [
          {
            id: "work_scope",
            labelKey: "electrician.workScope",
            defaultLabel: "Work Scope",
            type: "multiselect",
            options: [
              { value: "residential", label: "Residential Wiring & Fittings" },
              { value: "commercial", label: "Commercial Distribution Panels" },
              { value: "industrial", label: "Industrial Motors & Solar Inverters" },
            ],
            required: true,
          },
          {
            id: "specializations",
            labelKey: "electrician.specializations",
            defaultLabel: "Work Specializations",
            type: "multiselect",
            options: [
              { value: "inverter_wiring", label: "Solar Inverters & Battery Banks" },
              { value: "panel_installation", label: "Distribution Boards & MCB Panels" },
              { value: "earthing", label: "Safety Earthing & Surge Arrestors" },
              { value: "smart_home", label: "Smart Lighting & Automation" },
              { value: "motor_repair", label: "Submersible Pump & Motor Rewinding" },
            ],
          },
          {
            id: "applicable_qualifications",
            labelKey: "electrician.qualifications",
            defaultLabel: "Applicable Trade Qualifications",
            type: "select",
            options: [
              { value: "licensed_supervisor", label: "State CEA Licensed Electrical Supervisor" },
              { value: "wireman_permit", label: "State Wireman Competency Permit" },
              { value: "iti_electrician", label: "ITI Electrician Certified (NCVT)" },
              { value: "guild_master", label: "Guild Master / 10+ Years Practical Apprentice" },
            ],
          },
          {
            id: "emergency_24x7",
            labelKey: "electrician.emergency24x7",
            defaultLabel: "Emergency 24x7 Support Available",
            type: "boolean",
          },
          {
            id: "licensed_wireman",
            labelKey: "electrician.licensedWireman",
            defaultLabel: "Holds State Wireman License",
            type: "boolean",
          },
          {
            id: "license_number",
            labelKey: "electrician.licenseNumber",
            defaultLabel: "State License / Registration Number (Optional)",
            type: "text",
            placeholder: "e.g. AS/EL/2021/8921",
          },
        ],
      },
      {
        id: "sub-plumber",
        code: "plumber",
        name: "Plumber & Pipe Fitter",
        hindiName: "प्लम्बर / नलसाज",
        description: "Sanitary installations, pipeline fitting, motor repair, and drainage clearance.",
        fields: [
          {
            id: "plumbing_type",
            labelKey: "plumber.type",
            defaultLabel: "Plumbing Specialization",
            type: "multiselect",
            options: [
              { value: "sanitary", label: "Bathroom & Sanitary Ware" },
              { value: "water_tanks", label: "Overhead Tank & Borewell Piping" },
              { value: "drainage", label: "Underground Drainage & Sewerage" },
            ],
          },
          {
            id: "carries_power_tools",
            labelKey: "plumber.tools",
            defaultLabel: "Carries Pipe Threading & Core Cutting Tools",
            type: "boolean",
          },
        ],
      },
      {
        id: "sub-carpenter",
        code: "carpenter",
        name: "Carpenter & Woodworker",
        hindiName: "बढ़ई / खाती",
        description: "Custom wooden furniture, modular kitchen, door/window frame fitting, and repairs.",
        fields: [
          {
            id: "wood_specialties",
            labelKey: "carpenter.specialties",
            defaultLabel: "Woodcraft Specialization",
            type: "multiselect",
            options: [
              { value: "teakwood", label: "Teak / Hardwood Solid Furniture" },
              { value: "modular", label: "Plywood / Modular Laminate Work" },
              { value: "repair", label: "Antique Restoration & Repair" },
            ],
          },
          {
            id: "workshop_available",
            labelKey: "carpenter.workshop",
            defaultLabel: "Owns Woodworking Workshop / Karkhana",
            type: "boolean",
          },
        ],
      },
    ],
  },

  // ================= 2. CONSTRUCTION & SKILLED LABOUR =================
  {
    id: "cat-construction",
    code: "construction",
    name: "Construction and Skilled Labour",
    hindiName: "निर्माण और कुशल श्रम",
    translationKey: "construction",
    iconName: "Hammer",
    description: "Masons, bar benders, welders, tile workers, civil contractors, and site supervisors.",
    subcategories: [
      {
        id: "sub-mason",
        code: "mason",
        name: "Mason / Rajmistri",
        hindiName: "राजमिस्त्री",
        description: "Brickwork, RCC casting, plastering, stone masonry, and foundation laying.",
        fields: [
          {
            id: "masonry_type",
            labelKey: "mason.type",
            defaultLabel: "Masonry Specialization",
            type: "multiselect",
            options: [
              { value: "brick_stone", label: "Brick & Stone Masonry" },
              { value: "plastering", label: "Fine Wall & Ceiling Plastering" },
              { value: "rcc_casting", label: "RCC Column & Beam Shuttering" },
            ],
          },
          {
            id: "crew_size",
            labelKey: "mason.crewSize",
            defaultLabel: "Own Labour Crew Size Available",
            type: "number",
            placeholder: "Number of helpers / artisans (e.g. 5)",
          },
        ],
      },
      {
        id: "sub-welder",
        code: "welder",
        name: "Welder & Fabricator",
        hindiName: "वेल्डर / फैब्रिकेटर",
        description: "Iron gates, grills, truss roofing, MS/SS argon welding, and heavy fabrication.",
        fields: [
          {
            id: "welding_methods",
            labelKey: "welder.methods",
            defaultLabel: "Welding Types",
            type: "multiselect",
            options: [
              { value: "arc", label: "Electric Arc Welding" },
              { value: "argon_tig", label: "Argon / TIG / Stainless Steel" },
              { value: "gas_cutting", label: "Oxy-Acetylene Gas Cutting" },
            ],
          },
        ],
      },
    ],
  },

  // ================= 3. CLOTHING & PERSONAL SERVICES =================
  {
    id: "cat-clothing",
    code: "clothing",
    name: "Clothing and Personal Services",
    hindiName: "सिलाई और व्यक्तिगत सेवाएं",
    translationKey: "clothing",
    iconName: "Scissors",
    description: "Tailors, boutiques, embroidery artisans, laundry, barbers, and beauticians.",
    subcategories: [
      {
        id: "sub-tailor",
        code: "tailor",
        name: "Tailor & Garment Maker",
        hindiName: "दर्जी / सिलाई मास्टर",
        description: "Bespoke tailoring, blouse stitching, suits, alterations, and traditional wear.",
        fields: [
          {
            id: "garment_types",
            labelKey: "tailor.garments",
            defaultLabel: "Garments Crafted",
            type: "multiselect",
            options: [
              { value: "women_ethnic", label: "Saree Blouse, Kurti & Salwar Suit" },
              { value: "men_formal", label: "Men's Shirts, Trousers & Kurta" },
              { value: "traditional", label: "Traditional Regional Attire (e.g. Mekhela Sador)" },
              { value: "alterations", label: "Rapid Fitting & Alterations" },
            ],
            required: true,
          },
          {
            id: "alteration_services",
            labelKey: "tailor.alterationServices",
            defaultLabel: "Alteration Services Offered",
            type: "multiselect",
            options: [
              { value: "fitting", label: "Blouse, Kurti & Shirt Tightening / Loosening" },
              { value: "length_adjust", label: "Trouser / Skirt Length Shortening & Hemming" },
              { value: "zipper_replace", label: "Zipper & Button Replacement" },
              { value: "patch_restoration", label: "Tear Mending & Patch Restoration" },
            ],
          },
          {
            id: "custom_orders",
            labelKey: "tailor.customOrders",
            defaultLabel: "Custom Orders Accepted",
            type: "boolean",
          },
          {
            id: "turnaround_days",
            labelKey: "tailor.turnaround",
            defaultLabel: "Typical Turnaround Time (Days)",
            type: "number",
            placeholder: "e.g. 3",
          },
          {
            id: "provides_fabric",
            labelKey: "tailor.providesFabric",
            defaultLabel: "Can Provide Fabric / Lining Material",
            type: "boolean",
          },
        ],
      },
      {
        id: "sub-beautician",
        code: "beautician",
        name: "Beautician & Mehendi Artist",
        hindiName: "ब्यूटीशियन / मेहंदी कलाकार",
        description: "Bridal mehendi, skin care, hair styling, makeup, and salon services.",
        fields: [
          {
            id: "service_setting",
            labelKey: "beautician.setting",
            defaultLabel: "Service Location",
            type: "select",
            options: [
              { value: "doorstep", label: "Doorstep Home Service Only" },
              { value: "parlour", label: "Own Beauty Parlour" },
              { value: "both", label: "Both Parlour & Home Visits" },
            ],
          },
        ],
      },
    ],
  },

  // ================= 4. FOOD & HOSPITALITY =================
  {
    id: "cat-food",
    code: "food_hospitality",
    name: "Food and Hospitality",
    hindiName: "भोजन और खानपान",
    translationKey: "foodHospitality",
    iconName: "Utensils",
    description: "Tea stalls, street food vendors, tiffin services, home kitchens, and bakers.",
    subcategories: [
      {
        id: "sub-restaurant",
        code: "restaurant",
        name: "Restaurant & Local Eatery",
        hindiName: "रेस्तरां और भोजनालय",
        description: "Dine-in family restaurants, local dhabas, cafes, and regional specialty eateries.",
        requiresLicense: true,
        licenseName: "FSSAI Food Safety License / Registration",
        fields: [
          {
            id: "cuisine_types",
            labelKey: "restaurant.cuisine",
            defaultLabel: "Cuisine Specialization",
            type: "multiselect",
            options: [
              { value: "assamese_northeastern", label: "Assamese & Northeastern Traditional" },
              { value: "north_indian", label: "North Indian & Mughlai" },
              { value: "south_indian", label: "South Indian & Tiffin" },
              { value: "bengali", label: "Bengali Rice & Fish Dishes" },
              { value: "chinese_tibetan", label: "Indo-Chinese & Tibetan (Momos, Thukpa)" },
            ],
            required: true,
          },
          {
            id: "menu_highlights",
            labelKey: "restaurant.menu",
            defaultLabel: "Signature Menu Dishes",
            type: "text",
            placeholder: "e.g. Traditional Joha Rice Thali, Bamboo Shoot Pork/Fish, Dal Makhani",
          },
          {
            id: "dietary_type",
            labelKey: "restaurant.dietaryType",
            defaultLabel: "Dietary Category",
            type: "select",
            options: [
              { value: "pure_veg", label: "Pure Vegetarian (शुद्ध शाकाहारी)" },
              { value: "non_veg", label: "Non-Vegetarian & Halal Options" },
              { value: "both", label: "Separate Veg & Non-Veg Kitchens" },
            ],
          },
          {
            id: "fssai_license_number",
            labelKey: "restaurant.fssaiLicense",
            defaultLabel: "FSSAI License / Registration Number",
            type: "text",
            placeholder: "14-digit FSSAI Number (e.g. 10021000000000)",
            required: true,
          },
          {
            id: "seating_capacity",
            labelKey: "restaurant.capacity",
            defaultLabel: "Seating Capacity",
            type: "number",
            placeholder: "e.g. 35 seats",
          },
        ],
      },
      {
        id: "sub-street-food",
        code: "street_food",
        name: "Street Food & Tea Stall",
        hindiName: "चाय नाश्ता व ठेला विक्रेता",
        description: "Local snacks, chai, morning breakfast, and evening fast food.",
        fields: [
          {
            id: "stall_type",
            labelKey: "food.stallType",
            defaultLabel: "Stall Setup",
            type: "select",
            options: [
              { value: "mobile_cart", label: "Mobile Handcart / Thela" },
              { value: "fixed_kiosk", label: "Fixed Street Kiosk / Dhaba" },
              { value: "home_counter", label: "Front Porch / Window Stall" },
            ],
            required: true,
          },
          {
            id: "dietary_type",
            labelKey: "food.dietaryType",
            defaultLabel: "Dietary Preference",
            type: "select",
            options: [
              { value: "pure_veg", label: "Pure Vegetarian (शुद्ध शाकाहारी)" },
              { value: "non_veg", label: "Non-Vegetarian Available" },
              { value: "both", label: "Separate Veg / Non-Veg Sections" },
            ],
          },
          {
            id: "fssai_registered",
            labelKey: "food.fssaiRegistered",
            defaultLabel: "FSSAI Food Safety Registered",
            type: "boolean",
          },
          {
            id: "fssai_number",
            labelKey: "food.fssaiNumber",
            defaultLabel: "FSSAI Registration Number (Optional)",
            type: "text",
          },
        ],
      },
      {
        id: "sub-tiffin",
        code: "tiffin",
        name: "Home Tiffin & Meal Service",
        hindiName: "घर का टिफिन व भोजन",
        description: "Daily cooked home thalis, monthly meal subscriptions, and corporate lunch boxes.",
        fields: [
          {
            id: "monthly_plans",
            labelKey: "tiffin.monthlyPlans",
            defaultLabel: "Offers Monthly Tiffin Subscriptions",
            type: "boolean",
          },
          {
            id: "daily_capacity",
            labelKey: "tiffin.capacity",
            defaultLabel: "Daily Meal Capacity",
            type: "number",
            placeholder: "e.g. 50 meals / day",
          },
        ],
      },
    ],
  },

  // ================= 5. TRANSPORT & MOBILITY =================
  {
    id: "cat-transport",
    code: "transport",
    name: "Transport and Mobility",
    hindiName: "परिवहन और वाहन सेवाएं",
    translationKey: "transport",
    iconName: "Truck",
    description: "Auto drivers, local transport, small delivery vehicles, bike/car mechanics.",
    subcategories: [
      {
        id: "sub-mechanic",
        code: "mechanic",
        name: "Auto & Bike Mechanic",
        hindiName: "ऑटो व बाइक मैकेनिक",
        description: "Two-wheeler tuning, engine overhaul, tyre puncture, and roadside assistance.",
        fields: [
          {
            id: "vehicle_types",
            labelKey: "mechanic.vehicles",
            defaultLabel: "Supported Vehicles",
            type: "multiselect",
            options: [
              { value: "two_wheeler", label: "Motorcycles & Scooters" },
              { value: "auto_rickshaw", label: "Auto Rickshaws & E-Rickshaws" },
              { value: "four_wheeler", label: "Cars & Light Commercial Vehicles" },
            ],
            required: true,
          },
          {
            id: "repair_services",
            labelKey: "mechanic.repairServices",
            defaultLabel: "Repair Services Offered",
            type: "multiselect",
            options: [
              { value: "engine_overhaul", label: "Engine Overhaul & Tuning" },
              { value: "brake_clutch", label: "Brake & Clutch Repair" },
              { value: "electrical_battery", label: "Wiring, Self-Starter & Battery" },
              { value: "tyre_puncture", label: "Tyre Replacement & Puncture Repair" },
              { value: "oil_service", label: "Periodic Oil & Filter Change" },
            ],
          },
          {
            id: "roadside_assistance",
            labelKey: "mechanic.roadsideAssistance",
            defaultLabel: "Provides Roadside Assistance / Towing",
            type: "boolean",
          },
        ],
      },
    ],
  },

  // ================= 6. RETAIL & LOCAL SHOPS =================
  {
    id: "cat-retail",
    code: "retail_shops",
    name: "Retail and Local Shops",
    hindiName: "किराना और स्थानीय दुकानें",
    translationKey: "retailShops",
    iconName: "Store",
    description: "Kirana stores, hardware shops, stationery, electronics repair, and local goods.",
    subcategories: [
      {
        id: "sub-kirana",
        code: "kirana",
        name: "Kirana & General Store",
        hindiName: "किराना दुकान",
        description: "Daily groceries, grains, spices, packaged household goods, and toiletries.",
        fields: [
          {
            id: "home_delivery",
            labelKey: "retail.homeDelivery",
            defaultLabel: "Provides Free Local Home Delivery",
            type: "boolean",
          },
          {
            id: "accepts_digital_upi",
            labelKey: "retail.upi",
            defaultLabel: "Accepts All UPI QR Payments",
            type: "boolean",
          },
        ],
      },
    ],
  },

  // ================= 7. AGRICULTURE & RURAL BUSINESSES =================
  {
    id: "cat-agri",
    code: "agriculture",
    name: "Agriculture and Rural Businesses",
    hindiName: "कृषि और ग्रामीण उद्यम",
    translationKey: "agriculture",
    iconName: "Sprout",
    description: "Farmers, organic growers, nursery, seeds, tractor services, dairy, and fisheries.",
    subcategories: [
      {
        id: "sub-farmer",
        code: "farmer",
        name: "Farmer & Produce Seller",
        hindiName: "किसान / उपज विक्रेता",
        description: "Direct farm produce, seasonal fruits, vegetables, grains, and organic harvests.",
        fields: [
          {
            id: "crop_types",
            labelKey: "agri.crops",
            defaultLabel: "Crops & Produce",
            type: "text",
            placeholder: "e.g. Joha Rice, Assam Tea, Ginger, Mustard, Turmeric",
            required: true,
          },
          {
            id: "seasonal_availability",
            labelKey: "agri.seasons",
            defaultLabel: "Seasonal Availability",
            type: "multiselect",
            options: [
              { value: "kharif", label: "Kharif Season (Monsoon / Autumn Harvest)" },
              { value: "rabi", label: "Rabi Season (Winter / Spring Harvest)" },
              { value: "zaid", label: "Zaid Season (Summer Crop)" },
              { value: "year_round", label: "Year-Round Continuous Supply" },
            ],
          },
          {
            id: "organic_certified",
            labelKey: "agri.organic",
            defaultLabel: "Grown via Natural / Organic Practices",
            type: "boolean",
          },
          {
            id: "bulk_orders",
            labelKey: "agri.bulk",
            defaultLabel: "Bulk Wholesale Orders Accepted",
            type: "boolean",
          },
        ],
      },
    ],
  },

  // ================= 8. EDUCATION & PROFESSIONAL SERVICES =================
  {
    id: "cat-education",
    code: "education",
    name: "Education and Professional Services",
    hindiName: "शिक्षा और पेशेवर सेवाएं",
    translationKey: "education",
    iconName: "BookOpen",
    description: "Tutors, music/dance teachers, computer trainers, accountants, and translators.",
    subcategories: [
      {
        id: "sub-tutor",
        code: "tutor",
        name: "Home Tutor & Instructor",
        hindiName: "गृह शिक्षक / ट्यूटर",
        description: "School syllabus, mathematics, regional language learning, and foundational skills.",
        fields: [
          {
            id: "subjects_taught",
            labelKey: "tutor.subjects",
            defaultLabel: "Subjects Taught",
            type: "text",
            placeholder: "e.g. Mathematics, Science, Assamese, English",
            required: true,
          },
          {
            id: "education_levels",
            labelKey: "tutor.levels",
            defaultLabel: "Education Levels Tutored",
            type: "multiselect",
            options: [
              { value: "primary", label: "Primary (Classes 1–5)" },
              { value: "middle", label: "Middle School (Classes 6–8)" },
              { value: "secondary", label: "Secondary / 10th Board" },
              { value: "senior_secondary", label: "Higher Secondary / 12th Board" },
              { value: "competitive", label: "Foundational & Competitive Exams" },
            ],
            required: true,
          },
          {
            id: "teaching_languages",
            labelKey: "tutor.languages",
            defaultLabel: "Teaching & Explanation Languages",
            type: "multiselect",
            options: [
              { value: "as", label: "Assamese (অসমীয়া)" },
              { value: "hi", label: "Hindi (हिन्दी)" },
              { value: "bn", label: "Bengali (বাংলা)" },
              { value: "en", label: "English" },
              { value: "kha", label: "Khasi" },
              { value: "grt", label: "Garo" },
              { value: "bho", label: "Bhojpuri" },
            ],
          },
          {
            id: "instruction_medium",
            labelKey: "tutor.medium",
            defaultLabel: "Instruction Mediums",
            type: "multiselect",
            options: [
              { value: "vernacular", label: "Local Regional Mother Tongue" },
              { value: "hindi", label: "Hindi" },
              { value: "english", label: "English" },
            ],
          },
        ],
      },
    ],
  },

  // ================= 9. ARTISAN & TRADITIONAL OCCUPATIONS =================
  {
    id: "cat-artisan",
    code: "artisan_traditional",
    name: "Artisan and Traditional Occupations",
    hindiName: "हस्तशिल्प और पारंपरिक कला",
    translationKey: "artisanTradition",
    iconName: "Palette",
    description: "Weavers, handloom makers, bamboo/cane artisans, potters, folk artists, and metal smiths.",
    subcategories: [
      {
        id: "sub-handloom",
        code: "handloom",
        name: "Weaver & Handloom Artisan",
        hindiName: "बुनकर / हथकरघा कारीगर",
        description: "Handwoven textiles, traditional silk, cotton fabrics, and heritage shawls.",
        fields: [
          {
            id: "craft_type",
            labelKey: "artisan.craftType",
            defaultLabel: "Heritage Craft Type",
            type: "text",
            placeholder: "e.g. Eri/Muga Silk Weaving, Handloom Gamusa",
            required: true,
          },
          {
            id: "loom_type",
            labelKey: "artisan.loom",
            defaultLabel: "Loom Equipment Used",
            type: "select",
            options: [
              { value: "traditional_pit", label: "Traditional Pit Loom" },
              { value: "frame_loom", label: "Fly-shuttle Frame Loom" },
              { value: "backstrap", label: "Loin / Backstrap Loom" },
            ],
          },
          {
            id: "materials_used",
            labelKey: "artisan.materials",
            defaultLabel: "Raw Materials Used",
            type: "multiselect",
            options: [
              { value: "muga_silk", label: "Golden Muga Silk" },
              { value: "eri_silk", label: "Ahimsa Eri (Endi) Silk" },
              { value: "pure_cotton", label: "Natural Handspun Cotton" },
              { value: "bamboo_cane", label: "Local Bamboo & Wild Cane" },
              { value: "clay_terracotta", label: "Terracotta & River Clay" },
              { value: "bell_metal", label: "Bell Metal & Brass" },
            ],
          },
          {
            id: "portfolio_samples_count",
            labelKey: "artisan.samplesCount",
            defaultLabel: "Completed Masterpiece Portfolio Samples",
            type: "number",
            placeholder: "e.g. 12 pieces",
          },
          {
            id: "gi_tagged",
            labelKey: "artisan.giTagged",
            defaultLabel: "Produces Geographical Indication (GI) Tagged Heritage Crafts",
            type: "boolean",
          },
        ],
      },
      {
        id: "sub-bamboo-cane",
        code: "bamboo_cane",
        name: "Bamboo & Cane Artisan",
        hindiName: "बांस और बेंत कारीगर",
        description: "Traditional bamboo furniture, baskets, lampshades, and sustainable home decor.",
        fields: [
          {
            id: "product_styles",
            labelKey: "bamboo.styles",
            defaultLabel: "Product Range",
            type: "multiselect",
            options: [
              { value: "baskets_utility", label: "Utility Baskets & Sieves" },
              { value: "furniture", label: "Stools, Chairs & Tables" },
              { value: "home_decor", label: "Lamps, Wall Art & Planters" },
            ],
          },
        ],
      },
    ],
  },

  // ================= 10. HEALTH, CARE & WELLNESS =================
  {
    id: "cat-health",
    code: "health_wellness",
    name: "Health, Care and Wellness",
    hindiName: "स्वास्थ्य और देखभाल",
    translationKey: "healthWellness",
    iconName: "HeartPulse",
    description: "Elder-care nurses, physiotherapists, yoga instructors, and wellness assistants.",
    subcategories: [
      {
        id: "sub-caregiver",
        code: "caregiver",
        name: "Elder-Care & Nursing Assistant",
        hindiName: "देखभाल सहायक / परिचारक",
        description: "Bedside patient assistance, elderly companionship, medication schedules.",
        fields: [
          {
            id: "care_shifts",
            labelKey: "care.shifts",
            defaultLabel: "Available Shifts",
            type: "select",
            options: [
              { value: "day_shift", label: "Day Shift (8-10 Hours)" },
              { value: "night_shift", label: "Night Attendant" },
              { value: "24hr_live_in", label: "24-Hour Live-in Care" },
            ],
          },
        ],
      },
    ],
  },

  // ================= 11. EVENTS & OTHER SERVICES =================
  {
    id: "cat-events",
    code: "events_services",
    name: "Events and Other Services",
    hindiName: "उत्सव, कार्यक्रम व अन्य सेवाएं",
    translationKey: "eventsServices",
    iconName: "Award",
    description: "Tent decorators, caterers, photographers, sound technicians, and event crews.",
    subcategories: [
      {
        id: "sub-decorator",
        code: "decorator",
        name: "Tent & Light Decorator",
        hindiName: "टेंट और प्रकाश सज्जा",
        description: "Wedding mandaps, community pandals, sound systems, and lighting rigs.",
        fields: [
          {
            id: "event_scales",
            labelKey: "decorator.scales",
            defaultLabel: "Event Capacities Supported",
            type: "select",
            options: [
              { value: "small", label: "Small Gatherings (< 100 guests)" },
              { value: "medium", label: "Medium Events (100 - 500 guests)" },
              { value: "large", label: "Large Community Melas (> 500 guests)" },
            ],
          },
        ],
      },
    ],
  },
];

export function getCategoryByCode(code: string): BusinessCategory | undefined {
  return INDIAN_BUSINESS_CATEGORIES.find((c) => c.code === code);
}

export function getSubcategoryByCode(categoryCode: string, subcategoryCode: string): BusinessSubcategory | undefined {
  const cat = getCategoryByCode(categoryCode);
  return cat?.subcategories.find((s) => s.code === subcategoryCode);
}

// Multilingual search synonyms and vernacular trade aliases
export const VERNACULAR_TRADE_ALIASES: Record<string, { categoryCode: string; subcategoryCode?: string }> = {
  // Electrician aliases
  electrician: { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "बिजली मिस्त्री": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "इलेक्ट्रीशियन": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "bijli": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "ইলেক্ট্ৰিচিয়ান": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "ইলেকট্রিশিয়ান": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "மின்சார வல்லுநர்": { categoryCode: "home_repair", subcategoryCode: "electrician" },
  "ఎలక్ట్రీషియన్": { categoryCode: "home_repair", subcategoryCode: "electrician" },

  // Tailor aliases
  tailor: { categoryCode: "clothing", subcategoryCode: "tailor" },
  "दर्जी": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "darji": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "দৰ্জী": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "দর্জি": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "தையல்காரர்": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "దర్జీ": { categoryCode: "clothing", subcategoryCode: "tailor" },
  "शिंपी": { categoryCode: "clothing", subcategoryCode: "tailor" },

  // Carpenter aliases
  carpenter: { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "बढ़ई": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "badhai": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "বাঢ়ৈ": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "ছুতোর": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "தச்சர்": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "వడ్రంగి": { categoryCode: "home_repair", subcategoryCode: "carpenter" },
  "सुतार": { categoryCode: "home_repair", subcategoryCode: "carpenter" },

  // Plumber aliases
  plumber: { categoryCode: "home_repair", subcategoryCode: "plumber" },
  "नलकार": { categoryCode: "home_repair", subcategoryCode: "plumber" },
  "प्लम्बर": { categoryCode: "home_repair", subcategoryCode: "plumber" },
  "প্লাম্বাৰ": { categoryCode: "home_repair", subcategoryCode: "plumber" },
  "குழாய் பழுதுபார்ப்பவர்": { categoryCode: "home_repair", subcategoryCode: "plumber" },

  // Produce / Vegetable / Greens aliases
  produce: { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },
  "सब्जी": { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },
  "শাক-পাচলি": { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },
  "শাকসবজি": { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },
  "காய்கறி": { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },
  "కూరగాయలు": { categoryCode: "retail_commerce", subcategoryCode: "vegetable_vendor" },

  // Handloom / Weaving aliases
  handloom: { categoryCode: "arts_crafts", subcategoryCode: "handloom_weaver" },
  "हथकरघा": { categoryCode: "arts_crafts", subcategoryCode: "handloom_weaver" },
  "ताঁতশাল": { categoryCode: "arts_crafts", subcategoryCode: "handloom_weaver" },
  "கைத்தறி": { categoryCode: "arts_crafts", subcategoryCode: "handloom_weaver" },
};

export function searchTaxonomyMultilingual(query: string): {
  matchedCategory?: BusinessCategory;
  matchedSubcategory?: BusinessSubcategory;
  matchedTerm?: string;
} {
  if (!query || !query.trim()) return {};
  const clean = query.trim().toLowerCase();

  // 1. Direct alias match
  for (const [alias, target] of Object.entries(VERNACULAR_TRADE_ALIASES)) {
    if (clean.includes(alias.toLowerCase())) {
      const cat = getCategoryByCode(target.categoryCode);
      const sub = target.subcategoryCode && cat
        ? cat.subcategories.find((s) => s.code === target.subcategoryCode)
        : undefined;
      return { matchedCategory: cat, matchedSubcategory: sub, matchedTerm: alias };
    }
  }

  // 2. Name search across categories
  for (const cat of INDIAN_BUSINESS_CATEGORIES) {
    if (
      cat.name.toLowerCase().includes(clean) ||
      cat.hindiName.includes(clean) ||
      cat.description.toLowerCase().includes(clean)
    ) {
      return { matchedCategory: cat };
    }

    for (const sub of cat.subcategories) {
      if (
        sub.name.toLowerCase().includes(clean) ||
        sub.hindiName.includes(clean) ||
        sub.description.toLowerCase().includes(clean)
      ) {
        return { matchedCategory: cat, matchedSubcategory: sub };
      }
    }
  }

  return {};
}

export const BUSINESS_CATEGORIES = INDIAN_BUSINESS_CATEGORIES;

export function getCategoryById(idOrCode: string): BusinessCategory | undefined {
  return INDIAN_BUSINESS_CATEGORIES.find(
    (c) => c.id === idOrCode || c.code === idOrCode || c.id === `cat-${idOrCode}`
  );
}
