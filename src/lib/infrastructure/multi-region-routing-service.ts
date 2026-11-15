/**
 * Multi-Region Database Routing & Edge Cache Privacy Service
 * Pillar F: Evaluates read-replica routing consistency, enforces write-to-primary discipline,
 * and manages edge cache privacy and granular invalidation.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

export type DatabaseRegion = "primary_mumbai" | "replica_kolkata" | "replica_delhi";

export interface DatabaseRoutingDecision {
  targetRegion: DatabaseRegion;
  connectionRole: "primary_read_write" | "replica_read_only";
  reason: string;
  isStaleAllowed: boolean;
}

export interface EdgeCacheEntry {
  cacheKey: string;
  resourceType: "public_profile" | "public_catalog" | "public_stats";
  isPublicOnly: boolean;
  containsPii: false; // Invariant: Edge cache MUST NOT contain private PII
  ttlSeconds: number;
  cachedAt: number;
}

export class MultiRegionRoutingService {
  private static readonly MAX_ALLOWED_REPLICA_LAG_MS = 2000; // 2.0 seconds

  /**
   * Resolves optimal database connection node based on query criticality and regional proximity
   */
  public static routeDatabaseQuery(params: {
    operationType: "read" | "write";
    isCriticalOperation: boolean; // e.g. auth, payments, escrow, active disputes, consent
    clientRegion?: string; // e.g. "IN-AS" (Assam), "IN-ML" (Meghalaya), "IN-WB" (West Bengal)
    measuredReplicaLagMs?: number;
  }): DatabaseRoutingDecision {
    // Rule 1: All write operations MUST go to authoritative Primary
    if (params.operationType === "write") {
      return {
        targetRegion: "primary_mumbai",
        connectionRole: "primary_read_write",
        reason: "Authoritative writes must execute on primary database node.",
        isStaleAllowed: false,
      };
    }

    // Rule 2: Critical read operations (auth, financial payouts, disputes) MUST use Primary
    if (params.isCriticalOperation) {
      return {
        targetRegion: "primary_mumbai",
        connectionRole: "primary_read_write",
        reason: "Critical security and transactional reads require zero-lag consistency.",
        isStaleAllowed: false,
      };
    }

    // Rule 3: Replica lag fallback
    const replicaLag = params.measuredReplicaLagMs ?? 0;
    if (replicaLag > this.MAX_ALLOWED_REPLICA_LAG_MS) {
      return {
        targetRegion: "primary_mumbai",
        connectionRole: "primary_read_write",
        reason: `Replica lag (${replicaLag}ms) exceeds threshold (2000ms); falling back to primary.`,
        isStaleAllowed: false,
      };
    }

    // Rule 4: Eastern and North-East traffic routed to Kolkata replica for low latency
    const easternRegions = ["IN-AS", "IN-ML", "IN-TR", "IN-WB", "IN-NL", "IN-MZ"];
    if (params.clientRegion && easternRegions.includes(params.clientRegion)) {
      return {
        targetRegion: "replica_kolkata",
        connectionRole: "replica_read_only",
        reason: "Near-edge read replica in Kolkata reduces P95 latency for North-East region.",
        isStaleAllowed: true,
      };
    }

    return {
      targetRegion: "primary_mumbai",
      connectionRole: "primary_read_write",
      reason: "Default routing to primary region.",
      isStaleAllowed: false,
    };
  }

  /**
   * Evaluates whether a resource is permitted to be cached on public edge CDNs.
   * Strictly blocks private phone numbers, Aadhaar, bank records, and grievances.
   */
  public static validateEdgeCacheAdmission(resource: {
    uri: string;
    payload: Record<string, any>;
  }): { allowed: boolean; rejectionReason?: string } {
    const forbiddenPiiFields = [
      "phone",
      "phoneNumber",
      "mobile",
      "aadhaar",
      "bankAccount",
      "ifsc",
      "wageAdvanceAmount",
      "grievanceDetails",
    ];

    for (const field of forbiddenPiiFields) {
      if (field in resource.payload && resource.payload[field] !== null && resource.payload[field] !== undefined) {
        return {
          allowed: false,
          rejectionReason: `Resource '${resource.uri}' contains prohibited private field '${field}'. Edge caching strictly rejected.`,
        };
      }
    }

    // Only allow explicit public endpoints
    const allowedPathPrefixes = ["/worker/", "/explore", "/trades", "/verify/"];
    const isAllowedPath = allowedPathPrefixes.some((prefix) => resource.uri.startsWith(prefix));
    if (!isAllowedPath) {
      return {
        allowed: false,
        rejectionReason: `URI '${resource.uri}' is not in the approved public edge caching whitelist.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Generates edge cache invalidation tags based on domain events
   */
  public static generateInvalidationTags(event: {
    eventType: "profile_updated" | "consent_revoked" | "credential_suspended" | "dispute_opened";
    entityId: string;
    entitySlug?: string;
  }): string[] {
    const tags = [`entity:${event.entityId}`];
    if (event.entitySlug) {
      tags.push(`slug:${event.entitySlug}`);
    }
    tags.push(`type:${event.eventType}`);
    return tags;
  }
}
