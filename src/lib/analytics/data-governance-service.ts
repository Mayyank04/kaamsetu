/**
 * Data Governance & AI Accuracy Service
 * Pillar I: Implements event provenance hashing, test vs production separation,
 * voice AI audit trails, and strict non-invention validation.
 */

import crypto from "crypto";

export interface AnalyticsProvenanceInput {
  eventName: string;
  entityType: "worker" | "contractor" | "institution" | "booking" | "match" | "opportunity";
  entityId: string;
  regionCode: string;
  isSimulated?: boolean;
  modelVersion?: string;
  promptVersion?: string;
  extractionConfidence?: number;
  workerConfirmed?: boolean;
  workerCorrected?: boolean;
  metadata?: Record<string, any>;
}

export interface VoiceExtractionAuditRecord {
  transcriptText: string;
  language: "as" | "hi" | "en" | "bn" | "kha";
  extractedName?: string | null;
  extractedYearsOfExperience?: number | null;
  extractedDailyRate?: number | null;
  extractedTools: string[];
  extractedCertifications: string[];
  confidenceScore: number; // 0.0 - 1.0
  workerConfirmed: boolean;
  workerCorrectedFields: string[];
}

export function generateEventProvenanceHash(event: AnalyticsProvenanceInput): string {
  const normalized = {
    eventName: event.eventName,
    entityType: event.entityType,
    entityId: event.entityId,
    regionCode: event.regionCode,
    isSimulated: Boolean(event.isSimulated),
  };
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export function validateAiNonInventionInvariant(audit: VoiceExtractionAuditRecord): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check if unmentioned experience was hallucinated
  if (!audit.transcriptText.toLowerCase().includes("year") &&
      !audit.transcriptText.includes("साल") &&
      !audit.transcriptText.includes("বছৰ")) {
    if (audit.extractedYearsOfExperience !== null && audit.extractedYearsOfExperience !== undefined) {
      violations.push(
        `Non-invention violation: Experience years was extracted as ${audit.extractedYearsOfExperience} but no experience keywords exist in transcript.`
      );
    }
  }

  // Check if unmentioned rates were hallucinated
  if (!audit.transcriptText.toLowerCase().includes("rupee") &&
      !audit.transcriptText.includes("रुपये") &&
      !audit.transcriptText.includes("টকা") &&
      !audit.transcriptText.includes("₹")) {
    if (audit.extractedDailyRate !== null && audit.extractedDailyRate !== undefined) {
      violations.push(
        `Non-invention violation: Daily rate was extracted as ${audit.extractedDailyRate} but no currency mentions exist in transcript.`
      );
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

export function auditProductionDataSeparation(events: AnalyticsProvenanceInput[]): {
  realEventsCount: number;
  simulatedEventsCount: number;
  candidateRegionContamination: boolean;
} {
  let realCount = 0;
  let simulatedCount = 0;
  let contaminated = false;

  for (const e of events) {
    if (e.isSimulated) {
      simulatedCount++;
    } else {
      realCount++;
      // Candidate regions (Tripura, North Bengal, Nagaland) cannot have real production analytics events
      if (e.regionCode === "IN-TR" || e.regionCode === "IN-WB-NB" || e.regionCode === "IN-NL") {
        contaminated = true;
      }
    }
  }

  return {
    realEventsCount: realCount,
    simulatedEventsCount: simulatedCount,
    candidateRegionContamination: contaminated,
  };
}
