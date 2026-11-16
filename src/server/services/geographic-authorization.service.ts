/**
 * KAAMSETU — Geographic Authorization Domain Service
 * Enforces controlled rollout boundaries for CLASS_B_CONTROLLED_ROLLOUT:
 * - Guwahati Urban, Kamrup Metropolitan, Assam
 * - Shillong Urban, East Khasi Hills, Meghalaya
 */

import {
  GeographicAuthorizationService as CoreGeoService,
  LocationValidationRequest,
  LocationValidationResult,
} from "@/lib/geo/geographic-authorization-service";
import { AuthorizationError, ValidationError } from "@/lib/errors/app-error";

export class GeographicAuthorizationService {
  /**
   * Validates geographic coordinates and postal district eligibility
   */
  public static validateLocation(request: LocationValidationRequest): LocationValidationResult {
    if (!request.city && !request.pincode) {
      throw new ValidationError("City or PIN code is required for geographic validation", {
        field: "location",
      });
    }
    return CoreGeoService.validateLocation(request);
  }

  /**
   * Asserts that a location is within authorized rollout bounds; throws AuthorizationError if not.
   */
  public static assertWithinRolloutBounds(request: LocationValidationRequest): LocationValidationResult {
    const result = this.validateLocation(request);
    if (!result.allowed) {
      throw new AuthorizationError(
        result.reason || `Location is outside authorized rollout boundaries (${result.status})`
      );
    }
    return result;
  }

  /**
   * Returns list of currently authorized operating districts
   */
  public static getAuthorizedDistricts() {
    return [
      {
        district: "Kamrup Metropolitan",
        urbanCenter: "Guwahati Urban",
        state: "Assam",
        pinRange: "781001-781039",
      },
      {
        district: "East Khasi Hills",
        urbanCenter: "Shillong Urban",
        state: "Meghalaya",
        pinRange: "793001-793022",
      },
    ];
  }
}
