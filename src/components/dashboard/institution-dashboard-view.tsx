"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  MapPin,
  TrendingUp,
  FileCheck2,
  Users,
  Award,
} from "lucide-react";
import { Institution, CohortWithMetrics } from "@/types/institution";

interface InstitutionDashboardViewProps {
  institution: Institution;
  cohorts: CohortWithMetrics[];
  aggregateMetrics: {
    totalInstitutions: number;
    operationalPartners: number;
    activeCohorts: number;
    totalEnrolledWorkers: number;
    totalConsentedWorkers: number;
    credentialsIssued: number;
    districtsCovered: string[];
    tradesCovered: string[];
  };
}

export function InstitutionDashboardView({
  institution,
  cohorts,
  aggregateMetrics,
}: InstitutionDashboardViewProps) {
  const [selectedCohort, setSelectedCohort] = useState<CohortWithMetrics>(cohorts[0]);

  const consentPercentage = Math.round(
    (aggregateMetrics.totalConsentedWorkers / aggregateMetrics.totalEnrolledWorkers) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Institutional Mission Header */}
      <div className="bg-white rounded-2xl border border-sand-200/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-forest-900 text-sand-300 flex items-center justify-center font-bold text-2xl shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 font-serif">
                  {institution.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Status: {institution.partner_status.replace("_", " ")}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sand-100 text-sand-800 border border-sand-300 capitalize">
                  <Building className="w-3.5 h-3.5 text-sand-700" />
                  {institution.institution_type.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-forest-700/80 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  {institution.district}, {institution.state}
                </span>
                <span className="text-xs text-forest-600">
                  Contact: {institution.contact_email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-forest-50 text-forest-800 border border-forest-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-forest-600" />
              DPDP Act 2023 Compliant Consent Vault
            </span>
          </div>
        </div>

        {/* Institutional Mission Note */}
        <div className="mt-6 pt-6 border-t border-sand-100 text-xs text-forest-700/90 leading-relaxed bg-ivory-50/70 p-4 rounded-xl border border-sand-200/50">
          <strong>Institutional Partnership Contract:</strong> KAAMSETU connects state vocational institutes, ITIs, and polytechnics to informal workforce certification. Trainee digital skill identities belong solely to the workers; institutional verification asserts certified course completion, apprenticeship hours, and skill assessments.
        </div>
      </div>

      {/* Aggregate Outcomes Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{aggregateMetrics.totalEnrolledWorkers}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Enrolled Trainees
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{consentPercentage}%</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Granular Consent Rate
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sand-50 text-sand-800 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{aggregateMetrics.credentialsIssued}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Issued Skill Credentials
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{aggregateMetrics.districtsCovered.length}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Districts in Assam Pilot
            </div>
          </div>
        </div>
      </div>

      {/* Assam Regional Expansion Badges */}
      <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm space-y-3">
        <div className="text-xs font-bold text-forest-800 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-forest-600" />
          Assam District Footprint & Expansion Target Hubs
        </div>
        <div className="flex flex-wrap gap-2">
          {aggregateMetrics.districtsCovered.map((district) => (
            <span
              key={district}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-forest-50 text-forest-800 border border-forest-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              {district}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sand-50 text-sand-800 border border-sand-300">
            <MapPin className="w-3.5 h-3.5 text-sand-600" />
            Udalguri (Next Stage Expansion)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sand-50 text-sand-800 border border-sand-300">
            <MapPin className="w-3.5 h-3.5 text-sand-600" />
            Sonitpur / Tezpur (Q3 Expansion)
          </span>
        </div>
      </div>

      {/* Cohorts & Training Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cohort Selector / List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-forest-950">Active Vocational Cohorts</h2>
          <div className="space-y-3">
            {cohorts.map((cohort) => {
              const isSelected = selectedCohort?.id === cohort.id;
              const fillPercentage = Math.round((cohort.enrolledCount / cohort.target_capacity) * 100);

              return (
                <div
                  key={cohort.id}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-forest-700 bg-forest-50/50 shadow-sm ring-1 ring-forest-700"
                      : "border-sand-200 bg-white hover:border-sand-400"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-forest-950 text-sm">{cohort.name}</h3>
                      <p className="text-xs text-forest-600 mt-0.5">{cohort.trade}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-forest-100 text-forest-800">
                      {cohort.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-forest-700 font-medium">
                      <span>Enrollment</span>
                      <span>
                        {cohort.enrolledCount} / {cohort.target_capacity} ({fillPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-sand-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-forest-700 h-full rounded-full"
                        style={{ width: `${Math.min(100, fillPercentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-forest-600 pt-3 border-t border-sand-100">
                    <span>{cohort.start_date} to {cohort.end_date || "Present"}</span>
                    <span className="font-semibold text-emerald-700">
                      {cohort.credentialsIssuedCount} Certified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Cohort Detail & Participant Privacy View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200/60 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand-100">
            <div>
              <div className="text-xs uppercase font-bold text-forest-600 tracking-wider">
                Cohort Dossier
              </div>
              <h3 className="text-xl font-bold text-forest-950 font-serif mt-1">
                {selectedCohort.name}
              </h3>
              <p className="text-xs text-forest-700 mt-0.5">
                Target Capacity: {selectedCohort.target_capacity} Trainees • Trade: {selectedCohort.trade}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Award className="w-3.5 h-3.5" />
                {selectedCohort.credentialsIssuedCount} Credentials Minted
              </span>
            </div>
          </div>

          {/* Participant Consent View Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-forest-950">
                Participant Progression & Consent Status
              </h4>
              <span className="text-xs text-forest-600">
                Showing consented & privacy-masked trainees
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory-50 text-forest-800 text-xs uppercase tracking-wider border-b border-sand-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Trainee</th>
                    <th className="py-3 px-4 font-semibold">Consent Status</th>
                    <th className="py-3 px-4 font-semibold">Course Completion</th>
                    <th className="py-3 px-4 font-semibold">Digital Credential</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100 text-xs">
                  <tr className="hover:bg-ivory-50/60">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-forest-950">Rameshwar Sharma</div>
                      <div className="text-forest-600 text-[11px]">Jaipur • Electrical & Solar</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Consent Granted
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-forest-900">
                      100% Completed (320 hrs)
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-forest-700 bg-sand-50 px-2 py-0.5 rounded border border-sand-200">
                        IN-RJ-2026-4029-KS
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-ivory-50/60">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-forest-950">Sunita Devi</div>
                      <div className="text-forest-600 text-[11px]">Varanasi • Handloom Artisan</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Consent Granted
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-forest-900">
                      100% Completed (280 hrs)
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-forest-700 bg-sand-50 px-2 py-0.5 rounded border border-sand-200">
                        IN-UP-2026-7819-KS
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-ivory-50/60 bg-sand-50/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-forest-700 italic">
                        Private Trainee #TR-AS-04
                      </div>
                      <div className="text-forest-500 text-[11px]">
                        Guwahati • Consent Masked
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sand-100 text-sand-800 border border-sand-300">
                        <Lock className="w-3 h-3 text-sand-600" />
                        Consent Pending
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-forest-700">
                      In Progress (85 hrs)
                    </td>
                    <td className="py-3 px-4 text-forest-500 italic">
                      Pending Consent
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
