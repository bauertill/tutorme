"use client";
import { straightenImage } from "@/lib/image-processing/straightenImage";
import type { OpenCV } from "@opencvjs/types";
import Script from "next/script";
import { createContext, useCallback, useContext, useState } from "react";

// context
const OpenCVContext = createContext<typeof OpenCV | null>(null);

export function OpenCVProvider({ children }: { children: React.ReactNode }) {
  const [cv, setCv] = useState<typeof OpenCV | null>(null);
  const onLoad = useCallback(async () => {
    const opencvPromise =
      "cv" in window ? (window.cv as Promise<typeof OpenCV>) : null;
    if (!opencvPromise) {
      throw new Error("OpenCV.js is not loaded");
    }
    const opencv = await opencvPromise;
    if (!opencv) {
      throw new Error("OpenCV.js is not loaded");
    }
    console.log("OpenCV.js is loaded!", opencv);
    setCv(opencv);
  }, []);
  return (
    <OpenCVContext.Provider value={cv}>
      <Script
        src="https://docs.opencv.org/4.11.0/opencv.js"
        type="text/javascript"
        onLoad={() => void onLoad()}
      />
      {children}
    </OpenCVContext.Provider>
  );
}

export function useOpenCV() {
  const cv = useContext(OpenCVContext);
  if (!cv) {
    return { status: "loading" };
  }
  return {
    status: "loaded",
    cv,
    preprocessImage: (file: File) => straightenImage(file, cv),
  };
}
