-- ============================================================================
-- KAAMSETU — PHASE 42: INDIA-WIDE EXPANSION & SCALABLE ARCHITECTURE
-- Migration: 20261121000001_phase42_india_wide_expansion_schema.sql
-- Classification: CLASS_B_CONTROLLED_ROLLOUT with Nationwide Decoupled Capabilities
-- Permanent Invariant: platform_commission_amount = 0.00
-- ============================================================================

-- 1. ADD GEOGRAPHIC COLUMNS TO PROFILES & WORKER PROFILES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT;

ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS locality TEXT;

-- Composite index for fast nationwide worker discovery
CREATE INDEX IF NOT EXISTS idx_worker_profiles_geo_full
  ON public.worker_profiles (state, district, city, pincode);

-- 2. SERVICE COVERAGE REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.service_coverage_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  state TEXT NOT NULL,
  districts TEXT[] NOT NULL DEFAULT '{}',
  pincode_ranges JSONB NOT NULL DEFAULT '[]'::jsonb,
  operating_tier TEXT NOT NULL DEFAULT 'pilot_verified'
    CHECK (operating_tier IN ('pilot_verified', 'controlled_rollout', 'nationwide_unrestricted', 'inactive')),
  capabilities JSONB NOT NULL DEFAULT '{
    "account_access": true,
    "profile_access": true,
    "discovery_access": true,
    "booking_access": false,
    "dispatch_access": false,
    "payment_access": false
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_coverage_state
  ON public.service_coverage_areas (state);

-- Seed Initial Service Coverage Zones
INSERT INTO public.service_coverage_areas (zone_code, zone_name, state, districts, pincode_ranges, operating_tier, capabilities, is_active)
VALUES
  (
    'ZONE-AS-01',
    'Guwahati Urban Cluster',
    'Assam',
    ARRAY['Kamrup Metropolitan'],
    '[{"start": "781001", "end": "781039"}]'::jsonb,
    'pilot_verified',
    '{"account_access": true, "profile_access": true, "discovery_access": true, "booking_access": true, "dispatch_access": true, "payment_access": true}'::jsonb,
    true
  ),
  (
    'ZONE-ML-01',
    'Shillong Urban Cluster',
    'Meghalaya',
    ARRAY['East Khasi Hills'],
    '[{"start": "793001", "end": "793022"}]'::jsonb,
    'pilot_verified',
    '{"account_access": true, "profile_access": true, "discovery_access": true, "booking_access": true, "dispatch_access": true, "payment_access": true}'::jsonb,
    true
  ),
  (
    'ZONE-WB-01',
    'Siliguri Transit Hub',
    'West Bengal',
    ARRAY['Darjeeling', 'Jalpaiguri'],
    '[{"start": "734001", "end": "734015"}]'::jsonb,
    'controlled_rollout',
    '{"account_access": true, "profile_access": true, "discovery_access": true, "booking_access": false, "dispatch_access": false, "payment_access": false}'::jsonb,
    true
  )
ON CONFLICT (zone_code) DO UPDATE SET
  operating_tier = EXCLUDED.operating_tier,
  capabilities = EXCLUDED.capabilities,
  is_active = true,
  updated_at = now();

-- 3. CUSTOM LOCALITIES & VILLAGES (Controlled Manual Entry Registry)
CREATE TABLE IF NOT EXISTS public.custom_localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  locality_name TEXT NOT NULL,
  pincode TEXT,
  locality_type TEXT NOT NULL DEFAULT 'village'
    CHECK (locality_type IN ('village', 'ward', 'colony', 'industrial_area', 'hamlet', 'town')),
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_localities_geo
  ON public.custom_localities (state, district, locality_name);

-- RLS policies for custom_localities
ALTER TABLE public.custom_localities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to custom localities"
  ON public.custom_localities FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to submit custom localities"
  ON public.custom_localities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. EXPAND OCCUPATIONS ACROSS 6 MANDATORY SECTORS
INSERT INTO public.occupations (id, name, hindi_name, slug, description, nsqf_level, icon_name, is_active)
VALUES
  -- Sector 1: Construction and Trades (additional to existing)
  ('11111111-1111-1111-1111-111111111109', 'Tile & Marble Masonry', 'टाइल एवं संगमरमर कारीगर', 'tile-marble-masonry', 'Ceramic, vitrified, Italian marble cutting, dry cladding, laser leveling and waterproof grouting.', 4, 'Layers', true),
  ('11111111-1111-1111-1111-111111111110', 'Structural Steel & Rigging', 'स्ट्रक्चरल स्टील एवं रिगिंग', 'structural-steel-rigging', 'Heavy steel truss fabrication, crane rigging, high-tensile bolting and industrial scaffolding.', 4, 'Anchor', true),

  -- Sector 2: Automotive and Machinery
  ('11111111-1111-1111-1111-111111111111', 'Commercial Heavy Vehicle Tech', 'वाणिज्यिक भारी वाहन तकनीक', 'commercial-heavy-vehicle-tech', 'Multi-axle truck powertrain, air brake overhauls, hydraulics and Bharat Stage VI SCR diagnostics.', 5, 'Truck', true),
  ('11111111-1111-1111-1111-111111111112', 'Two-Wheeler & EV Mechanic', 'दोपहिया एवं ईवी मैकेनिक', 'two-wheeler-ev-mechanic', 'Motorcycle transmission overhaul, BLDC motor controller diagnosis and lithium battery maintenance.', 4, 'Bike', true),
  ('11111111-1111-1111-1111-111111111113', 'Heavy Earthmoving Equipment', 'अर्थमूविंग मशीनरी ऑपरेटर', 'heavy-earthmoving-equipment', 'Excavator, backhoe loader, compactor operation, hydraulic pump pressure testing and safety rigging.', 4, 'SlidersHorizontal', true),

  -- Sector 3: Home and Personal Services
  ('11111111-1111-1111-1111-111111111114', 'Domestic & Commercial Appliance Tech', 'घरेलू उपकरण तकनीक', 'appliance-repair-tech', 'Inverter PCB troubleshooting, front-load washer bearings, microwave magnetrons and water purifiers.', 4, 'Cpu', true),
  ('11111111-1111-1111-1111-111111111115', 'Residential Housekeeping & Deep Clean', 'आवासीय हाउसकीपिंग एवं स्वच्छता', 'housekeeping-deep-cleaning', 'Industrial floor scrubbing, hospital-grade disinfection, upholstery extraction and sanitation.', 3, 'Sparkles', true),
  ('11111111-1111-1111-1111-111111111116', 'Elder & Healthcare Assistance', 'वृद्धजन एवं स्वास्थ्य सहायक', 'elder-healthcare-assistance', 'Geriatric patient mobilization, vital signs monitoring, medication compliance and first responder care.', 4, 'HeartPulse', true),

  -- Sector 4: Agriculture and Rural Work
  ('11111111-1111-1111-1111-111111111117', 'Micro-Irrigation & Solar Pumps', 'सूक्ष्म सिंचाई एवं सोलर पंप', 'micro-irrigation-solar-pumps', 'Drip and sprinkler network design, solar submersible pumps, venturi fertigation and automation.', 4, 'Droplets', true),
  ('11111111-1111-1111-1111-111111111118', 'Dairy & Animal Husbandry Specialist', 'डेयरी एवं पशुपालन विशेषज्ञ', 'dairy-animal-husbandry', 'Automated milking setups, feed formulation, cold chain bulk chilling and livestock care.', 4, 'Milk', true),
  ('11111111-1111-1111-1111-111111111119', 'Farm Machinery & Harvester Operator', 'कृषि मशीनरी ऑपरेटर', 'farm-machinery-operator', 'Tractor implements, combine harvesters, laser land leveling and grain processing machinery.', 4, 'Tractor', true),

  -- Sector 5: Transport and Logistics
  ('11111111-1111-1111-1111-111111111120', 'Commercial Heavy Logistics Driver', 'वाणिज्यिक भारी वाहन चालक', 'commercial-logistics-driver', 'Interstate container haulage, defensive driving, hazmat transport safety and GPS fleet telemetry.', 4, 'Navigation', true),
  ('11111111-1111-1111-1111-111111111121', 'Warehouse & Cold-Chain Inventory', 'गोदाम एवं कोल्ड-चेन इन्वेंटरी', 'warehouse-coldchain-inventory', 'WMS barcode scanning, forklift maneuvering, temperature-controlled staging and FIFO dispatch.', 3, 'Boxes', true),

  -- Sector 6: Digital and Professional Services
  ('11111111-1111-1111-1111-111111111122', 'Solar Site Surveyor & CAD Draftsperson', 'सोलर सर्वेक्षक एवं सीएडी ड्राफ्ट्समैन', 'solar-surveyor-cad-draftsperson', 'Shadow profiling, AutoCAD electrical schematics, string sizing and BOM documentation.', 5, 'Compass', true),
  ('11111111-1111-1111-1111-111111111123', 'Vernacular Voice & Community Outreach', 'क्षेत्रीय भाषा एवं सामुदायिक सहायक', 'vernacular-community-outreach', 'Multilingual customer facilitation, digital literacy onboarding, survey data collection and field liaison.', 3, 'Languages', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hindi_name = EXCLUDED.hindi_name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  is_active = true;

-- 5. SEED GRANULAR SKILLS ACROSS NEW OCCUPATIONS
INSERT INTO public.skills (id, occupation_id, name, hindi_name, slug, category)
VALUES
  -- Tile & Marble Masonry
  ('22222222-2222-2222-2222-222222220901', '11111111-1111-1111-1111-111111111109', 'Italian Marble Wet Polishing', 'इटैलियन मार्बल पॉलिशिंग', 'marble-polishing', 'Core Craft'),
  ('22222222-2222-2222-2222-222222220902', '11111111-1111-1111-1111-111111111109', 'Large Format Vitrified Tile Cutting', 'विट्रिफाइड टाइल कटिंग', 'large-format-tile-cutting', 'Specialization'),
  
  -- Two-Wheeler & EV Mechanic
  ('22222222-2222-2222-2222-222222221201', '11111111-1111-1111-1111-111111111112', 'BLDC Hub Motor Diagnostics', 'बीएलडीसी मोटर डायग्नोस्टिक्स', 'bldc-motor-diagnostics', 'Diagnostics'),
  ('22222222-2222-2222-2222-222222221202', '11111111-1111-1111-1111-111111111112', 'Lithium-Ion BMS Balancing', 'बीएमएस बैटरी बैलेंसिंग', 'bms-battery-balancing', 'Specialization'),

  -- Appliance Repair Tech
  ('22222222-2222-2222-2222-222222221401', '11111111-1111-1111-1111-111111111114', 'Inverter PCB Board Troubleshooting', 'इन्वर्टर पीसीबी मरम्मत', 'inverter-pcb-troubleshooting', 'Electronics'),
  ('22222222-2222-2222-2222-222222221402', '11111111-1111-1111-1111-111111111114', 'RO Water Purifier Membrane Service', 'आरओ झिल्ली एवं पंप सर्विस', 'ro-membrane-service', 'Core Craft'),

  -- Micro-Irrigation & Solar Pumps
  ('22222222-2222-2222-2222-222222221701', '11111111-1111-1111-1111-111111111117', 'Submersible Solar VFD Controller Tuning', 'सोलर वीएफडी कंट्रोलर ट्यूनिंग', 'solar-vfd-tuning', 'Specialization'),
  ('22222222-2222-2222-2222-222222221702', '11111111-1111-1111-1111-111111111117', 'Drip Lateral Flush & Pressure Regulation', 'ड्रिप सिंचाई दबाव विनियमन', 'drip-lateral-flush', 'Core Craft'),

  -- Commercial Logistics Driver
  ('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111120', 'Interstate Multi-Axle Haulage', 'मल्टी-एक्सल हेवी वाहन चालन', 'multi-axle-haulage', 'Operations'),
  ('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111120', 'Cold-Chain Refrigerated Telematics', 'कोल्ड-चेन वाहन मॉनिटरिंग', 'coldchain-telematics', 'Safety'),

  -- Solar Surveyor & CAD Draftsperson
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111122', 'Rooftop Helioscope Shadow Analysis', 'रूफटॉप छाया विश्लेषण', 'helioscope-shadow-analysis', 'Design'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111122', 'AutoCAD Single Line Electrical Diagram', 'ऑटोकैड सिंगल लाइन आरेख', 'autocad-sld-drafting', 'Core Craft')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hindi_name = EXCLUDED.hindi_name,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category;
