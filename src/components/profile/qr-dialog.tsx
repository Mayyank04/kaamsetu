"use client";

import * as React from "react";
import { X, QrCode, ShieldCheck, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  registryId: string;
  fullName: string;
  profileUrl: string;
}

export function QRDialog({
  isOpen,
  onClose,
  registryId,
  fullName,
  profileUrl,
}: QRDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl border border-forest/20 shadow-sovereign-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2 text-forest">
            <QrCode className="w-4 h-4" />
            <span className="font-serif text-base font-bold">
              Verification QR Code
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="p-4 rounded-xl bg-ivory border-2 border-forest/20 max-w-[200px] mx-auto shadow-inner">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-forest fill-current"
          >
            {/* Scalable QR matrix mockup */}
            <rect x="5" y="5" width="25" height="25" rx="3" fill="#153E35" />
            <rect x="10" y="10" width="15" height="15" fill="#F7F5F0" />
            <rect x="14" y="14" width="7" height="7" fill="#153E35" />

            <rect x="70" y="5" width="25" height="25" rx="3" fill="#153E35" />
            <rect x="75" y="10" width="15" height="15" fill="#F7F5F0" />
            <rect x="79" y="14" width="7" height="7" fill="#153E35" />

            <rect x="5" y="70" width="25" height="25" rx="3" fill="#153E35" />
            <rect x="10" y="75" width="15" height="15" fill="#F7F5F0" />
            <rect x="14" y="79" width="7" height="7" fill="#153E35" />

            {/* Simulated data bits */}
            <rect x="35" y="10" width="6" height="6" fill="#153E35" />
            <rect x="45" y="15" width="6" height="6" fill="#153E35" />
            <rect x="55" y="10" width="6" height="6" fill="#153E35" />
            <rect x="35" y="25" width="6" height="6" fill="#153E35" />
            <rect x="50" y="25" width="6" height="6" fill="#153E35" />

            <rect x="10" y="35" width="6" height="6" fill="#153E35" />
            <rect x="25" y="35" width="6" height="6" fill="#153E35" />
            <rect x="40" y="38" width="8" height="8" rx="2" fill="#E8C999" />
            <rect x="52" y="35" width="6" height="6" fill="#153E35" />
            <rect x="65" y="38" width="6" height="6" fill="#153E35" />
            <rect x="80" y="35" width="6" height="6" fill="#153E35" />

            <rect x="35" y="55" width="6" height="6" fill="#153E35" />
            <rect x="48" y="52" width="6" height="6" fill="#153E35" />
            <rect x="62" y="55" width="6" height="6" fill="#153E35" />
            <rect x="75" y="52" width="6" height="6" fill="#153E35" />

            <rect x="35" y="72" width="6" height="6" fill="#153E35" />
            <rect x="45" y="78" width="6" height="6" fill="#153E35" />
            <rect x="58" y="72" width="6" height="6" fill="#153E35" />
            <rect x="70" y="78" width="6" height="6" fill="#153E35" />
            <rect x="85" y="72" width="6" height="6" fill="#153E35" />
          </svg>
        </div>

        <div className="space-y-1">
          <p className="font-serif font-bold text-sm text-forest">{fullName}</p>
          <p className="font-mono text-xs text-charcoal-muted">{registryId}</p>
          <p className="text-[11px] text-charcoal-muted pt-1">
            Scan with any smartphone camera to inspect the cryptographically anchored credential ledger.
          </p>
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="text-xs h-8 border-forest/20 text-forest"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy URL
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-forest text-ivory text-xs h-8 px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
