"use client";

import * as React from "react";
import { registerAndroidBackButtonHandler } from "@/lib/platform/runtime";

export function PlatformRuntimeBridge() {
  React.useEffect(() => {
    const unregister = registerAndroidBackButtonHandler();
    return () => {
      unregister();
    };
  }, []);

  return null;
}
