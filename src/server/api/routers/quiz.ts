import {
  addUserResponseToQuiz,
  createKnowledgeQuizAndStoreInDB,
} from "@/core/concept/conceptDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const quizRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const concept = await ctx.dbAdapter.getConceptWithGoalByConceptId(
        input.conceptId,
      );
      const quiz = await createKnowledgeQuizAndStoreInDB(
        concept,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
      return quiz;
    }),
  addUserResponse: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        questionId: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quiz = await addUserResponseToQuiz(
        ctx.session.user.id,
        input.quizId,
        input.questionId,
        input.answer,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
      return quiz;
    }),
});
