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
 * - All other districts: Out of bounds (Rejected with 403)
 */

export interface LocationValidationRequest {
  city: string;
  state: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

// Authorized Class B Operating Districts
const AUTHORIZED_DISTRICTS = [
  {
    name: "Kamrup Metropolitan",
    urbanCenter: "Guwahati Urban",
    state: "Assam",
    pinPrefixes: ["78100", "78101", "78102", "78103"],
    bounds: { minLat: 26.05, maxLat: 26.25, minLng: 91.60, maxLng: 91.90 },
  },
  {
    name: "East Khasi Hills",
    urbanCenter: "Shillong Urban",
    state: "Meghalaya",
    pinPrefixes: ["79300", "79301", "79302"],
    bounds: { minLat: 25.50, maxLat: 25.65, minLng: 91.80, maxLng: 91.95 },
  },
];

export class GeographicAuthorizationService {
  /**
   * Validates location against strict regional operating rules.
   */
  public static validateLocation(req: LocationValidationRequest): LocationValidationResult {
    const city = (req.city || "").trim();
    const state = (req.state || "").trim();
    const pin = (req.pincode || "").trim();

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

    // 2. Coordinate spoofing check if coordinates are provided
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

    // 3. Check for explicitly restricted regions
    const pinInt = parseInt(pin, 10);

    // Tripura (799001 - 799290)
    if ((pinInt >= 799001 && pinInt <= 799290) || state.toLowerCase().includes("tripura") || city.toLowerCase().includes("agartala")) {
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
    if ((pinInt >= 734001 && pinInt <= 734014) || city.toLowerCase().includes("siliguri")) {
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

    // 4. Match against authorized Class B districts
    for (const district of AUTHORIZED_DISTRICTS) {
      const pinMatches = district.pinPrefixes.some((pfx) => pin.startsWith(pfx));
      const textMatches =
        state.toLowerCase().includes(district.state.toLowerCase()) &&
        (city.toLowerCase().includes(district.urbanCenter.toLowerCase().split(" ")[0]) ||
         city.toLowerCase().includes(district.name.toLowerCase().split(" ")[0]));

      if (pinMatches || textMatches) {
        // If coordinates provided, verify within regional bounding box
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
              reason: `GPS coordinates [${lat}, ${lng}] do not match authorized district boundaries for ${district.urbanCenter}.`,
              coordinateCheckPassed: false,
            };
          }
        }

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

    // 5. Default: Region outside authorized Class B controlled rollout
    return {
      allowed: false,
      status: "OUT_OF_BOUNDS",
      district: city || "Unregistered District",
      state: state || "External State",
      pincode: pin,
      reason: `Location '${city}, ${state}' (PIN ${pin}) is outside the currently authorized Class B rollout zone (Guwahati Urban & Shillong Urban).`,
      coordinateCheckPassed,
    };
  }
}
