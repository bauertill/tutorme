import {
  createKnowledgeQuizAndStoreInDB,
  updateConceptMasteryLevel,
} from "@/core/concept/conceptDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { randomUUID } from "crypto";
import { z } from "zod";

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
  addUserResponse: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        questionId: z.string(),
        conceptId: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { quizId, questionId } = input;
      const question = await ctx.dbAdapter.getQuestionsById(questionId);
      if (!question) {
        throw new Error("Question not found");
      }
      const isCorrect = input.answer === question.correctAnswer;
      await ctx.dbAdapter.createQuestionResponse({
        id: randomUUID(),
        quizId,
        questionId,
        isCorrect,
        userId: ctx.session.user.id,
        conceptId: input.conceptId,
        answer: input.answer,
      });
    }),
  updateConceptMasteryLevel: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await updateConceptMasteryLevel(
        ctx.session.user.id,
        input.conceptId,
        ctx.dbAdapter,
      );
    }),
});
