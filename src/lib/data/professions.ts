export interface ProfessionCategory {
  id: string;
  slug: string;
  title: string;
  hindiTitle: string;
  description: string;
  workerCount: number;
  popularSkills: string[];
  icon: string;
  averageDailyRate: { min: number; max: number };
}

export const PROFESSIONS_DATA: ProfessionCategory[] = [
  {
    id: "prof-1",
    slug: "electrical-solar",
    title: "Electrical & Solar",
    hindiTitle: "विद्युत एवं सौर ऊर्जा",
    description: "Industrial wiring, solar grid installation, phase load balancing, and high-voltage maintenance.",
    workerCount: 28450,
    popularSkills: ["3-Phase Inverters", "Rooftop Solar Array", "MCB Distribution", "Industrial Earthing"],
    icon: "Zap",
    averageDailyRate: { min: 950, max: 1600 },
  },
  {
    id: "prof-2",
    slug: "carpentry-joinery",
    title: "Carpentry & Joinery",
    hindiTitle: "बढ़ईगीरी एवं काष्ठकला",
    description: "Architectural woodwork, modular cabinetry, antique furniture restoration, and structural framing.",
    workerCount: 22180,
    popularSkills: ["Teak Joinery", "Modular Kitchens", "Plunge Routers", "Architectural Woodwork"],
    icon: "Hammer",
    averageDailyRate: { min: 900, max: 1500 },
  },
  {
    id: "prof-3",
    slug: "plumbing-sanitation",
    title: "Plumbing & Sanitation",
    hindiTitle: "प्लंबिंग एवं स्वच्छता",
    description: "High-pressure piping, concealed copper fittings, water filtration setups, and civic drainage.",
    workerCount: 19800,
    popularSkills: ["CPVC Concealed Piping", "Hydro-pneumatic Pumps", "Grease Traps", "Sanitary Fixtures"],
    icon: "Wrench",
    averageDailyRate: { min: 850, max: 1400 },
  },
  {
    id: "prof-4",
    slug: "construction-civil",
    title: "Construction & Civil",
    hindiTitle: "निर्माण एवं सिविल",
    description: "Reinforced concrete, masonry, architectural plastering, shuttering, and structural scaffolding.",
    workerCount: 46200,
    popularSkills: ["RCC Shuttering", "Laser Leveling", "Stone Cladding", "Structural Scaffolding"],
    icon: "Layers",
    averageDailyRate: { min: 800, max: 1350 },
  },
  {
    id: "prof-5",
    slug: "handloom-textiles",
    title: "Handloom & Heritage Textiles",
    hindiTitle: "हथकरघा एवं कपड़ा शिल्प",
    description: "Pit loom weaving, pure silk zardozi, block printing, and heritage organic dye formulations.",
    workerCount: 14300,
    popularSkills: ["Jacquard Weaving", "Zardozi Gold Thread", "Natural Indigo Dyeing", "Tussar Silk Processing"],
    icon: "Sparkles",
    averageDailyRate: { min: 750, max: 1500 },
  },
  {
    id: "prof-6",
    slug: "automotive-ev",
    title: "Automotive & EV Retrofitting",
    hindiTitle: "वाहन एवं ईवी तकनीक",
    description: "Commercial diesel engines, EV battery pack diagnostics, suspension tuning, and transmission overhaul.",
    workerCount: 17900,
    popularSkills: ["BMS Diagnostics", "Diesel Injector Tuning", "OBD-II Scanning", "Hydraulic Brakes"],
    icon: "Cpu",
    averageDailyRate: { min: 1000, max: 1800 },
  },
  {
    id: "prof-7",
    slug: "sustainable-agritech",
    title: "Sustainable Agri & Farming",
    hindiTitle: "टिकाऊ कृषि एवं एग्रीटेक",
    description: "Micro-drip irrigation, polyhouse management, organic compost formulations, and hydroponic towers.",
    workerCount: 12400,
    popularSkills: ["Drip Fertigation", "Polyhouse Climate Control", "Soil pH Testing", "Hydroponic Media"],
    icon: "ShieldCheck",
    averageDailyRate: { min: 700, max: 1300 },
  },
  {
    id: "prof-8",
    slug: "hvac-refrigeration",
    title: "HVAC & Commercial Cold Chain",
    hindiTitle: "वातानुकूलन एवं कोल्ड चेन",
    description: "Inverter compressor repair, VRV/VRF ducting, chilled water plants, and cold storage maintenance.",
    workerCount: 16700,
    popularSkills: ["VRF System Diagnostics", "R32/R410A Refrigerant Recovery", "Copper Brazing", "Air Balancing"],
    icon: "Activity",
    averageDailyRate: { min: 1100, max: 1900 },
  },
];
