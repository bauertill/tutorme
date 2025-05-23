import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    GOOGLE_API_KEY: z.string(),
    MISTRAL_API_KEY: z.string(),
    BLOB_READ_WRITE_TOKEN: z.string(),
    YOUTUBE_API_KEY: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    STRIPE_SUBSCRIPTION_PRICE_ID: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    REDIS_URL: z.string().url(),
    LONG_QUERY_TIME: z
      .number()
      .default(500)
      .describe("Time in ms to log long queries"),
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "query", "debug"])
      .default("info")
      .describe("Log level"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: z.string().default(""),
    NEXT_PUBLIC_REACT_SCAN_ENABLED: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_SUBSCRIPTION_PRICE_ID: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_URL: process.env.REDIS_URL,
    LONG_QUERY_TIME: process.env.LONG_QUERY_TIME,
    LOG_LEVEL: process.env.LOG_LEVEL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID:
      process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
    NEXT_PUBLIC_REACT_SCAN_ENABLED: process.env.NEXT_PUBLIC_REACT_SCAN_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
