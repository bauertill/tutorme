"use client";
// react-scan must be imported before react
import { scan } from "react-scan";

import { env } from "@/env";
import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    if (env.NEXT_PUBLIC_REACT_SCAN_ENABLED) {
      scan({
        enabled: true,
      });
    }
  }, []);

  return <></>;
}
