import { z } from "zod";

export const Language = z.enum(["de", "en"]);
export type Language = z.infer<typeof Language>;

export const LanguageName: Record<Language, string> = {
  de: "German",
  en: "English",
};
