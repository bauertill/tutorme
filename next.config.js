/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: [
      "i.ytimg.com",
      "img.youtube.com",
      "i1.ytimg.com",
      "i2.ytimg.com",
      "i3.ytimg.com",
      "i4.ytimg.com",
    ],
  },
};

export default config;
