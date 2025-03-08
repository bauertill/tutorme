import { z } from "zod";

import {
  addUserInputToLesson,
  createLesson,
  createLessonsForConcept,
  getLessonsByConceptId,
} from "@/core/lesson/lessonDomain";
import { findEducationalVideo } from "@/core/video/videoDomain";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const learningRouter = createTRPCRouter({
  /**
   * Search for educational videos on YouTube
   */
  searchEducationalVideo: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return findEducationalVideo(
        input.conceptId,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.youtubeAdapter,
      );
    }),

  /**
   * Create a new lesson for a concept
   */
  createLesson: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return createLesson(
        input.conceptId,
        ctx.session.user.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),

  /**
   * Create lessons for a concept
   */
  createLessonsForConcept: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return createLessonsForConcept(
        input.conceptId,
        ctx.session.user.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),

  onLessonGenerated: protectedProcedure
    .input(z.object({ conceptId: z.string() }))
    .subscription(async function* ({ ctx, input, signal }) {
      const it = ctx.pubsubAdapter.subscribeIterator({
        channel: "lesson:generated",
        key: input.conceptId,
        signal,
      });
      for await (const lesson of it) {
        yield lesson;
      }
    }),
  /**
   * Get all lessons for a concept
   */
  getLessonsByConceptId: protectedProcedure
    .input(
      z.object({
        conceptId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await getLessonsByConceptId(
        input.conceptId,
        ctx.session.user.id,
        ctx.dbAdapter,
        ctx.llmAdapter,
        ctx.pubsubAdapter,
      );
    }),

  /**
   * Submit a user response to a lesson exercise
   */
  submitLessonResponse: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        userInput: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return addUserInputToLesson(
        input.lessonId,
        ctx.session.user.id,
        input.userInput,
        ctx.dbAdapter,
        ctx.llmAdapter,
      );
    }),
});
