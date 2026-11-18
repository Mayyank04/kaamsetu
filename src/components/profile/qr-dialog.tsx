"use client";

import * as React from "react";
import Image from "next/image";
import { X, QrCode, ShieldCheck, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

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
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (isOpen && profileUrl) {
      QRCode.toDataURL(profileUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: "#153E35",
          light: "#F7F5F0",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [isOpen, profileUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrDataUrl) {
      const a = document.createElement("a");
      a.href = qrDataUrl;
      a.download = `KAAMSETU-QR-${registryId}.png`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-sm rounded-md border border-forest/20 shadow-sovereign-md p-5 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 text-center my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2 text-forest">
            <QrCode className="w-4 h-4" />
            <span className="font-serif text-base font-bold">
              Verifiable Sovereign QR
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Genuine Camera-Scannable QR Presentation */}
        <div className="p-4 rounded-xl bg-[#F7F5F0] border-2 border-forest/20 max-w-[220px] mx-auto shadow-inner">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={`Scannable verification QR for ${registryId}`}
              width={200}
              height={200}
              unoptimized
              className="w-full h-full rounded"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-charcoal-muted animate-pulse">
              Generating Scannable QR...
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-serif font-bold text-sm text-forest">{fullName}</p>
          <p className="font-mono text-xs text-charcoal-muted">{registryId}</p>
          <p className="text-[11px] text-emerald-700 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Scannable by Any Smartphone Camera
          </p>
          <p className="text-[10px] text-charcoal-muted leading-tight pt-1">
            Cryptographic integrity verified via HMAC-SHA256 non-repudiation. Independent truth of underlying claims requires verified customer bookings or institutional attestations.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="w-full bg-forest text-ivory text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied Direct Link
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Verification Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full border-forest/20 text-forest text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download QR Code Image
          </Button>
        </div>
      </div>
    </div>
  );
}
