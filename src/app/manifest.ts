import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tutor Me Good",
    short_name: "Tutor Me Good",
    description: "A tool to help you learn math",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/graduation-cap.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
