"use client";
import { env } from "@/env";
import { useEffect } from "react";
import TagManager from "react-gtm-module";
const tagManagerArgs = {
  gtmId: env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
};

export default function GoogleTagManager() {
  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);

  return null;
}
