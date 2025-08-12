"use client";
import { env } from "@/env";
import { useCallback, useEffect } from "react";
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
};

export type EventName =
  | "clicked_example_assignment_card"
  | "uploaded_assignment"
  | "clicked_check_solution"
  | "opened_helpbox";

export function GoogleTagManager() {
  useEffect(() => {
    // Only initialize if GTM ID is provided
    if (env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID) {
      TagManager.initialize(tagManagerArgs);
    }
  }, []);

  return null;
}

export const useTrackEvent = () => {
  const track = useCallback((eventName: EventName, data = {}) => {
    // Only track if GTM ID is provided
    if (env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID) {
      TagManager.dataLayer({
        dataLayer: {
          event: eventName,
          ...data,
        },
      });
    }
  }, []);

  return track;
};
