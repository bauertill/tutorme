import { exerciseRouter } from "@/server/api/routers/exercise";
import { problemRouter } from "@/server/api/routers/problem";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { renderAsyRouter } from "./routers/renderAsy";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  problem: problemRouter,
  renderAsy: renderAsyRouter,
  exercise: exerciseRouter,
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
