/**
 * KAAMSETU — Nationwide Geographic Authorization & Capability Resolution Service
 * 
 * Nationwide Support: All 28 States & 8 Union Territories supported for account,
 * profile creation, credential verification, and nationwide craft discovery.
 * 
 * Operating Classification: CLASS_B_CONTROLLED_ROLLOUT.
 * Commercial dispatch and on-demand customer bookings remain verified in:
 * - Guwahati Urban, Kamrup Metropolitan, Assam (PIN 781001-781039)
 * - Shillong Urban, East Khasi Hills, Meghalaya (PIN 793001-793022)
 * 
 * Permanent Financial Invariant: platform_commission_amount = 0.00
 */

import {
  INDIA_STATES_DATA,
  CITY_ALIASES_MAP,
  IndiaState,
} from "./india-geography-data";
import {
  ServiceCoverageRegistry,
  GeographicCapabilities,
  VERIFIED_SERVICE_AREAS,
  NATIONWIDE_DEFAULT_CAPABILITIES,
} from "./service-coverage-registry";

export interface LocationValidationRequest {
  city: string;
  state: string;
  district?: string;
  locality?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  dispatchCategory?: "standard_vocational" | "heavy_epc_infrastructure";
  allowNonDispatchProfile?: boolean;
}

export type RegionalOperatingStatus = 
  | "AUTHORIZED"
  | "CONDITIONAL_READINESS_ONLY"
  | "BLOCKED"
  | "OUT_OF_BOUNDS"
  | "NON_DISPATCH_AREA";

export interface LocationValidationResult {
  allowed: boolean; // Backward-compatible boolean: true if within active commercial dispatch cluster
  status: RegionalOperatingStatus;
  district: string;
  state: string;
  pincode: string;
  reason?: string;
  coordinateCheckPassed: boolean;
  allowedForRegistration: boolean; // Always true across India
  isDispatchEligible: boolean; // True in authorized dispatch zones (Guwahati & Shillong)
  capabilities: GeographicCapabilities; // Decoupled capability matrix (Phase 42)
  canonicalState?: string;
  canonicalDistrict?: string;
  isRecognizedIndianLocation: boolean;
  serviceCoverageDescription: string;
}

export class GeographicAuthorizationService {
  /**
   * Return all 28 States and 8 Union Territories
   */
  public static getAllStates(): IndiaState[] {
    return INDIA_STATES_DATA.map((s) => ({
      ...s,
      isUnionTerritory: s.type === "union_territory",
      capital: s.majorHubs.find((h) => h.isCapital)?.city || s.majorHubs[0]?.city || s.name,
      pincodePrefixes: s.pinPrefixes,
    }));
  }

  /**
   * Find state by name or ISO code (case-insensitive)
   */
  public static getState(identifier: string): IndiaState | undefined {
    const q = identifier.trim().toLowerCase();
    const found = INDIA_STATES_DATA.find(
      (s) => s.code.toLowerCase() === q || s.name.toLowerCase() === q || s.hindiName.includes(q)
    );
    if (!found) return undefined;
    return {
      ...found,
      isUnionTerritory: found.type === "union_territory",
      capital: found.majorHubs.find((h) => h.isCapital)?.city || found.majorHubs[0]?.city || found.name,
      pincodePrefixes: found.pinPrefixes,
    };
  }

  /**
   * Return districts for a given state
   */
  public static getDistrictsForState(stateIdentifier: string): string[] {
    const state = this.getState(stateIdentifier);
    return state ? state.districts : [];
  }

  /**
   * Return major cities/towns for a given district
   */
  public static getCitiesForDistrict(stateIdentifier: string, districtName: string): string[] {
    const state = this.getState(stateIdentifier);
    if (!state) return [];
    const distLower = districtName.toLowerCase().trim();
    return state.majorHubs
      .filter((h) => h.district.toLowerCase() === distLower)
      .map((h) => h.city);
  }

  /**
   * Normalize city name taking alternate spellings / transliterations into account
   */
  public static normalizeCity(city: string): string {
    const lower = city.toLowerCase().trim();
    return CITY_ALIASES_MAP[lower] || city.trim();
  }

  /**
   * Resolves a historical alias or transliterated city name to canonical city and state
   */
  public static lookupCityAlias(alias: string): { city: string; state?: string } | undefined {
    const lower = alias.toLowerCase().trim();
    const resolved = CITY_ALIASES_MAP[lower];
    if (!resolved) return undefined;
    for (const st of INDIA_STATES_DATA) {
      if (st.majorHubs.some((h) => h.city.toLowerCase() === resolved.toLowerCase())) {
        return { city: resolved, state: st.name };
      }
    }
    return { city: resolved };
  }

  /**
   * Lookup geographic metadata and capabilities by 6-digit Indian PIN code
   */
  public static lookupPincode(pincode: string): {
    found: boolean;
    state?: string;
    stateCode?: string;
    district?: string;
    suggestedCity?: string;
    zone?: string;
    capabilities: GeographicCapabilities;
    coverageZoneDescription: string;
  } {
    const cleanPin = (pincode || "").replace(/\D/g, "");
    if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return {
        found: false,
        capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
        coverageZoneDescription: "Invalid PIN code format",
      };
    }

    const prefix = cleanPin.substring(0, 2);
    const pinInt = parseInt(cleanPin, 10);

    // 1. Check verified service coverage areas (Guwahati / Shillong / Siliguri)
    for (const area of VERIFIED_SERVICE_AREAS) {
      if (pinInt >= area.minPin && pinInt <= area.maxPin) {
        return {
          found: true,
          state: area.state,
          district: area.district,
          suggestedCity: area.urbanCenter.split(" ")[0],
          zone: "North East",
          capabilities: area.capabilities,
          coverageZoneDescription: `${area.name} (${area.activationStatus})`,
        };
      }
    }

    // 2. Resolve state by prefix from INDIA_STATES_DATA (3-digit specific match first, then 2-digit)
    const prefix3 = cleanPin.substring(0, 3);
    const prefix2 = cleanPin.substring(0, 2);
    const matchedState =
      INDIA_STATES_DATA.find((s) => s.pinPrefixes.includes(prefix3)) ||
      INDIA_STATES_DATA.find((s) => s.pinPrefixes.includes(prefix2));
    const coverage = ServiceCoverageRegistry.resolveCapabilities({ pincode: cleanPin });

    if (matchedState) {
      const primaryHub = matchedState.majorHubs[0];
      return {
        found: true,
        state: matchedState.name,
        stateCode: matchedState.code,
        district: primaryHub ? primaryHub.district : matchedState.districts[0],
        suggestedCity: primaryHub ? primaryHub.city : undefined,
        zone: matchedState.zone,
        capabilities: coverage.capabilities,
        coverageZoneDescription: coverage.coverageZoneDescription,
      };
    }

    return {
      found: true,
      capabilities: coverage.capabilities,
      coverageZoneDescription: coverage.coverageZoneDescription,
    };
  }

  /**
   * Search locations across India by keyword (states, districts, cities, aliases, PIN prefixes)
   */
  public static searchLocations(query: string, limit = 10): Array<{
    title: string;
    subtitle: string;
    city: string;
    district: string;
    state: string;
    stateCode: string;
    isAuthorizedDispatch: boolean;
  }> {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return [];

    const results: Array<{
      title: string;
      subtitle: string;
      city: string;
      district: string;
      state: string;
      stateCode: string;
      isAuthorizedDispatch: boolean;
    }> = [];

    // Search major hubs across all 36 states/UTs
    for (const state of INDIA_STATES_DATA) {
      for (const hub of state.majorHubs) {
        const matchesCity = hub.city.toLowerCase().includes(q);
        const matchesDistrict = hub.district.toLowerCase().includes(q);
        const matchesState = state.name.toLowerCase().includes(q);
        const matchesAlias = hub.aliases?.some((a) => a.toLowerCase().includes(q));

        if (matchesCity || matchesDistrict || matchesState || matchesAlias) {
          const isGuwahati = hub.city.toLowerCase() === "guwahati" || hub.city.toLowerCase() === "dispur";
          const isShillong = hub.city.toLowerCase() === "shillong";
          results.push({
            title: hub.city,
            subtitle: `${hub.district}, ${state.name}`,
            city: hub.city,
            district: hub.district,
            state: state.name,
            stateCode: state.code,
            isAuthorizedDispatch: isGuwahati || isShillong,
          });
        }
        if (results.length >= limit) return results;
      }

      // Also search district names
      for (const district of state.districts) {
        if (district.toLowerCase().includes(q)) {
          const alreadyAdded = results.some((r) => r.district.toLowerCase() === district.toLowerCase() && r.state === state.name);
          if (!alreadyAdded) {
            results.push({
              title: district,
              subtitle: `District in ${state.name}`,
              city: district,
              district,
              state: state.name,
              stateCode: state.code,
              isAuthorizedDispatch: district.toLowerCase() === "kamrup metropolitan" || district.toLowerCase() === "east khasi hills",
            });
          }
        }
        if (results.length >= limit) return results;
      }
    }

    return results;
  }

  /**
   * Validates location against nationwide capabilities & regional rollout boundaries.
   */
  public static validateLocation(req: LocationValidationRequest): LocationValidationResult {
    const rawCity = (req.city || "").trim();
    const city = this.normalizeCity(rawCity);
    const rawState = (req.state || "").trim();
    const pin = (req.pincode || "").replace(/\s+/g, "").trim();
    const cityLower = city.toLowerCase();
    const stateLower = rawState.toLowerCase();

    // 1. PIN code format check
    if (!pin || !/^[1-9][0-9]{5}$/.test(pin)) {
      return {
        allowed: false,
        status: "OUT_OF_BOUNDS",
        district: "Unknown",
        state: rawState || "Unknown",
        pincode: pin || "",
        reason: "A valid 6-digit Indian Postal PIN code is required.",
        coordinateCheckPassed: false,
        allowedForRegistration: false,
        isDispatchEligible: false,
        capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
        isRecognizedIndianLocation: false,
        serviceCoverageDescription: "Invalid PIN code format",
      };
    }

    const pinInt = parseInt(pin, 10);
    const resolvedCoverage = ServiceCoverageRegistry.resolveCapabilities({
      state: rawState,
      district: req.district,
      city,
      pincode: pin,
    });

    // 2. Heavy EPC Infrastructure Dispatch check (Governance freeze)
    if (req.dispatchCategory === "heavy_epc_infrastructure") {
      return {
        allowed: false,
        status: "BLOCKED",
        district: "Heavy EPC Sector",
        state: rawState || "National",
        pincode: pin,
        reason: "Heavy EPC industrial staffing is FROZEN pending tripartite EPC contractual execution (BLOCKER-03).",
        coordinateCheckPassed: false,
        allowedForRegistration: false,
        isDispatchEligible: false,
        capabilities: {
          ...resolvedCoverage.capabilities,
          dispatch_access: false,
          booking_access: false,
        },
        isRecognizedIndianLocation: true,
        serviceCoverageDescription: "Heavy EPC Sector Staffing Frozen",
      };
    }

    // 3. Coordinate validation if coordinates provided
    let coordinateCheckPassed = true;
    if (req.latitude !== undefined && req.latitude !== null && req.longitude !== undefined && req.longitude !== null) {
      const lat = Number(req.latitude);
      const lng = Number(req.longitude);

      if (lat === 0 && lng === 0) {
        return {
          allowed: false,
          status: "OUT_OF_BOUNDS",
          district: "Spoofed",
          state: "Spoofed",
          pincode: pin,
          reason: "Coordinate spoofing detected: (0,0) null island coordinates rejected.",
          coordinateCheckPassed: false,
          allowedForRegistration: false,
          isDispatchEligible: false,
          capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
          isRecognizedIndianLocation: false,
          serviceCoverageDescription: "Rejected: Null Island coordinates",
        };
      }

      // India territorial bounding box (approx 8.0N - 37.5N, 68.0E - 97.5E)
      if (lat < 8.0 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
        return {
          allowed: false,
          status: "OUT_OF_BOUNDS",
          district: "Spoofed",
          state: "Spoofed",
          pincode: pin,
          reason: "Coordinates fall outside Indian territorial boundaries.",
          coordinateCheckPassed: false,
          allowedForRegistration: false,
          isDispatchEligible: false,
          capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
          isRecognizedIndianLocation: false,
          serviceCoverageDescription: "Rejected: Outside India territorial bounds",
        };
      }
    }

    // 4. Restricted regions under specific institutional blockers (Preserving governance state machines)
    if ((pinInt >= 799001 && pinInt <= 799290) || stateLower.includes("tripura") || cityLower.includes("agartala")) {
      return {
        allowed: false,
        status: "BLOCKED",
        district: "West Tripura / Agartala",
        state: "Tripura",
        pincode: pin,
        reason: "Tripura operations are BLOCKED pending Tripura Skill Development Mission (TSDM) institutional authorization (BLOCKER-01).",
        coordinateCheckPassed,
        allowedForRegistration: false,
        isDispatchEligible: false,
        capabilities: {
          ...NATIONWIDE_DEFAULT_CAPABILITIES,
          account_access: false,
          profile_access: false,
          booking_access: false,
          dispatch_access: false,
        },
        canonicalState: "Tripura",
        canonicalDistrict: "West Tripura",
        isRecognizedIndianLocation: true,
        serviceCoverageDescription: "Tripura Cluster Blocked (TSDM Pending)",
      };
    }

    // Siliguri (734001 - 734014)
    if ((pinInt >= 734001 && pinInt <= 734014) || cityLower.includes("siliguri")) {
      return {
        allowed: false,
        status: "CONDITIONAL_READINESS_ONLY",
        district: "Darjeeling / Jalpaiguri",
        state: "West Bengal",
        pincode: pin,
        reason: "Siliguri is currently under conditional readiness evaluation; customer dispatch is not yet authorized.",
        coordinateCheckPassed,
        allowedForRegistration: true,
        isDispatchEligible: false,
        capabilities: {
          ...NATIONWIDE_DEFAULT_CAPABILITIES,
          account_access: true,
          profile_access: true,
          discovery_access: true,
          booking_access: false,
          dispatch_access: false,
        },
        canonicalState: "West Bengal",
        canonicalDistrict: "Darjeeling",
        isRecognizedIndianLocation: true,
        serviceCoverageDescription: "Siliguri Northern Hub (Evaluation Only)",
      };
    }

    // 5. Check against verified Class B Authorized Districts (Guwahati & Shillong)
    for (const area of VERIFIED_SERVICE_AREAS) {
      if (area.activationStatus !== "ACTIVE_VERIFIED") continue;

      const pinMatches = pinInt >= area.minPin && pinInt <= area.maxPin;
      if (pinMatches) {
        // Conjunction check: declared state must match
        if (rawState && !rawState.toLowerCase().includes(area.state.toLowerCase())) {
          return {
            allowed: false,
            status: "OUT_OF_BOUNDS",
            district: area.district,
            state: rawState,
            pincode: pin,
            reason: `Contradictory location: PIN code ${pin} belongs to ${area.state}, but declared state is '${rawState}'.`,
            coordinateCheckPassed: false,
            allowedForRegistration: false,
            isDispatchEligible: false,
            capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
            isRecognizedIndianLocation: false,
            serviceCoverageDescription: "Location Conjunction Mismatch",
          };
        }

        // Conjunction check: declared city must be consistent
        const cityConsistent = area.allowedCities.some((c) => cityLower.includes(c));
        if (!cityConsistent && city.length > 0) {
          return {
            allowed: false,
            status: "OUT_OF_BOUNDS",
            district: area.district,
            state: area.state,
            pincode: pin,
            reason: `Contradictory location: PIN code ${pin} belongs to ${area.urbanCenter}, but declared city is '${city}'.`,
            coordinateCheckPassed: false,
            allowedForRegistration: false,
            isDispatchEligible: false,
            capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
            isRecognizedIndianLocation: false,
            serviceCoverageDescription: "Location Conjunction Mismatch",
          };
        }

        // Conjunction check: GPS coordinates (if provided) must lie near the declared dispatch cluster
        if (
          req.latitude !== undefined &&
          req.latitude !== null &&
          req.longitude !== undefined &&
          req.longitude !== null
        ) {
          const lat = Number(req.latitude);
          const lng = Number(req.longitude);
          const boundsByZone: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
            "ZONE-AS-01": { minLat: 25.6, maxLat: 26.8, minLng: 91.1, maxLng: 92.4 },
            "ZONE-ML-01": { minLat: 25.1, maxLat: 26.0, minLng: 91.4, maxLng: 92.4 },
          };
          const bounds = boundsByZone[area.geographyId];
          if (
            bounds &&
            (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng)
          ) {
            return {
              allowed: false,
              status: "OUT_OF_BOUNDS",
              district: area.district,
              state: area.state,
              pincode: pin,
              reason: `Coordinate spoofing rejected: GPS (${lat.toFixed(2)}, ${lng.toFixed(2)}) does not match declared cluster ${area.urbanCenter}.`,
              coordinateCheckPassed: false,
              allowedForRegistration: false,
              isDispatchEligible: false,
              capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
              isRecognizedIndianLocation: false,
              serviceCoverageDescription: "Location GPS Mismatch",
            };
          }
        }

        // Authorized Active Class B Operating Zone!
        return {
          allowed: true,
          status: "AUTHORIZED",
          district: area.district,
          state: area.state,
          pincode: pin,
          coordinateCheckPassed: true,
          allowedForRegistration: true,
          isDispatchEligible: true,
          capabilities: area.capabilities,
          canonicalState: area.state,
          canonicalDistrict: area.district,
          isRecognizedIndianLocation: true,
          serviceCoverageDescription: area.name,
        };
      }
    }

    // 6. NATIONWIDE COVERAGE: All other Indian locations across all 28 states & 8 UTs
    // Resolve canonical state & district
    const stateMatched = this.getState(rawState) || INDIA_STATES_DATA.find((s) => s.pinPrefixes.includes(pin.substring(0, 2)));
    const canonicalState = stateMatched ? stateMatched.name : (rawState || "India");
    const canonicalDistrict = req.district || (stateMatched ? stateMatched.districts[0] : (city || "District"));

    return {
      allowed: false, // Preserves backward-compatible check: not an active commercial dispatch cluster
      status: "OUT_OF_BOUNDS", // Outside Class B commercial dispatch boundary
      district: canonicalDistrict,
      state: canonicalState,
      pincode: pin,
      reason: `KAAMSETU is currently accepting service operations in Guwahati and Shillong. Your selected location${city ? ` (${city})` : ""} is not yet within our active service area. You can continue only with the profile options currently supported for your location.`,
      coordinateCheckPassed,
      allowedForRegistration: true, // Account and Profile creation are active nationwide
      isDispatchEligible: false, // Commercial dispatch requires localized cluster launch
      capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
      canonicalState,
      canonicalDistrict,
      isRecognizedIndianLocation: true,
      serviceCoverageDescription: "National Digital Skill Registry (Nationwide Profile & Discovery Active; Commercial Dispatch Pending Regional Cluster Launch)",
    };
  }
}
