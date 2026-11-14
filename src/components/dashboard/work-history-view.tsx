"use client";

import * as React from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Copy,
  Check,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardWorkRecord } from "@/types/dashboard";

interface WorkHistoryViewProps {
  workRecords: DashboardWorkRecord[];
}

export function WorkHistoryView({ workRecords }: WorkHistoryViewProps) {
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const handleCopy = (hash: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-forest/10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-forest" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
            Verified Work History & Records
          </h2>
        </div>
        <p className="text-xs text-charcoal-muted mt-0.5">
          Immutable work experience records cryptographically signed by licensed contractors and verified clients.
        </p>
      </div>

      <div className="space-y-4">
        {workRecords.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h4 className="font-serif font-bold text-base text-forest">
                  {rec.projectTitle}
                </h4>
                <p className="text-xs font-semibold text-charcoal mt-0.5">
                  Client / Contractor: {rec.contractorOrClient}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start">
                {rec.verifiedByContractor && (
                  <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[10px] font-mono gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    CONTRACTOR SIGNED
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted font-mono">
              <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                <Calendar className="w-3 h-3 text-forest" />
                {rec.startDate} to {rec.endDate || "Present"}
              </span>

              {rec.hoursLogged && (
                <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                  <Clock className="w-3 h-3 text-forest" />
                  {rec.hoursLogged} Hours Logged
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                {rec.location}
              </span>
            </div>

            {/* Cryptographic Ledger Verification Hash */}
            {rec.verificationHash && (
              <div className="p-2.5 rounded-lg bg-forest/5 border border-forest/10 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-forest/70 truncate">
                  <Hash className="w-3.5 h-3.5 shrink-0 text-forest" />
                  <span className="text-[10px] uppercase text-charcoal-muted shrink-0">
                    Ledger Hash:
                  </span>
                  <span className="text-xs truncate text-forest font-semibold">
                    {rec.verificationHash}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(rec.verificationHash!)}
                  className="text-forest hover:text-forest-600 shrink-0 p-1 rounded"
                  title="Copy verification hash"
                >
                  {copiedHash === rec.verificationHash ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
