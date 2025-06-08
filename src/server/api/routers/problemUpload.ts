import {
  cancelProblemUpload,
  createProblemsFromCsv,
  deleteProblemUpload,
  getProblemUploadFiles,
} from "@/core/problemUpload/problemUpload.domain";
import { createTRPCRouter, protectedAdminProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const problemUploadRouter = createTRPCRouter({
  upload: protectedAdminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        base64EncodedContents: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const csv = Buffer.from(input.base64EncodedContents, "base64").toString(
        "utf-8",
      );
      return await createProblemsFromCsv({ ...input, csv }, ctx.dbAdapter);
    }),
  cancelUpload: protectedAdminProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await cancelProblemUpload(input.uploadId, ctx.dbAdapter);
    }),
  getUploadFiles: protectedAdminProcedure.query(async ({ ctx }) => {
    return await getProblemUploadFiles(ctx.dbAdapter);
  }),
  deleteUpload: protectedAdminProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteProblemUpload(input.uploadId, ctx.dbAdapter);
    }),
});
