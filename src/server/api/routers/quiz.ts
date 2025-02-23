import { z } from "zod";

import { createKnowledgeQuizAndStoreInDB } from "@/core/concept/conceptDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const quizRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const concept = await ctx.db.concept.findFirstOrThrow({
        where: { id: input.conceptId },
        include: {
          goal: true,
        },
      });
      const quiz = await createKnowledgeQuizAndStoreInDB(
        concept,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
      return quiz;
    }),
});
