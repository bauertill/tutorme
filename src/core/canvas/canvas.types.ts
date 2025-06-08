import { z } from "zod";

export const Point = z.object({
  x: z.number(),
  y: z.number(),
});
export const Path = z.array(Point);
export const Canvas = z.object({
  paths: z.array(Path),
});
export type Canvas = z.infer<typeof Canvas>;
