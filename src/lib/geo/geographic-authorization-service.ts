/**
 * KAAMSETU — Geographic Authorization & Boundary Enforcement Service
 * 
 * Strict boundary enforcement for CLASS_B_CONTROLLED_ROLLOUT.
 * Permitted:
 * - Guwahati Urban, Kamrup Metropolitan, Assam (PIN: 781001-781039)
 * - Shillong Urban, East Khasi Hills, Meghalaya (PIN: 793001-793022)
 * 
 * Restricted:
 * - Siliguri (734001-734014): Conditional readiness only (Dispatch disallowed)
 * - Tripura (799001-799290): BLOCKED by BLOCKER-01 (Dispatch disallowed)
 * - Heavy EPC Staffing: FROZEN by BLOCKER-03 (Dispatch disallowed)
 * - All other districts: Out of bounds (Rejected with 403)
 */

export interface LocationValidationRequest {
  city: string;
  state: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  dispatchCategory?: "standard_vocational" | "heavy_epc_infrastructure";
}

export type RegionalOperatingStatus = 
  | "AUTHORIZED"
  | "CONDITIONAL_READINESS_ONLY"
  | "BLOCKED"
  | "OUT_OF_BOUNDS";

export interface LocationValidationResult {
  allowed: boolean;
  status: RegionalOperatingStatus;
  district: string;
  state: string;
  pincode: string;
  reason?: string;
  coordinateCheckPassed: boolean;
}

interface AuthorizedDistrictConfig {
  name: string;
  urbanCenter: string;
  state: string;
  minPin: number;
  maxPin: number;
  allowedCities: string[];
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

// Authorized Class B Operating Districts
const AUTHORIZED_DISTRICTS: AuthorizedDistrictConfig[] = [
  {
    name: "Kamrup Metropolitan",
    urbanCenter: "Guwahati Urban",
    state: "Assam",
    minPin: 781001,
    maxPin: 781039,
    allowedCities: ["guwahati", "kamrup", "dispur", "panbazar", "paltan"],
    bounds: { minLat: 26.05, maxLat: 26.25, minLng: 91.60, maxLng: 91.90 },
  },
  {
    name: "East Khasi Hills",
    urbanCenter: "Shillong Urban",
    state: "Meghalaya",
    minPin: 793001,
    maxPin: 793022,
    allowedCities: ["shillong", "east khasi hills", "khasi", "police bazar", "laitumkhrah"],
    bounds: { minLat: 25.50, maxLat: 25.65, minLng: 91.80, maxLng: 91.95 },
  },
];

export class GeographicAuthorizationService {
  /**
   * Validates location against strict regional operating rules.
   * Enforces consistent conjunction of PIN, city, state, district, and coordinates.
   */
  public static validateLocation(req: LocationValidationRequest): LocationValidationResult {
    const city = (req.city || "").trim();
    const state = (req.state || "").trim();
    const pin = (req.pincode || "").trim();
    const cityLower = city.toLowerCase();
    const stateLower = state.toLowerCase();

    // 1. PIN code format check
    if (!pin || !/^[1-9][0-9]{5}$/.test(pin)) {
      return {
        allowed: false,
        status: "OUT_OF_BOUNDS",
        district: "Unknown",
        state: state || "Unknown",
        pincode: pin || "",
        reason: "A valid 6-digit Indian Postal PIN code is required.",
        coordinateCheckPassed: false,
      };
    }

    const pinInt = parseInt(pin, 10);

    // 2. Heavy EPC Infrastructure Dispatch check
    if (req.dispatchCategory === "heavy_epc_infrastructure") {
      return {
        allowed: false,
        status: "BLOCKED",
        district: "Heavy EPC Sector",
        state: state || "National",
        pincode: pin,
        reason: "Heavy EPC industrial staffing is FROZEN pending tripartite EPC contractual execution (BLOCKER-03).",
        coordinateCheckPassed: false,
      };
    }

    // 3. Coordinate validation if coordinates provided
    let coordinateCheckPassed = true;
    if (req.latitude !== undefined && req.latitude !== null && req.longitude !== undefined && req.longitude !== null) {
      const lat = Number(req.latitude);
      const lng = Number(req.longitude);

      // Obvious spoofing or null island check
      if (lat === 0 && lng === 0) {
        return {
          allowed: false,
          status: "OUT_OF_BOUNDS",
          district: "Spoofed",
          state: "Spoofed",
          pincode: pin,
          reason: "Coordinate spoofing detected: (0,0) null island coordinates rejected.",
          coordinateCheckPassed: false,
        };
      }

      // India bounding box (approx 8.0N - 37.0N, 68.0E - 97.5E)
      if (lat < 8.0 || lat > 37.0 || lng < 68.0 || lng > 97.5) {
        return {
          allowed: false,
          status: "OUT_OF_BOUNDS",
          district: "Spoofed",
          state: "Spoofed",
          pincode: pin,
          reason: "Coordinates fall outside Indian territorial boundaries.",
          coordinateCheckPassed: false,
        };
      }
    }

    // 4. Check for explicitly restricted regions
    // Tripura (799001 - 799290)
    if ((pinInt >= 799001 && pinInt <= 799290) || stateLower.includes("tripura") || cityLower.includes("agartala")) {
      return {
        allowed: false,
        status: "BLOCKED",
        district: "West Tripura / Agartala",
        state: "Tripura",
        pincode: pin,
        reason: "Tripura operations are BLOCKED pending Tripura Skill Development Mission (TSDM) institutional authorization (BLOCKER-01).",
        coordinateCheckPassed,
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
      };
    }

    // 5. Match against authorized Class B districts with strict CONJUNCTION
    for (const district of AUTHORIZED_DISTRICTS) {
      const pinMatches = pinInt >= district.minPin && pinInt <= district.maxPin;

      if (pinMatches) {
        // Strict consistency check: declared state MUST match the authorized district state
        if (!stateLower.includes(district.state.toLowerCase())) {
          return {
            allowed: false,
            status: "OUT_OF_BOUNDS",
            district: district.name,
            state: state,
            pincode: pin,
            reason: `Contradictory location: PIN code ${pin} belongs to ${district.state}, but declared state is '${state}'.`,
            coordinateCheckPassed: false,
          };
        }

        // Strict consistency check: declared city must be consistent with district
        const cityConsistent = district.allowedCities.some((c) => cityLower.includes(c));
        if (!cityConsistent && city.length > 0) {
          return {
            allowed: false,
            status: "OUT_OF_BOUNDS",
            district: district.name,
            state: district.state,
            pincode: pin,
            reason: `Contradictory location: PIN code ${pin} belongs to ${district.urbanCenter}, but declared city is '${city}'.`,
            coordinateCheckPassed: false,
          };
        }

        // Verify coordinates if provided
        if (req.latitude && req.longitude) {
          const lat = Number(req.latitude);
          const lng = Number(req.longitude);
          if (
            lat < district.bounds.minLat - 0.2 ||
            lat > district.bounds.maxLat + 0.2 ||
            lng < district.bounds.minLng - 0.2 ||
            lng > district.bounds.maxLng + 0.2
          ) {
            return {
              allowed: false,
              status: "OUT_OF_BOUNDS",
              district: district.name,
              state: district.state,
              pincode: pin,
              reason: `GPS coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) do not correspond to ${district.urbanCenter}.`,
              coordinateCheckPassed: false,
            };
          }
        }

        // Passed all strict conjunction checks!
        return {
          allowed: true,
          status: "AUTHORIZED",
          district: district.name,
          state: district.state,
          pincode: pin,
          coordinateCheckPassed: true,
        };
      }
    }

    // 6. No authorized district matched
    return {
      allowed: false,
      status: "OUT_OF_BOUNDS",
      district: "Outside Operating Radius",
      state: state || "Unknown",
      pincode: pin,
      reason: `Location (PIN: ${pin}, State: ${state || "Unspecified"}) is outside authorized Class B operating geography (Guwahati Urban & Shillong Urban).`,
      coordinateCheckPassed: false,
    };
  }
}
