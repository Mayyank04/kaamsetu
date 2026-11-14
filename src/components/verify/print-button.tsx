"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintCredentialButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="w-full sm:w-auto border-forest/20 text-forest text-xs h-11 px-5"
    >
      <Printer className="w-4 h-4 mr-2" />
      Print Sovereign Credential
    </Button>
  );
}
