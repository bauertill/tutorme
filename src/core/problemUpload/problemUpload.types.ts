import { z } from "zod";

export const ProblemUploadStatus = z.enum([
  "PENDING",
  "SUCCESS",
  "ERROR",
  "CANCELLED",
]);

export type ProblemUploadStatus = z.infer<typeof ProblemUploadStatus>;

export const ProblemUpload = z.object({
  id: z.string(),
  fileName: z.string(),
  nRecords: z.number(),
  fileSize: z.number(),
  status: ProblemUploadStatus,
  error: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProblemUpload = z.infer<typeof ProblemUpload>;
