import { conceptRouter } from "@/server/api/routers/concept";
import { goalRouter } from "@/server/api/routers/goal";
import { quizRouter } from "@/server/api/routers/quiz";
import { learningRouter } from "@/server/api/routers/learning";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  goal: goalRouter,
  concept: conceptRouter,
  quiz: quizRouter,
  learning: learningRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
