"use client";

import * as React from "react";
import { ShieldAlert, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log exception to error monitoring service if needed
    console.error("Critical Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-md border border-forest/15 bg-card p-8 shadow-sovereign-md text-center">
        {/* Emblem */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-terracotta/15 border border-terracotta/30 text-terracotta mb-5">
          <ShieldAlert className="h-7 w-7 text-terracotta" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta">
            System Anomaly Intercepted
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-forest">
            An unexpected error occurred
          </h1>
          <p className="text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
            The platform encountered an issue while rendering this view. Your session credentials and registry identity remain secure.
          </p>
        </div>

        {/* Technical Digest */}
        {error.digest && (
          <div className="my-5 p-3 rounded-xs bg-forest/5 border border-forest/10 font-mono text-xs text-charcoal-subtle">
            Error Digest ID: <span className="font-semibold text-forest">{error.digest}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Component
          </Button>
          <Button
            variant="secondary"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Registry
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
