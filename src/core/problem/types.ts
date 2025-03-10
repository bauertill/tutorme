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

export const Problem = z.object({
  id: z.string(),
  dataSource: z.string(),
  problem: z.string(),
  solution: z.string(),
  level: z.string(),
  type: z.string(),
  createdAt: z.date(),
});

export type Problem = z.infer<typeof Problem>;

export type ProblemQueryResult = {
  problem: Problem;
  score: number;
};


// export type UserProblem = {

//   id                String            @id @default(cuid())
//   problem           String
//   referenceSolution String
//   isCorrect         Boolean
//   status            UserProblemStatus @default(INITIAL)
//   createdAt         DateTime          @default(now())
//   updatedAt         DateTime          @updatedAt

//   userId String
//   user   User   @relation(fields: [userId], references: [id])

//   @@index([userId])
// }
export const UserProblem = z.object({
  id: z.string(),
  problem: z.string(),
  referenceSolution: z.string(),
  isCorrect: z.boolean(),
  status: z.enum(["INITIAL", "IN_PROGRESS", "SOLVED", "FAILED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProblem = z.infer<typeof UserProblem>;

export const UserProblemDraft = UserProblem.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UserProblemDraft = z.infer<typeof UserProblemDraft>;
