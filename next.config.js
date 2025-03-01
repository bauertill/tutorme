/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      { hostname: "i.ytimg.com" },
      { hostname: "img.youtube.com" },
      { hostname: "i1.ytimg.com" },
      { hostname: "i2.ytimg.com" },
    ],
  },
};

export default config;
