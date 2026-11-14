"use client";

import * as React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F7F5F0] text-[#171D1A] font-sans p-4">
        <div className="w-full max-w-md rounded-md border border-[#153E35]/20 bg-white p-8 shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xs bg-[#C46849]/15 text-[#C46849] mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#153E35] mb-2">
            System Level Exception
          </h2>
          <p className="text-xs text-[#414846] mb-6">
            A root-level layout disruption occurred. Please refresh the sovereign portal.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xs bg-[#153E35] text-[#F7F5F0] px-5 py-2.5 text-xs font-semibold hover:bg-[#1A4B40] transition-colors"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
