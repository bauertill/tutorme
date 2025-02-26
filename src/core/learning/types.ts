import { z } from "zod";

export const EducationalVideo = z.object({
  // @TODO consider adding a youtubeId field instead of id
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  thumbnailUrl: z.string(),
  duration: z.number(),
  channelTitle: z.string(),
});
export type EducationalVideo = z.infer<typeof EducationalVideo>;

// @TODO Video detail type
