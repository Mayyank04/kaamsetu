-- ============================================================================
-- KAAMSETU SOVEREIGN DIGITAL IDENTITY PLATFORM
-- Seed Data: 10 Occupations, Verified Skills, Multi-Tier Profiles, Bookings,
-- Portfolio Showcases, Reviews, and Cryptographic Work Records
-- ============================================================================

-- Clean existing demo data if re-seeding
TRUNCATE TABLE public.work_records, public.reviews, public.bookings, public.portfolio,
               public.worker_skills, public.worker_profiles, public.skills,
               public.occupations, public.profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. OCCUPATIONS (10 Distinct National Trade Categories)
-- ----------------------------------------------------------------------------
INSERT INTO public.occupations (id, name, hindi_name, slug, description, nsqf_level, icon_name, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'Electrical & Solar', 'विद्युत एवं सौर ऊर्जा', 'electrical-solar', 'Industrial wiring, solar grid integration, phase balancing, and commercial substations.', 4, 'Zap', true),
('11111111-1111-1111-1111-111111111102', 'Carpentry & Joinery', 'बढ़ईगीरी एवं काष्ठकला', 'carpentry-joinery', 'Architectural woodwork, modular cabinetry, antique restoration, and joinery.', 4, 'Hammer', true),
('11111111-1111-1111-1111-111111111103', 'Plumbing & Sanitation', 'प्लंबिंग एवं स्वच्छता', 'plumbing-sanitation', 'CPVC high-pressure piping, concealed copper fittings, and hydropneumatic pump systems.', 3, 'Wrench', true),
('11111111-1111-1111-1111-111111111104', 'Construction & Civil', 'निर्माण एवं सिविल', 'construction-civil', 'Reinforced concrete, stone masonry, shuttering, and structural scaffolding.', 4, 'Layers', true),
('11111111-1111-1111-1111-111111111105', 'Handloom & Heritage Textiles', 'हथकरघा एवं कपड़ा शिल्प', 'handloom-textiles', 'Pit loom silk weaving, gold thread zardozi, jacquard brocade, and natural dyeing.', 5, 'Sparkles', true),
('11111111-1111-1111-1111-111111111106', 'Automotive & EV Tech', 'वाहन एवं ईवी तकनीक', 'automotive-ev', 'Commercial diesel engines, EV battery retrofits, CAN-bus, and hydraulic brakes.', 4, 'Cpu', true),
('11111111-1111-1111-1111-111111111107', 'Sustainable Agri & Farming', 'टिकाऊ कृषि एवं एग्रीटेक', 'sustainable-agritech', 'Closed-loop hydroponics, drip fertigation, soil health, and polyhouse climate management.', 4, 'ShieldCheck', true),
('11111111-1111-1111-1111-111111111108', 'HVAC & Cold Chain', 'वातानुकूलन एवं कोल्ड चेन', 'hvac-refrigeration', 'VRV/VRF ducting, inverter compressor overhaul, industrial chillers, and refrigerant recovery.', 4, 'Activity', true),
('11111111-1111-1111-1111-111111111109', 'Metalcraft & Fabrication', 'धातुकला एवं वेल्डिंग', 'metalcraft-fabrication', 'TIG/MIG precision welding, structural trusses, laser sheet bending, and CNC tooling.', 4, 'ShieldCheck', true),
('11111111-1111-1111-1111-111111111110', 'Home Healthcare & Caregiving', 'गृह स्वास्थ्य सेवा एवं देखभाल', 'home-healthcare', 'Post-operative bedside care, geriatric mobility therapy, vitals monitoring, and palliative assistance.', 4, 'Users', true);

-- ----------------------------------------------------------------------------
-- 2. SKILLS (Comprehensive Competencies for Each Occupation)
-- ----------------------------------------------------------------------------
INSERT INTO public.skills (id, occupation_id, name, hindi_name, slug, category) VALUES
-- Electrical
('22222222-2222-2222-2222-222222220101', '11111111-1111-1111-1111-111111111101', '3-Phase Inverter Synchronization', '3-फेज इन्वर्टर तुल्यकालन', '3-phase-inverters', 'Specialization'),
('22222222-2222-2222-2222-222222220102', '11111111-1111-1111-1111-111111111101', 'Rooftop Solar Array Mounts', 'रूफटॉप सोलर पैनल माउंटिंग', 'rooftop-solar', 'Core Craft'),
('22222222-2222-2222-2222-222222220103', '11111111-1111-1111-1111-111111111101', 'MCB Distribution & Load Balance', 'एमसीबी वितरण एवं लोड संतुलन', 'mcb-distribution', 'Safety & Standards'),
-- Carpentry
('22222222-2222-2222-2222-222222220201', '11111111-1111-1111-1111-111111111102', 'Teakwood Mortise & Tenon', 'सागवान लकड़ी की जोड़ाई', 'teak-mortise-tenon', 'Core Craft'),
('22222222-2222-2222-2222-222222220202', '11111111-1111-1111-1111-111111111102', 'Modular Kitchen Carcass Assembly', 'मॉड्यूलर किचन फ्रेमिंग', 'modular-kitchens', 'Specialization'),
('22222222-2222-2222-2222-222222220203', '11111111-1111-1111-1111-111111111102', 'Antique Wood Restoration', 'प्राचीन लकड़ी जीर्णोद्धार', 'antique-restoration', 'Specialization'),
-- Plumbing
('22222222-2222-2222-2222-222222220301', '11111111-1111-1111-1111-111111111103', 'Concealed CPVC Piping', 'कंसील्ड सीपीवीसी पाइपिंग', 'concealed-cpvc', 'Core Craft'),
('22222222-2222-2222-2222-222222220302', '11111111-1111-1111-1111-111111111103', 'Hydropneumatic Booster Calibration', 'हाइड्रोन्यूमेटिक बूस्टर पंप', 'booster-pumps', 'Equipment & Tools'),
-- Construction
('22222222-2222-2222-2222-222222220401', '11111111-1111-1111-1111-111111111104', 'RCC Beam Shuttering', 'आरसीसी शटरिंग', 'rcc-shuttering', 'Core Craft'),
('22222222-2222-2222-2222-222222220402', '11111111-1111-1111-1111-111111111104', 'Laser Leveling & Plumb Align', 'लेज़र लेवलिंग', 'laser-leveling', 'Equipment & Tools'),
-- Handloom
('22222222-2222-2222-2222-222222220501', '11111111-1111-1111-1111-111111111105', 'Jacquard Brocade Weaving', 'बनारसी जरी ब्रोकेड', 'jacquard-brocade', 'Core Craft'),
('22222222-2222-2222-2222-222222220502', '11111111-1111-1111-1111-111111111105', 'Real Gold Thread Zardozi', 'असली जरदोजी काम', 'gold-zardozi', 'Specialization'),
-- Automotive
('22222222-2222-2222-2222-222222220601', '11111111-1111-1111-1111-111111111106', 'High-Voltage EV Isolation', 'हाई-वोल्टेज ईवी सुरक्षा', 'ev-high-voltage', 'Safety & Standards'),
('22222222-2222-2222-2222-222222220602', '11111111-1111-1111-1111-111111111106', 'CRDI Injector Tuning', 'सीआरडीआई डीजल इंजेक्टर', 'crdi-tuning', 'Core Craft'),
-- Agri
('22222222-2222-2222-2222-222222220701', '11111111-1111-1111-1111-111111111107', 'Closed-Loop NFT Hydroponics', 'हाइड्रोपोनिक्स सिस्टम', 'nft-hydroponics', 'Core Craft'),
('22222222-2222-2222-2222-222222220702', '11111111-1111-1111-1111-111111111107', 'Automated EC/pH Fertigation', 'सटीक उर्वरक नियंत्रण', 'fertigation-control', 'Specialization'),
-- HVAC
('22222222-2222-2222-2222-222222220801', '11111111-1111-1111-1111-111111111108', 'VRF/VRV Inverter Diagnostics', 'वीआरवी इन्वर्टर एसी', 'vrf-diagnostics', 'Core Craft'),
('22222222-2222-2222-2222-222222220802', '11111111-1111-1111-1111-111111111108', 'R32 Refrigerant Recovery & Brazing', 'आर32 गैस ब्रेजिंग', 'refrigerant-recovery', 'Safety & Standards'),
-- Metalcraft
('22222222-2222-2222-2222-222222220901', '11111111-1111-1111-1111-111111111109', 'TIG Stainless Steel Welding', 'टीआईजी स्टेनलेस स्टील वेल्डिंग', 'tig-welding', 'Core Craft'),
('22222222-2222-2222-2222-222222220902', '11111111-1111-1111-1111-111111111109', 'Heavy Industrial Truss Erection', 'औद्योगिक शेड ट्रस्ट निर्माण', 'industrial-truss', 'Specialization'),
-- Healthcare
('22222222-2222-2222-2222-222222221001', '11111111-1111-1111-1111-111111111110', 'Post-Op Patient Mobilization', 'ऑपरेशन के बाद फिजियो देखभाल', 'post-op-mobility', 'Core Craft'),
('22222222-2222-2222-2222-222222221002', '11111111-1111-1111-1111-111111111110', 'Clinical Vitals & Oxygen Telemetry', 'ऑक्सीजन एवं वाइटल्स निगरानी', 'vitals-telemetry', 'Safety & Standards');

-- ----------------------------------------------------------------------------
-- 3. USERS & PROFILES (Mock Auth IDs for Workers and Customers)
-- ----------------------------------------------------------------------------
-- Worker 1: Rameshwar Sharma
INSERT INTO public.profiles (id, role, full_name, phone, is_verified) VALUES
('33333333-3333-3333-3333-333333330001', 'worker', 'Rameshwar Sharma', '+919829044029', true),
-- Worker 2: Sunita Devi
('33333333-3333-3333-3333-333333330002', 'worker', 'Sunita Devi', '+919450017819', true),
-- Worker 3: Mohammed Rafiq
('33333333-3333-3333-3333-333333330003', 'worker', 'Mohammed Rafiq', '+919822055120', true),
-- Worker 4: Ananya Murugan
('33333333-3333-3333-3333-333333330004', 'worker', 'Ananya Murugan', '+919880099204', true),
-- Worker 5: Jagdish Meena (Plumber)
('33333333-3333-3333-3333-333333330005', 'worker', 'Jagdish Meena', '+919711033211', true),
-- Worker 6: Gurpreet Singh (Civil / Mason)
('33333333-3333-3333-3333-333333330006', 'worker', 'Gurpreet Singh', '+919814088451', true),
-- Worker 7: Lakshmi Narayan (Carpentry)
('33333333-3333-3333-3333-333333330007', 'worker', 'Lakshmi Narayan', '+919444066120', true),
-- Worker 8: Arun Patel (HVAC)
('33333333-3333-3333-3333-333333330008', 'worker', 'Arun Patel', '+919825077309', true),
-- Worker 9: Vikram Thakur (Welding)
('33333333-3333-3333-3333-333333330009', 'worker', 'Vikram Thakur', '+919816022198', true),
-- Worker 10: Sister Preeti Kulkarni (Home Care - Draft/Unpublished to test RLS!)
('33333333-3333-3333-3333-333333330010', 'worker', 'Preeti Kulkarni', '+919820011400', false),

-- Customers
('44444444-4444-4444-4444-444444440001', 'customer', 'Vikrant Singhania', '+919811099881', true),
('44444444-4444-4444-4444-444444440002', 'contractor', 'DLF Luxury Projects Lead', '+919810055442', true),
('44444444-4444-4444-4444-444444440003', 'customer', 'Pooja Agarwal', '+919920044113', true);

-- ----------------------------------------------------------------------------
-- 4. WORKER PROFILES (Covering 9+ Occupations with Unique Slugs)
-- ----------------------------------------------------------------------------
INSERT INTO public.worker_profiles (
  id, user_id, registry_id, slug, occupation_id, headline, bio,
  years_experience, daily_rate_min, daily_rate_max, city, state, pincode,
  languages, kaamscore, kaamscore_level, aadhaar_verified, digilocker_linked, is_published, availability_status
) VALUES
-- 1. Electrical & Solar: Rameshwar Sharma (Jaipur)
('55555555-5555-5555-5555-555555550001', '33333333-3333-3333-3333-333333330001', 'IN-RJ-2026-4029-KS', 'rameshwar-sharma-jaipur',
 '11111111-1111-1111-1111-111111111101', 'Master Industrial Electrician & Solar Grid Specialist',
 'Specialized in 10kW to 100kW rooftop industrial solar arrays, zero-fault 3-phase commercial wiring, and safety earthing.',
 14, 1100.00, 1700.00, 'Jaipur', 'Rajasthan', '302001', ARRAY['Hindi', 'Marwari', 'English'], 842, 4, true, true, true, 'available'),

-- 2. Handloom Textiles: Sunita Devi (Varanasi)
('55555555-5555-5555-5555-555555550002', '33333333-3333-3333-3333-333333330002', 'IN-UP-2026-7819-KS', 'sunita-devi-varanasi',
 '11111111-1111-1111-1111-111111111105', 'Master Handloom Weaver & Zardozi Artisan',
 'Third-generation master weaver preserving authentic Banarasi kadhwa brocades and GI-tagged silk textiles.',
 18, 1200.00, 2200.00, 'Varanasi', 'Uttar Pradesh', '221001', ARRAY['Hindi', 'Bhojpuri'], 876, 4, true, true, true, 'available'),

-- 3. Automotive & EV: Mohammed Rafiq (Pune)
('55555555-5555-5555-5555-555555550003', '33333333-3333-3333-3333-333333330003', 'IN-MH-2026-5120-KS', 'mohammed-rafiq-pune',
 '11111111-1111-1111-1111-111111111106', 'Heavy Fleet Diesel & EV Retrofitting Specialist',
 'Commercial truck diesel-to-electric conversion, telematics calibration, and high-voltage isolation safety.',
 16, 1400.00, 2400.00, 'Pune', 'Maharashtra', '411018', ARRAY['Hindi', 'Marathi', 'English'], 815, 3, true, true, true, 'available'),

-- 4. Sustainable Agri: Ananya Murugan (Bengaluru)
('55555555-5555-5555-5555-555555550004', '33333333-3333-3333-3333-333333330004', 'IN-KA-2026-9204-KS', 'ananya-murugan-bengaluru',
 '11111111-1111-1111-1111-111111111107', 'Sustainable Agritech & Hydroponics Lead',
 'Consulting commercial hydroponic setups, automated nutrient dosing, and zero-pesticide urban vertical micro-farms.',
 9, 1300.00, 2100.00, 'Bengaluru', 'Karnataka', '560064', ARRAY['Kannada', 'Tamil', 'English', 'Hindi'], 798, 3, true, true, true, 'available'),

-- 5. Plumbing: Jagdish Meena (Delhi NCR)
('55555555-5555-5555-5555-555555550005', '33333333-3333-3333-3333-333333330005', 'IN-DL-2026-3310-KS', 'jagdish-meena-delhi',
 '11111111-1111-1111-1111-111111111103', 'Master Sanitary Engineer & High-Pressure Piping Specialist',
 'Expert in multi-story concealed CPVC piping, grease interceptor plants, and water treatment loops.',
 12, 950.00, 1600.00, 'New Delhi', 'Delhi', '110025', ARRAY['Hindi'], 760, 3, true, true, true, 'available'),

-- 6. Construction: Gurpreet Singh (Amritsar)
('55555555-5555-5555-5555-555555550006', '33333333-3333-3333-3333-333333330006', 'IN-PB-2026-8812-KS', 'gurpreet-singh-amritsar',
 '11111111-1111-1111-1111-111111111104', 'Senior RCC Structural & Stone Masonry Craftsman',
 'Specializing in seismic-compliant structural beam shuttering and heritage stone cladding for grand residences.',
 15, 1000.00, 1750.00, 'Amritsar', 'Punjab', '143001', ARRAY['Punjabi', 'Hindi'], 830, 4, true, true, true, 'available'),

-- 7. Carpentry: Lakshmi Narayan (Chennai)
('55555555-5555-5555-5555-555555550007', '33333333-3333-3333-3333-333333330007', 'IN-TN-2026-6641-KS', 'lakshmi-narayan-chennai',
 '11111111-1111-1111-1111-111111111102', 'Architectural Teak Joiner & Modular Specialist',
 'Traditional Chettinad carved woodwork combined with German Blum hardware modular kitchen integration.',
 17, 1150.00, 1900.00, 'Chennai', 'Tamil Nadu', '600004', ARRAY['Tamil', 'English', 'Telugu'], 855, 4, true, true, true, 'available'),

-- 8. HVAC: Arun Patel (Surat)
('55555555-5555-5555-5555-555555550008', '33333333-3333-3333-3333-333333330008', 'IN-GJ-2026-7714-KS', 'arun-patel-surat',
 '11111111-1111-1111-1111-111111111108', 'Commercial Cold Storage & VRV Inverter Technician',
 'Industrial diamond polishing plant climate maintenance and pharmaceutical cold chain emergency repair.',
 11, 1200.00, 2000.00, 'Surat', 'Gujarat', '395003', ARRAY['Gujarati', 'Hindi'], 785, 3, true, true, true, 'available'),

-- 9. Metalcraft: Vikram Thakur (Shimla)
('55555555-5555-5555-5555-555555550009', '33333333-3333-3333-3333-333333330009', 'IN-HP-2026-2219-KS', 'vikram-thakur-shimla',
 '11111111-1111-1111-1111-111111111109', 'Certified High-Altitude Structural TIG Welder',
 'Steep-slope steel truss engineering, wrought iron architectural railings, and seismic steel joints.',
 13, 1100.00, 1850.00, 'Shimla', 'Himachal Pradesh', '171001', ARRAY['Hindi', 'Pahari'], 810, 3, true, true, true, 'available'),

-- 10. UNPUBLISHED (DRAFT) PROFILE FOR RLS VERIFICATION: Preeti Kulkarni (Mumbai)
('55555555-5555-5555-5555-555555550010', '33333333-3333-3333-3333-333333330010', 'IN-MH-2026-9901-KS', 'preeti-kulkarni-mumbai',
 '11111111-1111-1111-1111-111111111110', 'Geriatric Care & Post-Operative Nurse Assistant',
 'Draft profile undergoing Aadhaar verification. Must NOT appear in public searches.',
 7, 850.00, 1400.00, 'Mumbai', 'Maharashtra', '400001', ARRAY['Marathi', 'Hindi', 'English'], 540, 1, false, false, false, 'unavailable');

-- ----------------------------------------------------------------------------
-- 5. WORKER SKILLS JUNCTION
-- ----------------------------------------------------------------------------
INSERT INTO public.worker_skills (worker_profile_id, skill_id, years_practiced, is_primary, verified_by_peer_count) VALUES
('55555555-5555-5555-5555-555555550001', '22222222-2222-2222-2222-222222220101', 12, true, 8),
('55555555-5555-5555-5555-555555550001', '22222222-2222-2222-2222-222222220102', 10, true, 11),
('55555555-5555-5555-5555-555555550002', '22222222-2222-2222-2222-222222220501', 18, true, 14),
('55555555-5555-5555-5555-555555550002', '22222222-2222-2222-2222-222222220502', 15, true, 9),
('55555555-5555-5555-5555-555555550003', '22222222-2222-2222-2222-222222220601', 6, true, 7),
('55555555-5555-5555-5555-555555550003', '22222222-2222-2222-2222-222222220602', 16, true, 12),
('55555555-5555-5555-5555-555555550004', '22222222-2222-2222-2222-222222220701', 9, true, 10),
('55555555-5555-5555-5555-555555550005', '22222222-2222-2222-2222-222222220301', 12, true, 8),
('55555555-5555-5555-5555-555555550006', '22222222-2222-2222-2222-222222220401', 15, true, 13),
('55555555-5555-5555-5555-555555550007', '22222222-2222-2222-2222-222222220201', 17, true, 15),
('55555555-5555-5555-5555-555555550008', '22222222-2222-2222-2222-222222220801', 11, true, 6),
('55555555-5555-5555-5555-555555550009', '22222222-2222-2222-2222-222222220901', 13, true, 9);

-- ----------------------------------------------------------------------------
-- 6. PORTFOLIO SHOWCASE
-- ----------------------------------------------------------------------------
INSERT INTO public.portfolio (worker_profile_id, title, description, image_url, project_date, category) VALUES
('55555555-5555-5555-5555-555555550001', '85kW Rooftop Industrial Solar Array', 'Turnkey installation with string inverter sync at Jaipur logistics park.', 'https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=800&q=80', '2025-09-15', 'Commercial Solar'),
('55555555-5555-5555-5555-555555550002', 'Heritage Banarasi Kadhwa Brocade Saree', 'Pure silk zari woven over 90 days for national craft exhibition.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', '2024-06-30', 'Handloom'),
('55555555-5555-5555-5555-555555550003', '40 Commercial Truck Fleet EV Conversion', 'Replaced heavy diesel powertrains with dual LFP battery modules.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', '2025-01-30', 'EV Retrofitting'),
('55555555-5555-5555-5555-555555550004', '30,000 sq ft Commercial Hydroponic Greenery', '92% water conservation hydroponic leafy greens farm in Yelahanka.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', '2025-04-15', 'Hydroponics');

-- ----------------------------------------------------------------------------
-- 7. BOOKINGS (Transactions & Service Contracts)
-- ----------------------------------------------------------------------------
INSERT INTO public.bookings (
  id, booking_reference, customer_id, worker_profile_id, service_title,
  description, location_address, location_city, scheduled_start, estimated_cost, final_cost, status
) VALUES
-- Booking 1: Completed Booking for Rameshwar Sharma (Eligible for Review!)
('66666666-6666-6666-6666-666666660001', 'BK-2025-4011',
 '44444444-4444-4444-4444-444444440001', '55555555-5555-5555-5555-555555550001',
 'Commercial Solar Grid Inverter Sync', 'Complete diagnostic test and earthing grid connection for 50kW array.',
 'Plot 42, Sitapura Industrial Area', 'Jaipur', '2025-10-10 09:00:00+05:30', 14500.00, 14500.00, 'completed'),

-- Booking 2: Confirmed Upcoming Booking for Mohammed Rafiq
('66666666-6666-6666-6666-666666660002', 'BK-2026-1092',
 '44444444-4444-4444-4444-444444440002', '55555555-5555-5555-5555-555555550003',
 'Fleet EV Battery Thermal Diagnostic', 'Periodic maintenance on 8 commercial trucks retrofitted with LFP packs.',
 'Warehouse 12, MIDC Bhosari', 'Pune', '2026-12-01 10:00:00+05:30', 22000.00, NULL, 'confirmed'),

-- Booking 3: Completed Booking for Sunita Devi
('66666666-6666-6666-6666-666666660003', 'BK-2025-9921',
 '44444444-4444-4444-4444-444444440003', '55555555-5555-5555-5555-555555550002',
 'Commission of 2 Heritage Kadwa Brocades', 'Pure mulberry silk with antique gold zardozi patterns for wedding trousseau.',
 'Ghat Road, Godowlia', 'Varanasi', '2025-08-01 11:00:00+05:30', 48000.00, 48000.00, 'completed');

-- ----------------------------------------------------------------------------
-- 8. REVIEWS (Tied to Completed Bookings)
-- ----------------------------------------------------------------------------
INSERT INTO public.reviews (
  booking_id, customer_id, worker_profile_id, rating, quality_rating, punctuality_rating, comment, contractor_signed
) VALUES
-- Review 1 for Rameshwar Sharma (Tied to Booking 1)
('66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440001', '55555555-5555-5555-5555-555555550001',
 5, 5, 5, 'Rameshwarji completed the inverter synchronization in record time. Zero leakage current detected by DISCOM engineers. Highest level of professionalism.', true),

-- Review 2 for Sunita Devi (Tied to Booking 3)
('66666666-6666-6666-6666-666666660003', '44444444-4444-4444-4444-444444440003', '55555555-5555-5555-5555-555555550002',
 5, 5, 5, 'The Banarasi silk brocade delivered by Sunita Devi is pure museum quality. Every weft and motif is impeccable. Honored to have her work in our family.', true);

-- ----------------------------------------------------------------------------
-- 9. WORK RECORDS (Verified Cryptographic Experience Log)
-- ----------------------------------------------------------------------------
INSERT INTO public.work_records (
  worker_profile_id, booking_id, project_title, contractor_or_client, location,
  start_date, end_date, hours_logged, trade_category, verified_by_contractor, verification_hash
) VALUES
('55555555-5555-5555-5555-555555550001', '66666666-6666-6666-6666-666666660001',
 'Commercial Solar Grid Inverter Sync', 'Rajasthan Warehousing Corp', 'Sitapura, Jaipur',
 '2025-10-01', '2025-10-10', 48.00, 'Electrical & Solar', true, 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),

('55555555-5555-5555-5555-555555550002', '66666666-6666-6666-6666-666666660003',
 'Heritage Silk Bridal Commission', 'Varanasi Artisan Cooperative', 'Kashi, Varanasi',
 '2025-05-01', '2025-08-01', 280.00, 'Handloom & Heritage Textiles', true, 'sha256_f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2');
