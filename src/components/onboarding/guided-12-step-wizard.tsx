"use client";

import * as React from "react";
import {
  SupportedLanguageCode,
  ApprovedProfileSubmission,
  SUPPORTED_LANGUAGES,
} from "@/schemas/onboarding.schema";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { PROFESSIONS_DATA } from "@/lib/data/professions";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import {
  Globe,
  User,
  MapPin,
  Briefcase,
  Wrench,
  Clock,
  Phone,
  Camera,
  CheckCircle2,
  Save,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
  Store,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Guided12StepWizardProps {
  initialLanguage?: SupportedLanguageCode;
  onComplete: (data: ApprovedProfileSubmission) => void;
  isSubmitting?: boolean;
}

const STORAGE_GUIDED_DRAFT_KEY = "kaamsetu_guided_onboarding_draft";

export function Guided12StepWizard({
  initialLanguage = "en",
  onComplete,
  isSubmitting = false,
}: Guided12StepWizardProps) {
  const { t, locale, setLocale, isRTL } = useTranslation();

  // Step state: 1 through 12
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguageCode>(
    (locale as SupportedLanguageCode) || initialLanguage
  );

  // Form Fields
  const [fullName, setFullName] = React.useState("");
  const [state, setState] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [cityVillage, setCityVillage] = React.useState("");
  const [isUnlistedVillage, setIsUnlistedVillage] = React.useState(false);

  const [profileType, setProfileType] = React.useState<
    "service_professional" | "goods_vendor" | "hybrid_artisan"
  >("service_professional");
  const [tradeCategory, setTradeCategory] = React.useState("");
  const [occupation, setOccupation] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [stallType, setStallType] = React.useState<
    "mobile_cart" | "fixed_stall" | "home_workshop" | "kiosk" | "retail_shop" | "other"
  >("fixed_stall");
  const [operatingHours, setOperatingHours] = React.useState("8:00 AM - 7:00 PM");

  const [skills, setSkills] = React.useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = React.useState("");
  const [yearsExperience, setYearsExperience] = React.useState<number>(3);
  const [toolsDescription, setToolsDescription] = React.useState("");

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [contactPreference, setContactPreference] = React.useState<"phone" | "whatsapp" | "in_person">("phone");
  const [avatarIndex, setAvatarIndex] = React.useState<number>(0);

  // Inline validation errors per step
  const [stepError, setStepError] = React.useState<string | null>(null);
  const [draftNotice, setDraftNotice] = React.useState<string | null>(null);

  // Load authoritative geographic dataset
  const allStates = React.useMemo(() => GeographicAuthorizationService.getAllStates(), []);
  const availableDistricts = React.useMemo(() => {
    return state ? GeographicAuthorizationService.getDistrictsForState(state) : [];
  }, [state]);

  // Restore draft on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GUIDED_DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.fullName) setFullName(d.fullName);
        if (d.state) setState(d.state);
        if (d.district) setDistrict(d.district);
        if (d.cityVillage) setCityVillage(d.cityVillage);
        if (d.profileType) setProfileType(d.profileType);
        if (d.tradeCategory) setTradeCategory(d.tradeCategory);
        if (d.occupation) setOccupation(d.occupation);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.skills && Array.isArray(d.skills)) setSkills(d.skills);
        if (d.yearsExperience) setYearsExperience(d.yearsExperience);
        if (d.phoneNumber) setPhoneNumber(d.phoneNumber);
        if (d.currentStep && d.currentStep <= 12) setCurrentStep(d.currentStep);
        setDraftNotice("Your previous draft was restored.");
      }
    } catch {
      // LocalStorage draft parsing failed
    }
  }, []);

  // Persist draft on changes
  React.useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_GUIDED_DRAFT_KEY,
        JSON.stringify({
          currentStep,
          selectedLanguage,
          fullName,
          state,
          district,
          cityVillage,
          profileType,
          tradeCategory,
          occupation,
          businessName,
          skills,
          yearsExperience,
          phoneNumber,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // LocalStorage quota or sandboxed
    }
  }, [
    currentStep,
    selectedLanguage,
    fullName,
    state,
    district,
    cityVillage,
    profileType,
    tradeCategory,
    occupation,
    businessName,
    skills,
    yearsExperience,
    phoneNumber,
  ]);

  // Suggested trade skills from taxonomy
  const suggestedSkills = React.useMemo(() => {
    const defaultList = [
      "Residential wiring",
      "Inverter installation",
      "Switchboard repair",
      "Pipe soldering",
      "Leak fixing",
      "Custom cabinetry",
      "Wall masonry",
      "Tile laying",
      "Exterior painting",
      "Surface polishing",
      "Two-wheeler engine overhaul",
      "Brake calibration",
    ];
    if (!tradeCategory) return defaultList.slice(0, 8);
    const cat = PROFESSIONS_DATA.find((p) => p.id === tradeCategory);
    return cat?.popularSkills && cat.popularSkills.length > 0 ? cat.popularSkills : defaultList.slice(0, 8);
  }, [tradeCategory]);

  // Validate current step before advancing
  const validateCurrentStep = (): boolean => {
    setStepError(null);
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        if (!fullName.trim() || fullName.trim().length < 2) {
          setStepError("Please enter your name (at least 2 characters).");
          return false;
        }
        return true;
      case 3:
        if (!state) {
          setStepError("Please select your State or Union Territory.");
          return false;
        }
        return true;
      case 4:
        if (!district) {
          setStepError("Please select your District.");
          return false;
        }
        return true;
      case 5:
        if (!cityVillage.trim()) {
          setStepError("Please enter your city, town, or village name.");
          return false;
        }
        return true;
      case 6:
        if (!tradeCategory && !occupation) {
          setStepError("Please select your trade or craft.");
          return false;
        }
        return true;
      case 7:
        if (skills.length === 0) {
          setStepError("Please select or type at least one skill.");
          return false;
        }
        return true;
      case 8:
        if (yearsExperience < 0 || isNaN(yearsExperience)) {
          setStepError("Please provide your years of practical experience.");
          return false;
        }
        return true;
      case 9:
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
          setStepError("Please enter a valid 10-digit mobile phone number.");
          return false;
        }
        return true;
      case 10:
        return true; // Photo is optional
      case 11:
        return true;
      case 12:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 12) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        handleFinalSubmit();
      }
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()]);
      setCustomSkillInput("");
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleFinalSubmit = () => {
    const selectedProfession = PROFESSIONS_DATA.find((p) => p.id === tradeCategory);
    const resolvedTradeName = occupation.trim() || selectedProfession?.title || "Craftsperson";
    const resolvedCategory = selectedProfession?.sector || "Construction & Building";

    const submission: ApprovedProfileSubmission = {
      fullName: fullName.trim(),
      occupation: resolvedTradeName,
      category: resolvedCategory,
      ncoCode: "NCO-2015 / NSQF Level 4",
      profileType: profileType,
      businessName: businessName.trim() || undefined,
      vendorType: profileType === "goods_vendor" ? "Local Retail Vendor" : undefined,
      stallType: stallType,
      operatingHours: operatingHours,
      deliveryAvailable: false,
      contactPreference: contactPreference,
      yearsExperience: yearsExperience,
      city: cityVillage.trim(),
      state: state,
      district: district,
      locality: cityVillage.trim(),
      pincode: undefined,
      headline: `${yearsExperience} years experienced ${resolvedTradeName} in ${district}, ${state}`,
      bio: toolsDescription.trim() || `${resolvedTradeName} specializing in verified craftsmanship across ${district}.`,
      skills: skills.length > 0 ? skills : [resolvedTradeName],
      equipmentHandled: toolsDescription.trim() ? [toolsDescription.trim()] : [],
      languages: [selectedLanguage || "en"],
      dailyRateMin: 500,
      dailyRateMax: 1200,
      hasVoiceAttestation: false,
      allowNonDispatchProfile: true,
    };

    onComplete(submission);
  };

  const stepTitles = [
    t.onboarding?.step1 || "Choose Language",
    t.onboarding?.step2 || "Your Name",
    t.onboarding?.step3 || "State",
    t.onboarding?.step4 || "District",
    t.onboarding?.step5 || "City, Town or Village",
    t.onboarding?.step6 || "Type of Work",
    t.onboarding?.step7 || "Your Skills",
    t.onboarding?.step8 || "Experience",
    t.onboarding?.step9 || "Contact Details",
    t.onboarding?.step10 || "Profile Photo",
    t.onboarding?.step11 || "Review Information",
    t.onboarding?.step12 || "Save Profile",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Draft Notification Banner */}
      {draftNotice && (
        <div className="flex items-center justify-between p-3 rounded-md bg-forest/10 border border-forest/20 text-xs text-forest">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>{draftNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftNotice(null)}
            className="text-[11px] underline font-bold hover:text-forest-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-charcoal-muted">
          <span className="font-bold uppercase tracking-wider text-forest">
            Step {currentStep} of 12: {stepTitles[currentStep - 1]}
          </span>
          <span className="font-mono text-[11px]">{Math.round((currentStep / 12) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-forest/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-forest h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Container */}
      <div className="bg-card border border-forest/15 rounded-md p-6 shadow-sovereign-sm space-y-6">
        {/* Step 1: Language */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Globe className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">1. {t.onboarding?.step1 || "Choose Your Language"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              KAAMSETU supports 39 Indian languages and dialects. Pick the language you feel most comfortable using.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setLocale(lang.code);
                    }}
                    className={cn(
                      "p-3 rounded-sm border text-left transition-all",
                      isSelected
                        ? "bg-forest text-ivory border-forest font-bold shadow-xs"
                        : "bg-card text-charcoal border-forest/15 hover:border-forest/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{lang.nativeName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sand" />}
                    </div>
                    <span className="text-[10px] block opacity-80 mt-0.5">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Name */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <User className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">2. {t.onboarding?.step2 || "What is your name?"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Enter your full name as customers, neighbours, or fellow workers know you.
            </p>
            <div className="space-y-1.5 pt-2">
              <label htmlFor="guided-name" className="text-xs font-bold text-forest">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="guided-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setStepError(null);
                }}
                placeholder="e.g. Ramesh Chandra Das"
                className="w-full px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 3: State */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <MapPin className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">3. {t.onboarding?.step3 || "Select Your State"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Select the State or Union Territory where you currently live and work.
            </p>
            <div className="space-y-1.5 pt-2">
              <label htmlFor="guided-state" className="text-xs font-bold text-forest">
                State / Union Territory <span className="text-red-600">*</span>
              </label>
              <select
                id="guided-state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict("");
                  setStepError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background"
              >
                <option value="">-- Choose State / UT --</option>
                {allStates.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.hindiName}) {st.isUnionTerritory ? "• UT" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 4: District */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <MapPin className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">4. {t.onboarding?.step4 || "Select Your District"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Select your district in {state || "your selected state"}.
            </p>
            <div className="space-y-1.5 pt-2">
              <label htmlFor="guided-district" className="text-xs font-bold text-forest">
                District in {state} <span className="text-red-600">*</span>
              </label>
              <select
                id="guided-district"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setStepError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background"
              >
                <option value="">-- Choose District --</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 5: City, Town or Village */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <MapPin className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">5. {t.onboarding?.step5 || "City, Town or Village"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Enter your neighborhood, market area, town, or rural village.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="guided-city" className="text-xs font-bold text-forest">
                  Town / Locality / Village <span className="text-red-600">*</span>
                </label>
                <input
                  id="guided-city"
                  type="text"
                  value={cityVillage}
                  onChange={(e) => {
                    setCityVillage(e.target.value);
                    setStepError(null);
                  }}
                  placeholder="e.g. Beltola, Dispur, or Village Name"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="unlisted-village-check"
                  type="checkbox"
                  checked={isUnlistedVillage}
                  onChange={(e) => setIsUnlistedVillage(e.target.checked)}
                  className="h-4 w-4 text-forest rounded-xs border-forest/30"
                />
                <label htmlFor="unlisted-village-check" className="text-xs text-charcoal cursor-pointer">
                  This is a rural village or hamlet not found in standard postal directories
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Type of Work */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Briefcase className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">6. {t.onboarding?.step6 || "Choose Your Work"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Choose your profile mode and primary trade category.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProfileType("service_professional")}
                className={cn(
                  "p-3.5 rounded-sm border text-left transition-all space-y-1.5",
                  profileType === "service_professional"
                    ? "border-forest bg-forest/5 ring-1 ring-forest"
                    : "border-forest/15 hover:border-forest/40"
                )}
              >
                <Briefcase className="w-4 h-4 text-forest" />
                <div className="font-bold text-xs text-forest">Service Professional</div>
                <div className="text-[10px] text-charcoal-muted">Electrician, Plumber, Carpenter, Mechanic, etc.</div>
              </button>

              <button
                type="button"
                onClick={() => setProfileType("goods_vendor")}
                className={cn(
                  "p-3.5 rounded-sm border text-left transition-all space-y-1.5",
                  profileType === "goods_vendor"
                    ? "border-forest bg-forest/5 ring-1 ring-forest"
                    : "border-forest/15 hover:border-forest/40"
                )}
              >
                <Store className="w-4 h-4 text-forest" />
                <div className="font-bold text-xs text-forest">Local Vendor / Merchant</div>
                <div className="text-[10px] text-charcoal-muted">Stall, Cart, Produce, Tea, Street Food, Goods</div>
              </button>

              <button
                type="button"
                onClick={() => setProfileType("hybrid_artisan")}
                className={cn(
                  "p-3.5 rounded-sm border text-left transition-all space-y-1.5",
                  profileType === "hybrid_artisan"
                    ? "border-forest bg-forest/5 ring-1 ring-forest"
                    : "border-forest/15 hover:border-forest/40"
                )}
              >
                <ShieldCheck className="w-4 h-4 text-forest" />
                <div className="font-bold text-xs text-forest">Hybrid Artisan</div>
                <div className="text-[10px] text-charcoal-muted">Handicrafts, Pottery, Tailor selling custom wares</div>
              </button>
            </div>

            {/* Vendor specific stall type */}
            {(profileType === "goods_vendor" || profileType === "hybrid_artisan") && (
              <div className="p-3.5 rounded-md bg-forest/5 border border-forest/10 space-y-2">
                <label className="text-xs font-bold text-forest">Stall or Shop Setup</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "fixed_stall", label: "Fixed Market Stall" },
                    { id: "mobile_cart", label: "Mobile Cart / Thela" },
                    { id: "home_workshop", label: "Home Workshop" },
                    { id: "kiosk", label: "Street Kiosk" },
                    { id: "retail_shop", label: "Permanent Shop" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStallType(s.id as any)}
                      className={cn(
                        "p-2 text-xs rounded-xs border text-center transition-all",
                        stallType === s.id ? "bg-forest text-ivory font-bold" : "bg-card text-charcoal border-forest/15"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trade Category Dropdown */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="guided-trade" className="text-xs font-bold text-forest">
                Primary Trade / Vocation <span className="text-red-600">*</span>
              </label>
              <select
                id="guided-trade"
                value={tradeCategory}
                onChange={(e) => {
                  setTradeCategory(e.target.value);
                  const p = PROFESSIONS_DATA.find((pr) => pr.id === e.target.value);
                  if (p) {
                    setOccupation(p.title);
                  }
                  setStepError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background"
              >
                <option value="">-- Choose Vocation --</option>
                {PROFESSIONS_DATA.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.hindiTitle}) • {p.sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 7: Skills */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Wrench className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">7. {t.onboarding?.step7 || "Your Skills"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Select the practical skills you perform, or add your custom specializations.
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-forest">Suggested Skills:</span>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((sk: string) => {
                  const isChecked = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleToggleSkill(sk)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xs border text-xs transition-colors flex items-center gap-1.5",
                        isChecked
                          ? "bg-forest text-ivory border-forest font-bold"
                          : "bg-background text-charcoal border-forest/20 hover:border-forest/50"
                      )}
                    >
                      {sk}
                      {isChecked && <Check className="w-3 h-3 text-sand" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder="Type another skill and click add..."
                className="flex-1 px-3 py-2 rounded-sm border border-forest/20 text-xs outline-none bg-background"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomSkill}
                className="border-forest/30 text-forest text-xs"
              >
                Add Skill
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="p-3 bg-forest/5 rounded-xs border border-forest/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-forest">Your Selected Skills ({skills.length}):</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-xs bg-card border border-forest/20 text-xs font-semibold text-forest flex items-center gap-1"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(s)}
                        className="text-forest/60 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 8: Experience */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Clock className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">8. {t.onboarding?.step8 || "Years of Experience"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              How many years have you been working in this vocation?
            </p>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: 1, label: "1 Year" },
                  { val: 3, label: "2-4 Years" },
                  { val: 7, label: "5-9 Years" },
                  { val: 12, label: "10+ Years" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setYearsExperience(item.val)}
                    className={cn(
                      "py-3 rounded-sm border text-center transition-all",
                      yearsExperience === item.val
                        ? "bg-forest text-ivory border-forest font-bold shadow-xs"
                        : "bg-card text-charcoal border-forest/15 hover:border-forest/40"
                    )}
                  >
                    <span className="block text-sm font-bold">{item.val} yrs</span>
                    <span className="block text-[10px] opacity-80">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-forest">
                  Tools, Materials, or Typical Work (Optional):
                </label>
                <textarea
                  value={toolsDescription}
                  onChange={(e) => setToolsDescription(e.target.value)}
                  placeholder="e.g. Bosch power drill, digital multimeter, commercial conduit wiring..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-sm border border-forest/20 text-xs outline-none bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Contact Details */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Phone className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">9. {t.onboarding?.step9 || "Contact Information"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Provide your mobile phone number for direct inquiries.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="guided-phone" className="text-xs font-bold text-forest">
                  Mobile Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-2.5 rounded-sm bg-muted border border-forest/20 text-xs font-bold text-charcoal">
                    +91
                  </span>
                  <input
                    id="guided-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setStepError(null);
                    }}
                    placeholder="9876543210"
                    className="flex-1 px-3.5 py-2.5 rounded-sm border border-forest/20 text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-background font-mono"
                  />
                </div>
              </div>

              {/* Truthful privacy disclosure */}
              <div className="p-3 bg-forest/5 rounded-xs border border-forest/15 space-y-1">
                <span className="text-xs font-bold text-forest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  Why we ask for your number:
                </span>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  Your phone is used only for direct calls and SMS from customers requesting your work. KAAMSETU never sells your contact or shares it with advertisers.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-forest">Preferred Way to Contact:</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: "phone", label: "Phone Call" },
                    { id: "whatsapp", label: "WhatsApp" },
                    { id: "in_person", label: "In-Person at Stall" },
                  ].map((cp) => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setContactPreference(cp.id as any)}
                      className={cn(
                        "py-2 px-1 text-xs rounded-xs border text-center transition-all",
                        contactPreference === cp.id
                          ? "bg-forest text-ivory font-bold"
                          : "bg-card text-charcoal border-forest/15"
                      )}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Profile Photo (Optional) */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Camera className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">10. {t.onboarding?.step10 || "Profile Photo (Optional)"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Adding a photo helps customers identify and trust you on site. You can also skip this step.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-forest text-sand font-bold text-2xl flex items-center justify-center border-2 border-sand shadow-sm">
                  {fullName ? fullName.charAt(0).toUpperCase() : "K"}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-forest">Default Sovereign Avatar</div>
                  <div className="text-[11px] text-charcoal-muted">
                    Your initial will be used on your digital card until you upload a photo.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 11: Review Information */}
        {currentStep === 11 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <CheckCircle2 className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">11. {t.onboarding?.step11 || "Review Your Work Profile"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              Verify your details before saving. You can edit any section at any time.
            </p>

            <div className="p-4 bg-forest/5 rounded-md border border-forest/15 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Name</span>
                  <div className="font-bold text-sm text-forest">{fullName || "Not specified"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Location</span>
                  <div className="font-semibold text-charcoal">
                    {cityVillage}, {district}, {state}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Vocation & Role</span>
                  <div className="font-semibold text-charcoal">
                    {occupation || "Craftsperson"} ({profileType.replace("_", " ")})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Skills ({skills.length})</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {skills.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded-xs bg-card border border-forest/20 text-[10px] font-bold text-forest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Experience</span>
                  <div className="font-semibold text-charcoal">{yearsExperience} years</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(8)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted">Contact</span>
                  <div className="font-mono text-charcoal">+91 {phoneNumber}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(9)}
                  className="text-xs text-forest underline font-bold"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 12: Save Profile */}
        {currentStep === 12 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Save className="w-5 h-5 text-forest" />
              <h2 className="text-lg font-bold">12. {t.onboarding?.step12 || "Save & Mint Profile"}</h2>
            </div>
            <p className="text-xs text-charcoal-muted">
              By confirming, your profile will be registered in the KAAMSETU national directory with a verified sovereign ID.
            </p>

            <div className="p-4 bg-sand/20 rounded-md border border-sand/40 space-y-2 text-xs">
              <div className="font-bold text-forest">Permanent Invariant Guarantee:</div>
              <p className="text-[11px] text-charcoal leading-relaxed">
                KAAMSETU charges <strong>0.00 platform commission</strong> on your wages. Every rupee you earn from customers belongs 100% to you.
              </p>
            </div>
          </div>
        )}

        {/* Inline Error Alert */}
        {stepError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{stepError}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-forest/10">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="border-forest/30 text-forest text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.onboarding?.backBtn || "Previous Step"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraftNotice("Draft saved successfully.");
              }}
              className="text-xs text-charcoal-muted hover:text-forest"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {t.onboarding?.saveDraftBtn || "Save Draft"}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-forest hover:bg-forest-500 text-ivory text-xs font-bold px-5 flex items-center gap-1.5"
            >
              {currentStep === 12 ? (
                isSubmitting ? "Saving..." : t.onboarding?.saveProfileBtn || "Confirm & Save Profile"
              ) : (
                <>
                  {t.onboarding?.nextBtn || "Next Step"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
