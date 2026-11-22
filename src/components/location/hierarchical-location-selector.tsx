"use client";

import * as React from "react";
import { INDIA_STATES_DATA, IndiaState } from "@/lib/geo/india-geography-data";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, AlertCircle, Search, Info } from "lucide-react";

export interface HierarchicalLocationValue {
  country: string;
  stateCode: string;
  stateName: string;
  district: string;
  subdistrict?: string;
  city: string;
  locality: string;
  pincode: string;
  isPilotDispatchEligible?: boolean;
}

interface HierarchicalLocationSelectorProps {
  value?: Partial<HierarchicalLocationValue>;
  onChange?: (val: HierarchicalLocationValue) => void;
  className?: string;
  disabled?: boolean;
}

export function HierarchicalLocationSelector({
  value,
  onChange,
  className = "",
  disabled = false,
}: HierarchicalLocationSelectorProps) {
  const { t } = useTranslation();

  const [stateCode, setStateCode] = React.useState<string>(value?.stateCode || "AS");
  const [district, setDistrict] = React.useState<string>(value?.district || "Kamrup Metropolitan");
  const [subdistrict, setSubdistrict] = React.useState<string>(value?.subdistrict || "Guwahati Sadar");
  const [city, setCity] = React.useState<string>(value?.city || "Guwahati");
  const [locality, setLocality] = React.useState<string>(value?.locality || "Paltan Bazaar");
  const [pincode, setPincode] = React.useState<string>(value?.pincode || "781001");
  const [stateSearch, setStateSearch] = React.useState<string>("");

  const activeState: IndiaState | undefined = React.useMemo(() => {
    return INDIA_STATES_DATA.find((s) => s.code === stateCode) || INDIA_STATES_DATA[2]; // fallback Assam
  }, [stateCode]);

  // Check if current location falls inside pilot dispatch zones
  const isPilotDispatchEligible = React.useMemo(() => {
    const pinNum = parseInt(pincode, 10);
    const isGuwahati = pinNum >= 781001 && pinNum <= 781039;
    const isShillong = pinNum >= 793001 && pinNum <= 793022;
    return isGuwahati || isShillong;
  }, [pincode]);

  // Validate PIN code
  const pinValidation = React.useMemo(() => {
    if (!pincode) return { isValid: false, message: "" };
    if (!/^\d{6}$/.test(pincode)) {
      return { isValid: false, message: t.location?.pincodeInvalid || "PIN code must be exactly 6 digits." };
    }
    if (activeState && activeState.pinPrefixes.length > 0) {
      const prefix = pincode.slice(0, 2);
      const matchesPrefix = activeState.pinPrefixes.some((p) => pincode.startsWith(p));
      if (!matchesPrefix) {
        return {
          isValid: true,
          warning: `Note: Expected PIN code prefix for ${activeState.name} is ${activeState.pinPrefixes.join(", ")}.`,
        };
      }
    }
    return { isValid: true, message: t.location?.pincodeValid || "Valid Postal Code" };
  }, [pincode, activeState, t]);

  // Emit changes
  const notifyChange = React.useCallback(
    (newStateCode: string, newDist: string, newSubdist: string, newCity: string, newLoc: string, newPin: string) => {
      if (!onChange) return;
      const s = INDIA_STATES_DATA.find((item) => item.code === newStateCode);
      const pinNum = parseInt(newPin, 10);
      const pilot = (pinNum >= 781001 && pinNum <= 781039) || (pinNum >= 793001 && pinNum <= 793022);

      onChange({
        country: "India",
        stateCode: newStateCode,
        stateName: s?.name || "Assam",
        district: newDist,
        subdistrict: newSubdist,
        city: newCity,
        locality: newLoc,
        pincode: newPin,
        isPilotDispatchEligible: pilot,
      });
    },
    [onChange]
  );

  const handleStateChange = (newCode: string) => {
    setStateCode(newCode);
    const s = INDIA_STATES_DATA.find((item) => item.code === newCode);
    const firstDist = s?.districts[0] || "";
    const firstCity = s?.majorHubs[0]?.city || firstDist;
    setDistrict(firstDist);
    setCity(firstCity);
    setSubdistrict(`${firstCity} Sadar`);
    notifyChange(newCode, firstDist, `${firstCity} Sadar`, firstCity, locality, pincode);
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    // Auto-select matching hub if available
    const hub = activeState?.majorHubs.find((h) => h.district === newDist);
    const newCity = hub?.city || newDist;
    setCity(newCity);
    setSubdistrict(`${newCity} Sadar`);
    notifyChange(stateCode, newDist, `${newCity} Sadar`, newCity, locality, pincode);
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Pilot Boundary Status Banner */}
      <div
        className={`p-3.5 rounded-sm border flex items-start gap-2.5 text-xs ${
          isPilotDispatchEligible
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-900"
            : "bg-forest/5 border-forest/15 text-charcoal"
        }`}
      >
        <MapPin className="w-4 h-4 shrink-0 text-forest mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {isPilotDispatchEligible
                ? "Active Commercial Dispatch Zone (Class B Pilot)"
                : "Nationwide Digital Showcase & Sovereign Registry"}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] font-mono ${
                isPilotDispatchEligible
                  ? "bg-emerald-600/15 text-emerald-800 border-emerald-600/30"
                  : "bg-forest/10 text-forest border-forest/20"
              }`}
            >
              {isPilotDispatchEligible ? "DISPATCH CERTIFIED" : "NATIONWIDE IDENTITY"}
            </Badge>
          </div>
          <p className="text-[11px] opacity-85 leading-relaxed">
            {isPilotDispatchEligible
              ? "Your selected locality is eligible for direct customer service calls and on-demand dispatch."
              : t.location?.controlledRolloutNote ||
                "Profiles in this area are active nationwide for credential verification and public discovery. Commercial on-demand dispatch operates in certified pilot zones."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Country */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-charcoal">{t.location?.country || "Country"}</Label>
          <div className="h-9 px-3 rounded-sm border border-forest/20 bg-forest/5 flex items-center text-xs font-semibold text-forest">
            🇮🇳 India (भारत)
          </div>
        </div>

        {/* 2. State / UT */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-charcoal">{t.location?.state || "State / UT"} *</Label>
            <span className="text-[10px] text-charcoal-muted">36 States & UTs</span>
          </div>
          <select
            value={stateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={disabled}
            className="w-full h-9 rounded-sm border border-forest/20 bg-background px-3 text-xs text-charcoal font-medium outline-none cursor-pointer"
          >
            {INDIA_STATES_DATA.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.hindiName}) {s.type === "union_territory" ? "— UT" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 3. District */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-charcoal">{t.location?.district || "District"} *</Label>
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled}
            className="w-full h-9 rounded-sm border border-forest/20 bg-background px-3 text-xs text-charcoal font-medium outline-none cursor-pointer"
          >
            {activeState?.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Subdistrict / Tehsil / Block */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-charcoal">
            {t.location?.subdistrict || "Subdistrict / Tehsil"}
          </Label>
          <Input
            value={subdistrict}
            onChange={(e) => {
              setSubdistrict(e.target.value);
              notifyChange(stateCode, district, e.target.value, city, locality, pincode);
            }}
            placeholder="e.g. Guwahati Sadar / Dispur Block"
            disabled={disabled}
            className="text-xs border-forest/20 h-9"
          />
        </div>

        {/* 5. City, Town or Village */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-charcoal">
            {t.location?.cityTownVillage || "City, Town or Village"} *
          </Label>
          <Input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              notifyChange(stateCode, district, subdistrict, e.target.value, locality, pincode);
            }}
            placeholder="e.g. Guwahati / Shillong / Dispur"
            disabled={disabled}
            required
            className="text-xs border-forest/20 h-9"
          />
        </div>

        {/* 6. Locality / Ward / Neighborhood */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-charcoal">
            {t.location?.locality || "Locality / Ward"} *
          </Label>
          <Input
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value);
              notifyChange(stateCode, district, subdistrict, city, e.target.value, pincode);
            }}
            placeholder="e.g. Paltan Bazaar / Uzanbazar"
            disabled={disabled}
            required
            className="text-xs border-forest/20 h-9"
          />
        </div>

        {/* 7. PIN Code */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-charcoal">
              {t.location?.pincode || "Postal PIN Code"} *
            </Label>
            {pinValidation.isValid && (
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                {pinValidation.message}
              </span>
            )}
          </div>
          <Input
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(val);
              notifyChange(stateCode, district, subdistrict, city, locality, val);
            }}
            placeholder="Enter 6-digit PIN code (e.g. 781001)"
            maxLength={6}
            disabled={disabled}
            required
            className="text-xs border-forest/20 h-9 font-mono"
          />
          {pinValidation.warning && (
            <p className="text-[10px] text-amber-700 flex items-center gap-1 mt-1">
              <Info className="w-3 h-3 shrink-0" />
              {pinValidation.warning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
