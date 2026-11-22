"use client";

import Link from "next/link";
import { WifiOff, RotateCcw, Home, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-ivory">
      <div className="max-w-md w-full bg-background border border-forest/15 rounded-sm p-6 sm:p-8 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-forest/10 flex items-center justify-center text-forest mb-4">
          <WifiOff className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-forest mb-2">
          You are Offline
        </h1>

        <p className="text-sm text-charcoal/80 mb-6 leading-relaxed">
          KAAMSETU is temporarily unable to connect to the network. Your saved profile drafts are safely stored on your device.
        </p>

        <div className="bg-forest/5 border border-forest/10 rounded-xs p-3.5 mb-6 text-left">
          <span className="text-xs font-bold text-forest uppercase tracking-wider block mb-1">
            Worker Advisory
          </span>
          <p className="text-xs text-charcoal/80 leading-normal">
            When you return online, your drafts and profile edits will automatically sync with the registry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-forest hover:bg-forest/90 text-ivory text-sm font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Connection
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-forest/20 text-forest hover:bg-forest/5 text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-forest/10 text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Need urgent support? Call Pilot Desk: 1800-KAAMSETU</span>
        </div>
      </div>
    </div>
  );
}
