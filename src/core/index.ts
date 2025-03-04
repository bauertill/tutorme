import { z } from "zod";

export const GenerationStatus = z.enum(["GENERATING", "COMPLETED", "FAILED"]);
export type GenerationStatus = z.infer<typeof GenerationStatus>;

export const generationCompletedToken = "GENERATION_COMPLETED";
export type GenerationCompletedToken = typeof generationCompletedToken;
